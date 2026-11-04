import { Typography } from '@mui/material';
import { CategoryEntityEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import {
  FiClock, FiFileText, FiImage, FiSearch, FiToggleRight,
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';


import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import PreviewSections from '@/components/layouts/PreviewSections';
import {
  CMS_HISTORY_AUTHOR_FIELDS, defaultUserEventFields, USER_EVENT_COLORS,
} from '@/constants/_core/app.constants';
import { PREVIEW_IMAGE_WIDTH } from '@/constants/_core/ui.constants';
import CategoryFormDialog from '@/containers/_core/categories/categoryForm/CategoryFormDialog';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import History from '@/containers/_core/History';
import { useProtect } from '@/hooks/_core/useProtect';
import { useToggle } from '@/hooks/_core/useToggle';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import { deleteCategory, editCategory, goToCategories } from '@/redux/actions/_core/category.action';
import { toggleUsersNotification } from '@/redux/actions/_core/user.action';
import { goToList } from '@/redux/actions/_core/util.action';
import { getCategoryCategorySelector } from '@/redux/reducers/_core/category.reducer';
import { IPreviewSection, ISelectOption } from '@/types/_core/app.type';
import { ICategory, ICategoryInput, ICategoryTranslatedFields } from '@/types/_core/category.type';
import { getCategoryEntityLabel } from '@/utils/_core/cms.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { getServerUrl } from '@/utils/_core/utils';


const Category = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const category = useSelector(getCategoryCategorySelector);
  const {
    open: openEditionDialog, toggle: toggleEditionDialog,
  } = useToggle();

  const {
    canDelete, canFind,
  } = useProtect('Category');

  // get translated fields depending on the selected language (tabs)
  const {
    translatedFields, onTabChange, tab,
  } = useTranslatedValuesByTab<ICategoryTranslatedFields>(category?.translated, ['name', 'slug']);

  if (!category) return null;

  const infosItems: ISelectOption[] = [
    {
      label: t('cms:name'),
      value: translatedFields.name,
    },
    {
      label: t('cms:category.categoryFor'),
      value: getCategoryEntityLabel(category.entity),
    },
    {
      label: t('common:createdAt'),
      value: displayDate(category.createdAt),
    },
    {
      label: t('common:updatedAt'),
      value: displayDate(category.updatedAt),
    },
    {
      label: t('common:deletedAt'),
      value: displayDate(category.deletedAt),
      hide: !(category.deletedAt !== undefined),
    },
  ];

  const seoItems: ISelectOption[] = [
    {
      label: `Slug (${t('common:uniqueUrl', { theEntity: t('cms:category.theCategory') })})`,
      value: getServerUrl() + '/../../' + translatedFields.slug,
    },
  ];

  const statusItems: ISelectOption<ReactNode>[] = [
    {
      label: t('common:active'),
      value: <BooleanIcons value={category.active} />,
    },
  ];


  const handleSubmitCategory = (values: ICategoryInput) => {
    dispatch(editCategory(category.id, values, category.updatedAt));
    toggleEditionDialog();
  };


  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToCategories());
  };

  // everything filed under this category, with the columns and the row actions the list has
  const handleGoToCategoryArticles = () => {
    navigate(goToList('articles', { category: category.id }));
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await dispatch(deleteCategory(category.id));
    navigate(goToCategories());
  };

  // for notification
  const togglePublish = () => {
    dispatch(toggleUsersNotification([category.id], !category.active));
  };

  const sections: IPreviewSection[] = [
    {
      id: 'details',
      label: t('common:details'),
      icon: <FiFileText />,
      content: <Items items={infosItems} />,
    },
    {
      id: 'seo',
      label: t('cms:seo'),
      icon: <FiSearch />,
      helperText: t('cms:seoDescription'),
      content: <Items items={seoItems} />,
    },
    {
      id: 'image',
      label: t('common:image'),
      icon: <FiImage />,
      content: category.image
        ? (
          <div css={{ width: PREVIEW_IMAGE_WIDTH }}>
            <img alt={translatedFields.name} css={{ width: '100%' }} src={(category.image).url} />
          </div>
        )
        : (
          <Typography>{t('common:errors.noField', { field: t('common:image') })}</Typography>
        ),
    },
    {
      id: 'status',
      label: t('common:status'),
      icon: <FiToggleRight />,
      content: <ItemsStatus entity={category} items={statusItems} />,
    },
    {
      id: 'history',
      label: t('common:history'),
      icon: <FiClock />,
      content: (
        <History<ICategory>
          authorFields={CMS_HISTORY_AUTHOR_FIELDS}
          colors={USER_EVENT_COLORS}
          fields={defaultUserEventFields}
          parseObj={category}
          translationKey="project:eventsHistory"
        />
      ),
    },
  ];

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: category.active
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: category.active
        ? <FaCheck />
        : <FaCheckDouble />,
    },
    {
      onClick: handleGoToCategoryArticles,
      // a category is filed under one kind of content — offering the article list on any other lies
      display: category.entity === CategoryEntityEnum.ARTICLE,
      label: t('cms:category.viewCategoryArticles'),
      icon: <FiFileText />,
    },
  ];

  return (
    <Layout
      isCard={false}
      pretitle={t('cms:category.category')}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          label={translatedFields.name}
          menus={menus}
          onDelete={handleDelete}
          onEdit={toggleEditionDialog}
          type="preview"
        />
      )}
      title={(
        <>
          <span>{translatedFields.name} ({getCategoryEntityLabel(category.entity)})</span>
          <PublishedChip published={category.active} />
        </>
      )}
    >
      <Head title={translatedFields.name} />

      <PreviewSections
        header={<TranslationTabs onTabChange={onTabChange} tab={tab} />}
        sections={sections}
      />

      <CategoryFormDialog
        category={category}
        onClose={toggleEditionDialog}
        onSubmit={handleSubmitCategory}
        open={openEditionDialog}
      />
    </Layout>
  );
};

export default Category;
