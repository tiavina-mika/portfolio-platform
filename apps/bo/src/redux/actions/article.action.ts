import Parse from 'parse';

import i18n, { locales } from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import { ALL_PAGE_FIELDS } from '@/constants/cms.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { IQueriesInput, ITabAndCategorySearchParams } from '@/types/app.type';
import { IArticle, IArticleInput } from '@/types/article.type';
import { CategoryEntityEnum } from '@/types/category.type';
import { convertSearchParamsToFilters, isCurrentTab } from '@/utils/app.utils';
import { getCategoryPointersFromIds } from '@/utils/cms.utils';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/utils/constants';
import { uploadFormFiles, uploadUpdatedFormFiles } from '@/utils/file.utils';
import { setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { getTranslatedField } from '@/utils/settings.utils';
import { getWebsiteUrl } from '@/utils/utils';
import { articleCodec } from '@/validations/article.validations';
import { ARTICLE_SINGLE_IMAGE_FIELDS } from '@/validations/file.validation';

import { loadCategoriesOptions } from './category.action';
import { setMessageSlice } from '../reducers/app.reducer';
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
} from '../reducers/article.reducer';
import { clearCategoriesOptionsSlice } from '../reducers/category.reducer';
import { getSettingsLocaleSelector } from '../reducers/settings.reducer';

const collection = 'Article';
const Article = Parse.Object.extend(collection);

const ARTICLE_PROPERTIES = new Set(['translated', 'categories', ...ALL_PAGE_FIELDS]);

export const getArticle = async (id: string, include: string[] = []): Promise<IArticle | undefined> => {
  const article = await Parse.Cloud.run('getArticle', { id, include });

  return article;
};

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadArticles = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'updatedAt',
  order = 'desc',
  filters,
  search,
  include = ['categories'],
}: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    /*
     * result with count
     * we make it server side because we need to get user infos
     */
    const result: Record<string, any> = await Parse.Cloud.run('getArticles', {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
      include,
    });

    // save articles to store (in json)
    dispatch(loadArticlesSlice(result.results));
    dispatch(setArticlesCountSlice(result.count));
  });
};

export const createOrUpdateArticle = (id: string | null, values: IArticleInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const editorTempFiles = getArticleEditorTempFilesSelector(state);

    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }
    const type: 'create' | 'update' = id ? 'update' : 'create';
    let article: IArticle | undefined;

    if (type === 'update' && id) {
      article = await getArticle(id);
    } else {
      article = new Article();
    }

    let uploadValues: Record<string, any> = {};

    if (type === 'create') {
      uploadValues = await uploadFormFiles<IArticleInput>({
        folder: 'articles',
        sessionToken: currentUser.getSessionToken(),
        values,
        locale,
      });
    } else {
      uploadValues = await uploadUpdatedFormFiles<IArticleInput>({
        parseObj: article!,
        folder: 'articles',
        sessionToken: currentUser.getSessionToken(),
        values,
        singleUploadFields: ARTICLE_SINGLE_IMAGE_FIELDS,
        locale,
      });
    }

    if (!article) return;

    const newValues: Record<string, any> = {
      ...values,
      ...uploadValues,
      editorFiles: editorTempFiles,
      translated: articleCodec.decode(values),
    };

    if (values.categories) {
      newValues.categories = getCategoryPointersFromIds(values.categories as string[]);
    }

    setValues(article, newValues, ARTICLE_PROPERTIES);

    const savedArticle = await article.save();

    dispatch(loadArticleSlice(savedArticle));
    // clear the temp editor files
    dispatch(clearArticleEditorTempFilesSlice());
  },
  // rights
  {
    collection,
    action: id ? 'update' : 'create',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:thisArticle') }),
  });
};

/**
 *
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @returns
 */
export const deleteArticle = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- request --------- //
    const article = await getArticle(id);

    if (!article) return;

    /*
     * --------- update database --------- //
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    article.set('deleted', true);
    const deletedArticle = await article.save();

    // --------- update store --------- //
    dispatch(deleteArticleFromArticlesSlice(deletedArticle.id));
    dispatch(setMessageSlice(i18n.t('cms:messages.articleDeletedSuccessfully', { value: deletedArticle.id })));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

/**
 * mark seen field as true
 * so that its not more treated as notification
 * ex: (['xxx', 'yyy'], seen, false)
 * @param ids
 * @returns
 */
export const toggleArticlesByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // update the database
    await new Parse.Query(Article)
      .containedIn('objectId', ids)
      .each(async (article) => {
        article.set(field, value);
        await article.save();
      });
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
    const article = await getArticle(route.params?.id, ['categories']);

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
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    dispatch(clearArticleSlice());
    await dispatch(loadCategoriesOptions(CategoryEntityEnum.ARTICLE));
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
export const onArticlesLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearArticlesSlice());
    dispatch(clearArticleCountSlice());
  };
};

export const onCreateOrEditArticleLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearArticleEditorTempFilesSlice());
    dispatch(clearCategoriesOptionsSlice());
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
