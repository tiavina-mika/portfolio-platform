import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { TextEditorReadOnly } from 'mui-tiptap-editor';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { capitalize } from 'string-ts';

import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import CategoriesLinks from '@/containers/categories/CategoriesLinks';
import PreviewImages from '@/containers/cms/PreviewImages';
import UserInfo from '@/containers/users/UserInfos';
import UsersForEntity from '@/containers/users/UsersForEntity';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import {
  deleteArticle, goToAddArticle, goToArticles, goToArticlesOnWebsite, goToEditArticle,
} from '@/redux/actions/article.action';
import { toggleUsersNotification } from '@/redux/actions/user.action';
import { getArticleArticleSelector } from '@/redux/reducers/article.reducer';
import { ISelectOption } from '@/types/app.type';
import { IArticle, IArticleTranslatedFields } from '@/types/article.type';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { ARTICLE_SINGLE_IMAGE_FIELDS } from '@/validations/file.validation';

const fieldsToTranslate = ['title', 'content', 'metaTitle', 'metaDescription', 'slug', 'tags', 'description'];

const Article = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const article = useSelector(getArticleArticleSelector);

  // get translated fields depending on the selected language (tabs)
  const {
    translatedFields, onTabChange, tab,
  } = useTranslatedValuesByTab<IArticleTranslatedFields>(article?.get('translated'), fieldsToTranslate);

  if (!article) return null;

  const infosItems: ISelectOption[] = [
    {
      label: t('cms:title'),
      value: translatedFields.title,
    },
    {
      label: t('cms:description'),
      value: translatedFields.description,
    },
    {
      label: t('cms:category.category'),
      value: article.has('categories')
        ? (
          <CategoriesLinks
            categories={article.get('categories') || []}
            locale={tab}
            to={PATH_NAMES.articles}
          />
        )
        : '',
    },
    {
      label: t('common:createdAt'),
      value: displayDate(article.createdAt),
    },
    {
      label: t('common:updatedAt'),
      value: displayDate(article.updatedAt),
    },
    {
      label: t('common:deletedAt'),
      value: displayDate(article.get('deletedAt')),
      hide: !article.has('deletedAt'),
    },
  ];

  const seoItems: ISelectOption[] = [
    {
      label: `Slug (${t('common:uniqueUrl', { theEntity: t('cms:category.theCategory') })})`,
      value: translatedFields.slug
        ? goToArticlesOnWebsite(article.get('translated'), tab)
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
      value: <BooleanIcons value={article.get('active')} />,
    },
  ];

  const handleGoToList = () => {
    navigate(goToArticles());
  };

  const handleEdit = () => {
    navigate(goToEditArticle(article.id));
  };

  const handleDelete = async () => {
    await dispatch(deleteArticle(article.id));
    navigate(goToArticles());
  };

  const handleCreate = () => {
    navigate(goToAddArticle());
  };

  // for notification
  const togglePublish = () => {
    dispatch(toggleUsersNotification([article.id], !article.get('active')));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: article.get('active')
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: article.get('active')
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
          websiteUrl={goToArticlesOnWebsite(article.get('translated'), tab)}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      title={(
        <>
          <span>{t('cms:article')}</span>
          <span css={{ marginRight: 10, marginLeft: 10 }}>-</span>
          <span>{translatedFields.title}</span>
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
              tab={tab}
              onTabChange={onTabChange}
            />
            <Layout cardTitle={t('common:details')}>
              <Items items={infosItems} />
            </Layout>
            <Layout cardTitle={t('cms:seo')} helperText={t('cms:seoDescription')}>
              <Items items={seoItems} />
            </Layout>
            <Layout cardTitle={t('cms:contentOfTheArticle')}>
              <TextEditorReadOnly value={translatedFields.content} />
            </Layout>

            {/* images */}
            <PreviewImages<IArticle> fields={ARTICLE_SINGLE_IMAGE_FIELDS} page={article} />
          </Stack>
        </Grid>
        {/* right */}
        <Grid
          size={PREVIEW_PAGE_GRID.right}
        >
          <Stack spacing={3}>
            {article.has('user') && (
              <Layout cardTitle={t('user:createdBy')}>
                <UserInfo user={article.get('user')} />
              </Layout>
            )}
            <Layout cardTitle="Status">
              <ItemsStatus entity={article} items={statusItems} />
            </Layout>
            {/* social media share */}
            <Layout cardTitle={t('cms:share')}>
              {article.has('shares') && (
                Object.keys(article.get('shares') || {}).map((key: string, index: number) => (
                  <Stack key={key + index} direction="row" spacing={2}>
                    <Typography>{capitalize(key)}:</Typography>
                    <Typography>{article.get('shares')?.[key]}</Typography>
                  </Stack>
                ))
              )}
              <Stack direction="row" spacing={2}>
                <Typography>{t('total')}:</Typography>
                <Typography>{article.get('totalMediaShare') || 0}</Typography>
              </Stack>
            </Layout>
          </Stack>
        </Grid>
        {/* bottom */}
        <UsersForEntity<IArticle, ISelectOption<('updatedBy' | 'deletedBy')>[]>
          object={article}
          keys={[{
            label: t('user:updatedBy'),
            value: 'updatedBy',
          }, {
            label: t('user:deletedBy'),
            value: 'deletedBy',
          }]}
        />
      </Grid>
    </Layout>
  );
};

export default Article;
