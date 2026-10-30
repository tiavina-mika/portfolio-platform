import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import CreateButton from '@/components/CreateButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import ListScopeAlert from '@/components/ListScopeAlert';
import ListWithSelection from '@/components/table/ListWithSelection';
import UserCell from '@/components/UserCell';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/_core/app.constants';
import { CMS_JSON_DOWNLOAD_IGNORED_FIELDS } from '@/constants/_core/cms.constants';
import ArticleAudienceCell from '@/containers/_core/articles/ArticleAudienceCell';
import ArticlePublishedCell from '@/containers/_core/articles/ArticlePublishedCell';
import ArticleSharesCell from '@/containers/_core/articles/ArticleSharesCell';
import ArticleStatusCell from '@/containers/_core/articles/ArticleStatusCell';
import ArticleTitleCell from '@/containers/_core/articles/ArticleTitleCell';
import SearchArticles from '@/containers/_core/articles/SearchArticles';
import { useProtect } from '@/hooks/_core/useProtect';
import { destroyObjects } from '@/redux/actions/_core/app.action';
import {
  deleteArticle,
  exportArticles,
  goToAddArticle,
  goToArticle,
  goToArticlesOnWebsite,
  goToEditArticle,
  loadArticles,
  toggleArticlesByIds,
} from '@/redux/actions/_core/article.action';
import { getArticleCountSelector, getArticleArticlesSelector, deleteArticlesSlice } from '@/redux/reducers/_core/article.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { articlesRoute } from '@/routes/protected/_core/article.routes';
import {
  ExportFormat,
  IQueriesInput,
  IRenderSearchProps, ITableHeadCell,
} from '@/types/_core/app.type';
import { IArticle, IArticleTranslatedFields } from '@/types/_core/article.type';
import { ICategoryTranslatedFields } from '@/types/_core/category.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import { downloadObjectAsJson } from '@/utils/_core/download.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { getUserFullName } from '@/utils/_core/user.utils';
import { ArticlesRouteSearchParams } from '@/validations/_core/article.validations';

interface IData {
  article: ReactNode;
  published: ReactNode;
  user: ReactNode | null;
  audience: ReactNode;
  shares: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

/*
 * The columns answer, in order, the questions an editor asks of an article: what it is, when it
 * went out, who wrote it, how it was read, how far it travelled, and whether it is on the site.
 * Category and reading time fold into the title cell, and the view goal into the audience cell, so
 * each reads as one fact rather than as two columns that only make sense next to each other.
 */
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'article',
    label: i18n.t('cms:article'),
    width: 280,
    // the title lives under `translated.<locale>.title` — there is no one field to order on
    disableSorting: true,
  },
  {
    id: 'published',
    label: i18n.t('cms:published'),
    sortFields: [
      { id: 'createdAt', label: i18n.t('common:createdAt') },
      { id: 'updatedAt', label: i18n.t('common:updatedAt') },
    ],
  },
  {
    id: 'user',
    label: i18n.t('cms:author'),
    align: 'left',
  },
  {
    id: 'audience',
    label: i18n.t('cms:audience'),
    sortFields: [
      { id: 'views', label: i18n.t('cms:views') },
      { id: 'viewsGoal', label: i18n.t('cms:viewsGoal') },
    ],
  },
  {
    id: 'shares',
    label: i18n.t('cms:share'),
    align: 'right',
    sortFields: [
      { id: 'totalMediaShare', label: i18n.t('cms:totalMediaShared') },
    ],
  },
  {
    id: 'status',
    label: i18n.t('common:status'),
    // read off `active` and `deleted` together — neither of the two alone orders the column
    disableSorting: true,
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
  },
];

const collection = 'Article';

const Articles = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const articles = useSelector(getArticleArticlesSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const count = useSelector(getArticleCountSelector);
  const searchParams: ArticlesRouteSearchParams = articlesRoute.useSearch();

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    canCreate,
  } = useProtect(collection);

  const {
    t,
  } = useTranslation(['cms']);

  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

  // destroy objects (in recycle bin)
  const handleDestroy = useCallback(
    (id: string | string[]): void => {
      const options = { collection, messageLabel: t('cms.articles'), updateListCallback: deleteArticlesSlice };
      const ids = Array.isArray(id) ? id : [id];

      dispatch(destroyObjects(ids, options));
    },
    [dispatch, t]
  );

  // delete a row
  const handleDelete = useCallback(
    (article: IArticle): void => {
      dispatch(deleteArticle(article.id));
    },
    [dispatch]
  );

  // go to preview page
  const handlePreview = useCallback(
    (id: string): void => {
      navigate(goToArticle(id));
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (article: IArticle): void => {
      navigate(goToEditArticle(article.id));
    },
    [navigate]
  );

  const handleDownloadJson = useCallback(
    (article: IArticle): void => {
      downloadObjectAsJson(article, CMS_JSON_DOWNLOAD_IGNORED_FIELDS, `article-${article.id}`);
    },
    []
  );

  const handleCreate = (): void => {
    navigate(goToAddArticle());
  };

  /*
   * Puts a deleted row back in the list. The recycle bin only ever offered "destroy permanently",
   * so a row deleted by mistake had no way back — this is the same soft-delete flag, flipped.
   */
  const handleRestore = useCallback(
    (id: string): void => {
      dispatch(toggleArticlesByIds([id], 'deleted', false));
    },
    [dispatch]
  );

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(toggleArticlesByIds(ids, 'deleted', true));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadArticles(queries));
  };

  const handleExport = (format: ExportFormat, queries: IQueriesInput) => {
    dispatch(exportArticles(queries, format));
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const articlesData = articles.map((article: IArticle) => {
      const title = getTranslatedField<IArticleTranslatedFields>(article.translated, locale, 'title');
      // default data
      const data: Record<string, any> = {
        id: article.id, // required even if not displayed
        article: <ArticleTitleCell article={article} locale={locale} />,
        published: (
          <ArticlePublishedCell
            publishedAt={article.createdAt}
            updatedAt={article.updatedAt}
          />
        ),
        user: (article.user !== undefined)
          ? <UserCell compact contactType="email" user={article.user} />
          : null,
        audience: <ArticleAudienceCell article={article} />,
        shares: <ArticleSharesCell article={article} />,
        status: <ArticleStatusCell article={article} />,
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={title}
              onDestroy={() => handleDestroy(article.id)}
              onDownloadJson={() => handleDownloadJson(article)}
              onPreview={() => handlePreview(article.id)}
              onRestore={() => handleRestore(article.id)}
              type="row"
            />
          )
          : (
            <ActionsMenu
              label={title}
              onDownloadJson={() => handleDownloadJson(article)}
              type="row"
              websiteUrl={goToArticlesOnWebsite(article.translated, locale)}
              onDelete={canDelete
                ? () => handleDelete(article)
                : undefined}
              onEdit={canEdit
                ? () => handleEdit(article)
                : undefined}
              onPreview={canPreview
                ? () => handlePreview(article.id)
                : undefined}
            />
          ),
      };

      return data as IData;
    });

    return articlesData;
  }, [
    articles,
    handleDelete,
    handlePreview,
    handleDestroy,
    handleEdit,
    handleDownloadJson,
    handleRestore,
    locale,
    canDelete,
    canDestroy,
    canEdit,
    canPreview,
    searchParams?.tab,
  ]);

  const handleClearScope = () => {
    navigate({ to: PATH_NAMES.articles, search: { tab: searchParams.tab } } as any);
  };

  /*
   * reached from an article's page or from a category's, the list holds the rest of what that
   * author wrote, or everything filed under that category — and the filter panel that would explain
   * it is empty, because neither scope went through it. Both subjects are read off the rows: the
   * scope arrives as a bare id, and only an article knows the name behind it.
   */
  const scopedAuthorName = searchParams.user
    ? getUserFullName(articles[0]?.user)
    : '';
  const scopedCategory = searchParams.category
    ? articles[0]?.categories
      ?.find((category) => (category.id ?? category.objectId) === searchParams.category)
    : undefined;
  const scopedCategoryName = scopedCategory
    ? getTranslatedField<ICategoryTranslatedFields>(scopedCategory.translated, locale, 'name')
    : '';

  const scopeMessage = searchParams.user
    ? (scopedAuthorName
      ? t('cms:scopedToAuthorWithName', { value: scopedAuthorName })
      : t('cms:scopedToAuthor'))
    : (scopedCategoryName
      ? t('cms:scopedToCategoryWithName', { value: scopedCategoryName })
      : t('cms:scopedToCategory'));

  return (
    <>
      <Head title={t('cms:articles')} />
      <PageHeader
        actions={canCreate && <CreateButton label={t('cms:createArticle')} onClick={handleCreate} />}
        title={t('cms:articles')}
      />
      {!!(searchParams.user || searchParams.category) && (
        <ListScopeAlert
          clearLabel={t('cms:seeAllArticles')}
          message={scopeMessage}
          onClear={handleClearScope}
        />
      )}
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams} // @see articles.routes.tsx
        headCells={headCells}
        items={dataTable}
        onDeleteSelected={handleDeleteSelected}
        onExport={handleExport}
        onUpdateData={handleUpdateData}
        renderFilter={(props: IRenderSearchProps) => <SearchArticles {...props} />}
        tabs={recycleBinTabOptions}
      />

    </>
  );
};

export default Articles;
