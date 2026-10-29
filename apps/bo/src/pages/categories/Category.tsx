import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';


import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import Dialog from '@/components/Dialog';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import CategoryForm from '@/containers/categories/CategoryForm';
import UserInfo from '@/containers/users/UserInfos';
import UsersForEntity from '@/containers/users/UsersForEntity';
import { useProtect } from '@/hooks/useProtect';
import { useToggle } from '@/hooks/useToggle';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { deleteCategory, editCategory, goToCategories } from '@/redux/actions/category.action';
import { toggleUsersNotification } from '@/redux/actions/user.action';
import { getCategoryCategorySelector } from '@/redux/reducers/category.reducer';
import { ISelectOption } from '@/types/app.type';
import { ICategory, ICategoryInput, ICategoryTranslatedFields } from '@/types/category.type';
import { getCategoryEntityLabel } from '@/utils/cms.utils';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { getServerUrl } from '@/utils/utils';

const CATEGORY_FORM_ID = 'category-form-id';

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
  } = useTranslatedValuesByTab<ICategoryTranslatedFields>(category?.get('translated'), ['name', 'slug']);

  if (!category) return null;

  const infosItems: ISelectOption[] = [
    {
      label: t('cms:name'),
      value: translatedFields.name,
    },
    {
      label: t('cms:category.categoryFor'),
      value: getCategoryEntityLabel(category.get('entity')),
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
      value: displayDate(category.get('deletedAt')),
      hide: !category.has('deletedAt'),
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
      value: <BooleanIcons value={category.get('active')} />,
    },
  ];


  const handleSubmitCategory = (values: ICategoryInput) => {
    dispatch(editCategory(category.id, values));
    toggleEditionDialog();
  };


  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToCategories());
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await dispatch(deleteCategory(category.id));
    navigate(goToCategories());
  };

  // for notification
  const togglePublish = () => {
    dispatch(toggleUsersNotification([category.id], !category.get('active')));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: category.get('active')
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: category.get('active')
        ? <FaCheck />
        : <FaCheckDouble />,
    },
  ];

  return (
    <Layout
      isCard={false}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          label={translatedFields.name}
          menus={menus}
          onDelete={handleDelete}
          onEdit={toggleEditionDialog}
        />
      )}
      title={(
        <>
          <span>{t('cms:category.category')}</span>
          <span css={{ marginRight: 10, marginLeft: 10 }}>-</span>
          <span>{translatedFields.name} ({getCategoryEntityLabel(category.get('entity'))})</span>
        </>
      )}
    >
      <Head title={translatedFields.name} />

      <Grid container spacing={PREVIEW_PAGE_GRID.spacing}>
        {/* left */}
        <Grid size={PREVIEW_PAGE_GRID.left}>
          <Stack spacing={3}>
            {/* ------- tabs for translation ------- */}
            <TranslationTabs
              onTabChange={onTabChange}
              tab={tab}
            />
            <Layout cardTitle={t('common:details')}>
              <Items items={infosItems} />
            </Layout>
            <Layout cardTitle={t('cms:seo')} helperText={t('cms:seoDescription')}>
              <Items items={seoItems} />
            </Layout>
            <Layout cardTitle={t('common:image')}>
              {category.get('image')
                ? (
                  <div css={{ width: 300 }}>
                    <img alt={translatedFields.name} css={{ width: '100%' }} src={(category.get('image')!).url} />
                  </div>
                )
                : (
                  <Typography>{t('common:errors.noField', { field: t('common:image') })}</Typography>
                )}
            </Layout>
          </Stack>
        </Grid>
        {/* right */}
        <Grid size={PREVIEW_PAGE_GRID.right}>
          <Stack spacing={3}>
            <Layout cardTitle={t('user:createdBy')}>
              <UserInfo user={category.get('user')} />
            </Layout>
            <Layout cardTitle="Status">
              <ItemsStatus entity={category} items={statusItems} />
            </Layout>
          </Stack>
        </Grid>
        {/* bottom */}
        <UsersForEntity<ICategory, ISelectOption<('updatedBy' | 'deletedBy')>[]>
          object={category}
          keys={[{
            label: t('user:updatedBy'),
            value: 'updatedBy',
          }, {
            label: t('user:deletedBy'),
            value: 'deletedBy',
          }]}
        />
      </Grid>

      <Dialog
        fullWidth
        formId={CATEGORY_FORM_ID}
        maxWidth="md"
        open={openEditionDialog}
        title={t('cms:category.editCategory')}
        toggle={toggleEditionDialog}
      >
        <CategoryForm
          category={category}
          formId={CATEGORY_FORM_ID}
          onSubmit={handleSubmitCategory}
        />
      </Dialog>
    </Layout>
  );
};

export default Category;
