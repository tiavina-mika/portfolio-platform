import {
  IconButton, Stack, Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { TextEditorReadOnly } from 'mui-tiptap-editor';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import { TRANSLATED_CMS_FIELDS } from '@/constants/cms.constants';
import CategoriesLinks from '@/containers/categories/CategoriesLinks';
import PreviewImages from '@/containers/cms/PreviewImages';
import SectionsByPage from '@/containers/pages/SectionsByPage';
import UserInfo from '@/containers/users/UserInfos';
import UsersForEntity from '@/containers/users/UsersForEntity';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { toggleActive } from '@/redux/actions/app.action';
import {
  deletePage, goToAddPage, goToPages, goToEditPage, goToPageOnWebsite,
} from '@/redux/actions/page.action';
import { goToAddPageSection } from '@/redux/actions/pageSection.action';
import { getPagePageSelector, getSectionsByPageSelector, loadPageSlice } from '@/redux/reducers/page.reducer';
import { ISelectOption } from '@/types/app.type';
import { IPage } from '@/types/page.type';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { PATH_NAMES } from '@/utils/pathnames';

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
  } = useTranslatedValuesByTab(page?.get('translated'), TRANSLATED_CMS_FIELDS);

  if (!page) return null;

  const infosItems: ISelectOption[] = [
    {
      label: t('cms:title'),
      value: translatedFields.title,
    },
    {
      label: t('cms:category.category'),
      value: page.get('categories')
        ? (
          <CategoriesLinks
            categories={page.get('categories') || []}
            locale={tab}
            to={PATH_NAMES.pages}
          />
        )
        : '',
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
      value: displayDate(page.get('deletedAt')),
      hide: !page.has('deletedAt'),
    },
  ];

  const seoItems: ISelectOption[] = [
    {
      label: `Slug (${t('common:uniqueUrl', { theEntity: t('cms:page') })})`,
      value: translatedFields.slug
        ? goToPageOnWebsite(page.get('translated'), tab)
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
      value: <BooleanIcons value={page.get('active')} />,
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
    dispatch(toggleActive({
      item: page, collection: 'Page', value: !page.get('active'), loadSlice: loadPageSlice,
    }));
  };

  const goToCreateSection = () => {
    navigate(goToAddPageSection(page.id));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: page.get('active')
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: page.get('active')
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
          label={translatedFields.title}
          menus={menus}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onEdit={handleEdit}
          websiteUrl={goToPageOnWebsite(page.get('translated'), tab)}
        />
      )}
      title={(
        <>
          <span>{t('cms:page')}</span>
          <span css={{ marginRight: 10, marginLeft: 10 }}>-</span>
          <span>{translatedFields.name}</span>
        </>
      )}
    >
      <Head title={translatedFields.title} />
      <Grid container spacing={PREVIEW_PAGE_GRID.spacing}>
        {/* left */}
        <Grid
          size={PREVIEW_PAGE_GRID.left}
        >
          <Stack spacing={3}>
            {/* ------- tabs for translation ------- */}
            <TranslationTabs
              fixedOnScroll
              onTabChange={onTabChange}
              tab={tab}
            />
            {/* main infos bloc */}
            <Layout cardTitle={t('common:details')}>
              <Items items={infosItems} />
            </Layout>
            {/* SEO block */}
            <Layout cardTitle={t('cms:seo')} helperText={t('cms:seoDescription')}>
              <Items items={seoItems} />
            </Layout>
            {/* content */}
            <Layout cardTitle={t('cms:mainContentOfThePage')}>
              <TextEditorReadOnly value={translatedFields.content} />
            </Layout>
            {/* sections */}
            <Layout
              cardTitle={t('cms:sections')}
              helperText={t('cms:sectionsHelperText')}
              rightActions={(
                <Tooltip title={t('cms:createSectionForThisPage')}>
                  <IconButton onClick={goToCreateSection} size="small">
                    <FiPlus />
                  </IconButton>
                </Tooltip>
              )}
            >
              <SectionsByPage locale={tab} pageId={page.id} sections={sections} />
            </Layout>

            {/* images */}
            <PreviewImages<IPage> page={page} />
          </Stack>
        </Grid>
        {/* right */}
        <Grid
          size={PREVIEW_PAGE_GRID.right}
        >
          <Stack spacing={3}>
            <Layout cardTitle={t('user:createdBy')}>
              <UserInfo user={page.get('user')} />
            </Layout>
            <Layout cardTitle="Status">
              <ItemsStatus entity={page} items={statusItems} />
            </Layout>
          </Stack>
        </Grid>
        {/* bottom */}
        <UsersForEntity<IPage, ISelectOption<('updatedBy' | 'deletedBy')>[]>
          object={page}
          keys={[{
            label: t('user:updatedBy'),
            value: 'updatedBy',
          }, {
            label: t('common:deletedBy'),
            value: 'deletedBy',
          }]}
        />
      </Grid>
    </Layout>
  );
};

export default Page;
