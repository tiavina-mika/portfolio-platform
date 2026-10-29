import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import AddFab from '@/components/AddFab';
import Head from '@/components/Head';
import ListWithSelection from '@/components/table/ListWithSelection';
import UserCell from '@/components/UserCell';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import SearchArticles from '@/containers/articles/SearchArticles';
import { useProtect } from '@/hooks/useProtect';
import { destroyObjects } from '@/redux/actions/app.action';
import {
  deleteArticle,
  goToAddArticle,
  goToArticle,
  goToArticlesOnWebsite,
  goToEditArticle,
  loadArticles,
  toggleArticlesByIds,
} from '@/redux/actions/article.action';
import { getArticleCountSelector, getArticleArticlesSelector, deleteArticlesSlice } from '@/redux/reducers/article.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { articlesRoute } from '@/routes/protected/article.routes';
import { IQueriesInput,
  IRenderSearchProps, ITableHeadCell } from '@/types/app.type';
import { IArticle, IArticleTranslatedFields } from '@/types/article.type';
import { isCurrentTab } from '@/utils/app.utils';
import { getTranslatedCategoriesName } from '@/utils/cms.utils';
import { displayDate } from '@/utils/date.utils';
import { getTranslatedField } from '@/utils/settings.utils';

interface IData {
  title: string;
  categories: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  actions: ReactNode;
  totalMediaShare: number;
}

const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'title',
    label: i18n.t('cms:title'),
  },
  {
    id: 'categories',
    label: i18n.t('cms:category.categories'),
    align: 'center',
  },
  {
    id: 'user',
    label: i18n.t('cms:author'),
    align: 'left',
  },
  {
    id: 'totalMediaShare',
    label: i18n.t('cms:totalMediaShared'),
    align: 'right',
  },
  {
    id: 'createdAt',
    label: i18n.t('common:createdAt'),
    align: 'right',
  },
  {
    id: 'updatedAt',
    label: i18n.t('common:updatedAt'),
    align: 'right',
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
  const searchParams = articlesRoute.useSearch();

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

  const handleCreate = (): void => {
    navigate(goToAddArticle());
  };

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

  // table data
  const dataTable = useMemo((): IData[] => {
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const articlesData = articles.map((article: IArticle) => {
      const title = getTranslatedField<IArticleTranslatedFields>(article.get('translated'), locale, 'title');
      // default data
      const data: Record<string, any> = {
        id: article.id, // required even if not displayed
        title,
        categories: getTranslatedCategoriesName(article.get('categories'), locale),
        user: article.has('user')
          ? <UserCell user={article.get('user')} />
          : null,
        totalMediaShare: article.get('totalMediaShare') || 0,
        createdAt: displayDate(article.createdAt, false, true),
        updatedAt: displayDate(article.updatedAt, false, true),
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={title}
              type="icon"
              onDestroy={() => handleDestroy(article.id)}
              onPreview={() => handlePreview(article.id)}
            />
          )
          : (
            <ActionsMenu
              label={title}
              websiteUrl={goToArticlesOnWebsite(article.get('translated'), locale)}
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
    locale,
    canDelete,
    canDestroy,
    canEdit,
    canPreview,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title={t('cms:articles')} />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams} // @see articles.routes.tsx
        headCells={headCells}
        items={dataTable}
        renderFilter={(props: IRenderSearchProps) => <SearchArticles {...props} />}
        tabs={recycleBinTabOptions}
        onDeleteSelected={handleDeleteSelected}
        onUpdateData={handleUpdateData}
      />

      {canCreate && (
        <AddFab onClick={handleCreate} />
      )}
    </>
  );
};

export default Articles;
