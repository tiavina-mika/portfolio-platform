import { IconButton, Tooltip } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { TextEditorReadOnly } from 'mui-tiptap-editor';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import {
  FiClock, FiEdit3, FiFileText, FiImage, FiLayers, FiPlus, FiSearch, FiToggleRight,
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
import { CMS_JSON_DOWNLOAD_IGNORED_FIELDS, TRANSLATED_CMS_FIELDS } from '@/constants/_core/cms.constants';
import CategoriesLinks from '@/containers/_core/categories/CategoriesLinks';
import PreviewImages from '@/containers/_core/cms/PreviewImages';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import History from '@/containers/_core/History';
import SectionsByPage from '@/containers/_core/pages/SectionsByPage';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import {
  deletePage, goToAddPage, goToPages, goToEditPage, goToPageOnWebsite, togglePageActive,
} from '@/redux/actions/_core/page.action';
import { goToAddPageSection } from '@/redux/actions/_core/pageSection.action';
import { getPagePageSelector, getSectionsByPageSelector } from '@/redux/reducers/_core/page.reducer';
import { IPreviewSection, ISelectOption } from '@/types/_core/app.type';
import { IPage } from '@/types/_core/page.type';
import { getLinkEmplacementLabel } from '@/utils/_core/cms.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { downloadObjectAsJson } from '@/utils/_core/download.utils';

const Page = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const page = useSelector(getPagePageSelector);
  const sections = useSelector(getSectionsByPageSelector);

  const {
    translatedFields,
    onTabChange,
    tab,
  } = useTranslatedValuesByTab(page?.translated, TRANSLATED_CMS_FIELDS);

  if (!page) return null;

  const infosItems: ISelectOption<string | ReactNode | undefined>[] = [
    {
      label: t('cms:title'),
      value: translatedFields.title,
    },
    {
      label: t('cms:category.category'),
      value: page.categories
        ? (
          <CategoriesLinks
            categories={page.categories || []}
            locale={tab}
          />
        )
        : '',
    },
    {
      label: t('cms:technicalCode'),
      value: page.code,
      hide: !page.code,
    },
    {
      label: t('cms:linkLocation'),
      value: page.linkLocations?.map(getLinkEmplacementLabel).join(', '),
      hide: !page.linkLocations?.length,
    },
    {
      label: t('common:createdAt'),
      value: displayDate(page.createdAt),
    },
    {
      label: t('common:updatedAt'),
      value: displayDate(page.updatedAt),
    },
    {
      label: t('common:deletedAt'),
      value: displayDate(page.deletedAt),
      hide: !(page.deletedAt !== undefined),
    },
  ];

  const seoItems: ISelectOption[] = [
    {
      label: `Slug (${t('common:uniqueUrl', { theEntity: t('cms:page') })})`,
      value: translatedFields.slug
        ? goToPageOnWebsite(page.translated, tab)
        : '',
    },
    {
      label: 'Tags',
      value: translatedFields.tags,
    },
    {
      label: t('common:metaTitle'),
      value: translatedFields.metaTitle,
    },
    {
      label: t('common:metaDescription'),
      value: translatedFields.metaDescription,
    },
  ];

  const statusItems: ISelectOption<ReactNode>[] = [
    {
      label: t('common:active'),
      value: <BooleanIcons value={page.active} />,
    },
  ];

  const handleGoToList = () => {
    navigate(goToPages());
  };

  const handleEdit = () => {
    navigate(goToEditPage(page.id));
  };

  const handleDelete = async () => {
    await dispatch(deletePage(page.id));
    navigate(goToPages());
  };

  const handleCreate = () => {
    navigate(goToAddPage());
  };

  const togglePublish = () => {
    dispatch(togglePageActive(page.id, !page.active));
  };

  const goToCreateSection = () => {
    navigate(goToAddPageSection(page.id));
  };

  const handleDownloadJson = () => {
    downloadObjectAsJson(page, CMS_JSON_DOWNLOAD_IGNORED_FIELDS, `page-${page.code || page.id}`);
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: page.active
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: page.active
        ? <FaCheck />
        : <FaCheckDouble />,
    },
  ];

  const previewSections: IPreviewSection[] = [
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
      id: 'content',
      label: t('cms:mainContentOfThePage'),
      icon: <FiEdit3 />,
      content: <TextEditorReadOnly value={translatedFields.content} />,
    },
    {
      id: 'sections',
      label: t('cms:sections'),
      icon: <FiLayers />,
      helperText: t('cms:sectionsHelperText'),
      rightActions: (
        <Tooltip title={t('cms:createSectionForThisPage')}>
          <IconButton onClick={goToCreateSection} size="small">
            <FiPlus />
          </IconButton>
        </Tooltip>
      ),
      content: <SectionsByPage locale={tab} pageId={page.id} sections={sections} />,
    },
    {
      id: 'images',
      label: t('common:images'),
      icon: <FiImage />,
      content: <PreviewImages<IPage> editorFiles={page.editorFiles} page={page} />,
    },
    {
      id: 'status',
      label: t('common:status'),
      icon: <FiToggleRight />,
      content: <ItemsStatus entity={page} items={statusItems} />,
    },
    {
      id: 'history',
      label: t('common:history'),
      icon: <FiClock />,
      content: (
        <History<IPage>
          authorFields={CMS_HISTORY_AUTHOR_FIELDS}
          colors={USER_EVENT_COLORS}
          fields={defaultUserEventFields}
          parseObj={page}
          translationKey="project:eventsHistory"
        />
      ),
    },
  ];

  return (
    <Layout
      isCard={false}
      pretitle={t('cms:page')}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          label={translatedFields.title}
          menus={menus}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onDownloadJson={handleDownloadJson}
          onEdit={handleEdit}
          type="preview"
          websiteUrl={goToPageOnWebsite(page.translated, tab)}
        />
      )}
      title={(
        <>
          <span>{translatedFields.name}</span>
          <PublishedChip published={page.active} />
        </>
      )}
    >
      <Head title={translatedFields.title} />
      <PreviewSections
        header={<TranslationTabs fixedOnScroll onTabChange={onTabChange} tab={tab} />}
        sections={previewSections}
      />
    </Layout>
  );
};

export default Page;
