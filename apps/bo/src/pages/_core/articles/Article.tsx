import { ARTICLE_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import { useNavigate } from '@tanstack/react-router';
import { TextEditorReadOnly } from 'mui-tiptap-editor';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import {
  FiBarChart2, FiClock, FiEdit3, FiFileText, FiImage, FiSearch, FiToggleRight, FiUser,
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
import { CMS_JSON_DOWNLOAD_IGNORED_FIELDS } from '@/constants/_core/cms.constants';
import ArticleAudience from '@/containers/_core/articles/ArticleAudience';
import CategoriesLinks from '@/containers/_core/categories/CategoriesLinks';
import PreviewImages from '@/containers/_core/cms/PreviewImages';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import History from '@/containers/_core/History';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import {
  deleteArticle, goToAddArticle, goToArticles, goToArticlesOnWebsite, goToEditArticle,
  toggleArticleActive,
} from '@/redux/actions/_core/article.action';
import { goToList } from '@/redux/actions/_core/util.action';
import { getArticleArticleSelector } from '@/redux/reducers/_core/article.reducer';
import { IPreviewSection, ISelectOption } from '@/types/_core/app.type';
import { IArticle, IArticleTranslatedFields } from '@/types/_core/article.type';
import { displayDate } from '@/utils/_core/date.utils';
import { downloadObjectAsJson } from '@/utils/_core/download.utils';

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
  } = useTranslatedValuesByTab<IArticleTranslatedFields>(article?.translated, fieldsToTranslate);

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
      value: (article.categories !== undefined)
        ? (
          <CategoriesLinks
            categories={article.categories || []}
            locale={tab}
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
      value: displayDate(article.deletedAt),
      hide: !(article.deletedAt !== undefined),
    },
  ];

  const seoItems: ISelectOption[] = [
    {
      label: `Slug (${t('common:uniqueUrl', { theEntity: t('cms:category.theCategory') })})`,
      value: translatedFields.slug
        ? goToArticlesOnWebsite(article.translated, tab)
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
      value: <BooleanIcons value={article.active} />,
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

  const handleDownloadJson = () => {
    downloadObjectAsJson(article, CMS_JSON_DOWNLOAD_IGNORED_FIELDS, `article-${article.id}`);
  };

  // the rest of what this author wrote, with the columns and the row actions the list has
  const handleGoToAuthorArticles = () => {
    if (!article.user) return;
    navigate(goToList('articles', { user: article.user.id }));
  };

  const togglePublish = () => {
    dispatch(toggleArticleActive(article, !article.active));
  };

  const menus = [
    {
      onClick: togglePublish,
      display: true,
      label: article.active
        ? t('cms:noToPublish')
        : t('cms:publish'),
      icon: article.active
        ? <FaCheck />
        : <FaCheckDouble />,
    },
    {
      onClick: handleGoToAuthorArticles,
      // an article imported without an author has nothing to scope the list to
      display: !!article.user,
      label: t('cms:viewAuthorArticles'),
      icon: <FiUser />,
    },
  ];

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
      id: 'content',
      label: t('cms:contentOfTheArticle'),
      icon: <FiEdit3 />,
      content: <TextEditorReadOnly value={translatedFields.content} />,
    },
    {
      id: 'images',
      label: t('common:images'),
      icon: <FiImage />,
      content: <PreviewImages<IArticle> fields={ARTICLE_SINGLE_IMAGE_FIELDS} page={article} />,
    },
    {
      id: 'status',
      label: t('common:status'),
      icon: <FiToggleRight />,
      content: <ItemsStatus entity={article} items={statusItems} />,
    },
    {
      // what the article did once published: shares, views, progress towards its goal
      id: 'audience',
      label: t('cms:audience'),
      icon: <FiBarChart2 />,
      content: <ArticleAudience article={article} />,
    },
    {
      id: 'history',
      label: t('common:history'),
      icon: <FiClock />,
      content: (
        <History<IArticle>
          authorFields={CMS_HISTORY_AUTHOR_FIELDS}
          colors={USER_EVENT_COLORS}
          fields={defaultUserEventFields}
          parseObj={article}
          translationKey="project:eventsHistory"
        />
      ),
    },
  ];

  return (
    <Layout
      isCard={false}
      pretitle={t('cms:article')}
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
          websiteUrl={goToArticlesOnWebsite(article.translated, tab)}
        />
      )}
      title={(
        <>
          <span>{translatedFields.title}</span>
          <PublishedChip published={article.active} />
        </>
      )}
    >
      <Head title={translatedFields.title} />
      <PreviewSections
        header={<TranslationTabs onTabChange={onTabChange} tab={tab} />}
        sections={sections}
      />
    </Layout>
  );
};

export default Article;
