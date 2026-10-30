import { CategoryEntityEnum } from '@shared/types';

import i18n from '@/config/i18n';
import {
  recycleBinTabOptions,
  DEFAULT_PAGINATION, Errors, EXPORT_MAX_ROWS, PAGINATION,
} from '@/constants/_core/app.constants';
import { loadCategoriesOptions } from '@/redux/actions/_core/category.action';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import { clearErrorSlice, setInfoMessageSlice, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  clearArticleCountSlice,
  clearArticleEditorTempFilesSlice,
  clearArticleSlice,
  clearArticlesSlice,
  deleteArticleFromArticlesSlice,
  deleteArticlesSlice,
  getArticleEditorTempFilesSelector,
  loadArticleSlice,
  loadArticlesSlice,
  setArticlesCountSlice,
} from '@/redux/reducers/_core/article.reducer';
import { clearCategoriesOptionsSlice } from '@/redux/reducers/_core/category.reducer';
import { clearContentVersionsSlice } from '@/redux/reducers/_core/contentVersion.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  fetchArticle, fetchArticles, fetchArticlesForExport, saveArticle, setArticleActive,
  toggleArticlesFieldByIds,
} from '@/services/_core/article.service';
import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import {
  ExportFormat, IExportColumn, IQueriesInput, ITabAndCategorySearchParams,
} from '@/types/_core/app.type';
import { IArticle, IArticleInput, IArticleTranslatedFields } from '@/types/_core/article.type';
import { Locale } from '@/types/_core/setting.type';
import { convertSearchParamsToFilters, isCurrentTab } from '@/utils/_core/app.utils';
import {
  getArticleStatus, getArticleViewsGoal, getTranslatedArticleStatusLabel, getTranslatedCategoriesName,
} from '@/utils/_core/cms.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { assertNoConcurrentEdit } from '@/utils/_core/parse.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { getWebsiteUrl } from '@/utils/_core/utils';


const collection = 'Article';

const getArticleExportColumns = (locale: Locale): IExportColumn<IArticle>[] => [
  {
    header: i18n.t('cms:title'),
    getValue: (article) => getTranslatedField<IArticleTranslatedFields>(article.translated, locale, 'title'),
  },
  {
    header: i18n.t('cms:category.categories'),
    getValue: (article) => getTranslatedCategoriesName(article.categories, locale),
  },
  {
    header: i18n.t('cms:author'),
    getValue: (article) => (article.user
      ? `${article.user.firstName ?? ''} ${article.user.lastName}`.trim()
      : ''),
  },
  {
    header: i18n.t('cms:views'),
    getValue: (article) => article.views ?? 0,
  },
  {
    header: i18n.t('cms:viewsGoal'),
    getValue: (article) => getArticleViewsGoal(article),
  },
  {
    header: i18n.t('cms:totalMediaShared'),
    getValue: (article) => article.totalMediaShare ?? 0,
  },
  {
    header: i18n.t('common:status'),
    getValue: (article) => getTranslatedArticleStatusLabel(getArticleStatus(article)),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (article) => displayDate(article.createdAt, false, true),
  },
  {
    header: i18n.t('common:updatedAt'),
    getValue: (article) => displayDate(article.updatedAt, false, true),
  },
];

export const getArticle = fetchArticle;

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadArticles = (queries: IQueriesInput): any => {
  const {
    limit = PAGINATION.rowsPerPage,
    skip = 0,
    orderBy = 'updatedAt',
    order = 'desc',
    filters,
    search,
    include = ['categories'],
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await fetchArticles({
      limit, skip, orderBy, order, filters, search, include,
    });

    dispatch(loadArticlesSlice(result.results));
    dispatch(setArticlesCountSlice(result.count));
    rememberListQuery(loadArticlesSlice, queries);
  });
};

/**
 * exports every article matching the current filters/search (not just the current page) as CSV/Excel
 * @param queries current filters/search/order from the list (bypasses pagination, bounded by EXPORT_MAX_ROWS)
 * @param format
 */
export const exportArticles = (queries: IQueriesInput, format: ExportFormat): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const locale = getSettingsLocaleSelector(getState?.()!);

    const result = await fetchArticlesForExport(queries, EXPORT_MAX_ROWS);

    await exportRows(result.results, getArticleExportColumns(locale), 'articles', format);

    if (result.count > EXPORT_MAX_ROWS) {
      dispatch(setInfoMessageSlice(
        i18n.t('common:exportTruncatedWarning', { max: EXPORT_MAX_ROWS, total: result.count })
      ));
    }
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

type SaveArticleParams = {
  id?: string | null | undefined;
  values: IArticleInput;
  // `updatedAt` the admin last saw when opening the edit form — used for optimistic locking
  expectedUpdatedAt?: string;
  onSuccess?: (id: string) => void;
};
export const createOrUpdateArticle = ({
  id,
  values,
  // `updatedAt` the admin last saw when opening the edit form — used for optimistic locking
  expectedUpdatedAt,
  onSuccess,
}: SaveArticleParams): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const editorTempFiles = getArticleEditorTempFilesSelector(state);

    const sessionToken = await fetchCurrentUserSessionToken();

    if (!sessionToken) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    let existingArticle: IArticle | undefined;

    if (id) {
      existingArticle = await getArticle(id);

      if (!existingArticle) return;
      assertNoConcurrentEdit(existingArticle, expectedUpdatedAt);
    }

    const savedArticle = await saveArticle({
      id, existingArticle, values, sessionToken, locale, editorTempFiles,
    });

    dispatch(loadArticleSlice(savedArticle));
    // clear the temp editor files
    dispatch(clearArticleEditorTempFilesSlice());
    onSuccess?.(savedArticle.id);
  },
  // rights
  {
    collection,
    action: id ? 'update' : 'create',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:thisArticle') }),
  });
};

/*
 * generic deleteOne thunk, shared with every list through the CRUD factory. `loadArticles`/
 * `exportArticles`/`onArticlesEnter` stay hand-written: they need a category filter + a conditional
 * `include` the generic factory doesn't support (dropping `include: ['categories']` from the export
 * call would silently break the "Categories" column — Parse pointers only resolve with `.include()`).
 * `toggleArticlesByIds` also stays hand-written for its custom per-field no-right message.
 */
const articleCrud = createCrudThunks<IArticle>({
  collection,
  listCloudFunction: 'getArticles',
  getOne: (id: string) => getArticle(id),
  slice: {
    loadListSlice: loadArticlesSlice,
    setCountSlice: setArticlesCountSlice,
    clearOneSlice: clearArticleSlice,
    clearListSlice: clearArticlesSlice,
    clearCountSlice: clearArticleCountSlice,
    removeFromListSlice: deleteArticleFromArticlesSlice,
    removeManyFromListSlice: deleteArticlesSlice,
  },
  deletedMessage: (id: string) => i18n.t('cms:messages.articleDeletedSuccessfully', { value: id }),
});

export const deleteArticle: any = articleCrud.deleteOne;

/**
 * mark seen field as true
 * so that its not more treated as notification
 * ex: (['xxx', 'yyy'], seen, false)
 * @param ids
 * @returns
 */
/**
 * Publishes or unpublishes the article currently open, and refreshes what the page shows so the
 * action's own label flips with it.
 */
export const toggleArticleActive = (article: IArticle, value: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedArticle = await setArticleActive(article, value);

    dispatch(loadArticleSlice(updatedArticle));
    dispatch(setMessageSlice(value
      ? i18n.t('cms:messages.articlePublished')
      : i18n.t('cms:messages.articleUnpublished')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:thisArticle') }),
  });
};

export const toggleArticlesByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // update the database
    await toggleArticlesFieldByIds(ids, field, value);
    // delete
    dispatch(deleteArticlesSlice(ids));
  },
  // rights
  {
    collection,
    action: field === 'deleted'
      ? 'delete'
      : 'update',
    hasNoRightErrorMessage: field === 'deleted'
      ? i18n.t('common:errors.hasNoRightToDelete', { value: i18n.t('cms:theseArticles') })
      : i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:theseArticles') }),
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * load articles data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onArticlesEnter = (route: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    if (route.search.category) {
      filters.category = route.search.category;
    }

    if (isCurrentTab(route.search?.tab)) {
      values.include = ['deletedCategories'];
    }

    // convert the url search params tab to (db) filters
    const newFilters = convertSearchParamsToFilters({
      tabs: recycleBinTabOptions,
      searchParams: route.search,
      filters,
    });

    values.filters = newFilters;

    // clear the prev state first
    dispatch(clearArticleSlice());
    dispatch(clearListUnlessLoadedWith(
      loadArticlesSlice, values, [clearArticlesSlice(), clearArticleCountSlice()]
    ));
    dispatch(loadArticles(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onArticleEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params?.id) return;
    const article = await getArticle(route.params?.id, [
      'categories', 'categories.parentCategory', 'categories.parentCategory.parentCategory',
    ]);

    if (!article) {
      throw new Error(Errors.notFound);
    }

    // clear the temp editor files
    dispatch(clearArticleEditorTempFilesSlice());
    dispatch(loadArticleSlice(article));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

export const onEditArticleEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const id = route.params?.id;

    if (!id) return;
    const article = await getArticle(id, ['categories']);

    if (!article) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadArticleSlice(article));
    dispatch(loadCategoriesOptions(CategoryEntityEnum.ARTICLE));
  },
  // rights
  {
    collection,
    action: 'update',
  });
};

export const onCreateArticleEnter = (): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch): void => {
    /*
     * clear any article/error left over from a previous view or edit — otherwise the post-save
     * redirect effect in CreateArticle (which waits for the `article` slice to change and bails
     * if `error` is truthy) can be blocked by stale state from before this page was even opened
     */
    dispatch(clearArticleSlice());
    dispatch(clearErrorSlice());
    /*
     * the category select's options are the only thing the form reads from the server, and they
     * are not needed to start typing: loaded in the background, the select shows it is filling.
     * The thunk reports its own errors, it never rejects
     */
    dispatch(loadCategoriesOptions(CategoryEntityEnum.ARTICLE));
  },
  // rights
  {
    collection,
    action: 'create',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
export const onCreateOrEditArticleLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearArticleEditorTempFilesSlice());
    dispatch(clearCategoriesOptionsSlice());
    dispatch(clearContentVersionsSlice());
  };
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToArticles = (searchParams?: ITabAndCategorySearchParams): any => ({
  to: PATH_NAMES.articles,
  search: searchParams,
});
export const goToArticle = (id: string): any => ({ to: PATH_NAMES.articles + '/$id', params: { id } });
export const goToAddArticle = (): any => ({ to: PATH_NAMES.articles + '/' + PATH_NAMES.create });
export const goToEditArticle = (id: string): any => ({ to: PATH_NAMES.articles + '/$id/' + PATH_NAMES.edit, params: { id } });

/**
 * open the page in the website
 * NOTE: change this if the website url structure change
 * @param locale
 * @param slug
 * @returns website url, ex: https://www.example.com/en/my-page
 */
export const goToArticlesOnWebsite = (translated: Record<string, any>, locale: string): string => {
  const hostname = getWebsiteUrl();
  const pathname = i18n.t('route:website.articles');
  const slug = getTranslatedField(translated, locale, 'slug');

  return `${hostname}/${locale}/${pathname}/${slug}`;
};
