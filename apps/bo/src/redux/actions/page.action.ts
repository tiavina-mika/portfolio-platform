import Parse from 'parse';

import i18n,
{ locales } from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import { ALL_PAGE_FIELDS } from '@/constants/cms.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { IQueriesInput, ITabAndCategorySearchParams } from '@/types/app.type';
import { CategoryEntityEnum } from '@/types/category.type';
import { IPage, IPageInput, IPageSection } from '@/types/page.type';
import { convertSearchParamsToFilters, isCurrentTab } from '@/utils/app.utils';
import { getCategoryPointersFromIds } from '@/utils/cms.utils';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/utils/constants';
import { uploadFormFiles, uploadUpdatedFormFiles } from '@/utils/file.utils';
import { setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { getTranslatedField } from '@/utils/settings.utils';
import { getWebsiteUrl } from '@/utils/utils';
import { PAGE_IMAGES_FIELDS } from '@/validations/file.validation';
import { pageCodec } from '@/validations/page.validations';

import { loadCategoriesOptions } from './category.action';
import { setMessageSlice } from '../reducers/app.reducer';
import {
  clearPageCountSlice,
  clearPageEditorTempFilesSlice,
  clearPageSlice,
  clearPagesSlice,
  deletePageFromPagesSlice,
  deletePagesSlice,
  getPageEditorTempFilesSelector,
  loadPageSlice,
  loadPagesSlice,
  loadSectionsByPageSlice,
  setPagesCountSlice,
} from '../reducers/page.reducer';
import { getSettingsLocaleSelector } from '../reducers/settings.reducer';

const collection = 'Page';
const Page = Parse.Object.extend(collection);

const PAGE_PROPERTIES = new Set([
  'translated',
  'categories',
  'linkLocations',
  ...ALL_PAGE_FIELDS,
]);

export const getPage = async (id: string, include: string[] = []): Promise<IPage | undefined> => {
  const page = await Parse.Cloud.run('getPage', { id, include });

  return page;
};

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadPages = ({
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
    const result: Record<string, any> = await Parse.Cloud.run('getPages', {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
      include,
    });

    dispatch(loadPagesSlice(result.results));
    dispatch(setPagesCountSlice(result.count));
  });
};

export const createOrUpdatePage = (id: string | null, values: IPageInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const editorTempFiles = getPageEditorTempFilesSelector(state);
    const locale = getSettingsLocaleSelector(state);

    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) {
      throw new Error(i18n.t('user:errors.userNotExist'));
    }

    const type: 'create' | 'update' = id ? 'update' : 'create';
    let page: IPage | undefined;

    if (id) {
      page = await getPage(id);
    } else {
      page = new Page();
    }

    let uploadValues: Record<string, any> = {};

    if (type === 'create') {
      uploadValues = await uploadFormFiles<IPageInput>({
        folder: 'pages',
        sessionToken: currentUser.getSessionToken(),
        values,
        multipleUploadFields: PAGE_IMAGES_FIELDS,
        locale,
      });
    } else {
      uploadValues = await uploadUpdatedFormFiles<IPageInput>({
        parseObj: page!,
        folder: 'pages',
        sessionToken: currentUser.getSessionToken(),
        values,
        multipleUploadFields: PAGE_IMAGES_FIELDS,
        locale,
      });
    }

    if (!page) return;

    const newValues: Record<string, any> = {
      ...values,
      ...uploadValues,
      editorFiles: editorTempFiles,
      translated: pageCodec.decode(values),
    };

    if (values.categories) {
      newValues.categories = getCategoryPointersFromIds(values.categories);
    }

    setValues(page, newValues, PAGE_PROPERTIES);

    const savedPage = await page.save();

    dispatch(loadPageSlice(savedPage));
    // clear the temp editor files
    dispatch(clearPageEditorTempFilesSlice());
  },
  // rights
  {
    collection,
    action: id ? 'update' : 'create',
    hasNoRightErrorMessage: i18n.t(`common:errors.hasNoRightTo${id ? 'Update' : 'Create'}`, { value: i18n.t('cms:thisPage') }),
  });
};

/**
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @param redirectToRecycleBin redirect to recycle bin after the request is deleted
 * @returns
 */
export const deletePage = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const page = await getPage(id);

    if (!page) return;

    /*
     * --------- update database --------- //
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    page.set('deleted', true);
    const deletedPage = await page.save();

    // --------- update store --------- //
    dispatch(deletePageFromPagesSlice(deletedPage.id));
    dispatch(setMessageSlice(i18n.t('cms:messages.pageDeletedSuccessfully', { value: deletedPage.id })));
  },
  // rights
  {
    collection,
    action: 'delete',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToDelete', { value: i18n.t('cms:thisPage') }),
  });
};

/**
 * mark seen field as true
 * so that its not more treated as notification
 * ex: (['xxx', 'yyy'], seen, false)
 * @param ids
 * @returns
 */
export const togglePagesByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await new Parse.Query(Page).containedIn('objectId', ids).each(async (page) => {
      page.set(field, value);
      await page.save();
    });
    // delete
    dispatch(deletePagesSlice(ids));
  },
  // rights
  {
    collection,
    action: field === 'deleted'
      ? 'delete'
      : 'update',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * load pages data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onPagesEnter = (route: any): any => {
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
      acceptedFields: ['deleted'],
    });

    values.filters = newFilters;

    dispatch(loadPages(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onPageEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params?.id) return;
    const page = await getPage(route.params?.id, ['categories', 'blocks']);

    if (!page) {
      throw new Error(Errors.notFound);
    }

    const sections = await new Parse.Query('PageSection')
      .equalTo('pages', page)
      .select(['translated', 'blocks'])
      .find() || [];

    dispatch(loadPageSlice(page));
    dispatch(loadSectionsByPageSlice(sections as IPageSection[]));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

export const onEditPageEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params?.id) return;
    const page = await getPage(route.params?.id, ['category']);

    if (!page) {
      throw new Error(Errors.notFound);
    }

    // clear the temp editor files
    dispatch(clearPageEditorTempFilesSlice());
    dispatch(loadPageSlice(page));
    dispatch(loadCategoriesOptions(CategoryEntityEnum.PAGE));
  },
  // rights
  {
    collection,
    action: 'update',
  });
};

export const onCreatePageEnter = (): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearPageSlice());
    dispatch(loadCategoriesOptions(CategoryEntityEnum.PAGE));
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
export const onPagesLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearPagesSlice());
    dispatch(clearPageCountSlice());
  };
};

export const onCreateOrEditPageLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearPageEditorTempFilesSlice());
  };
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToPages = (searchParams?: ITabAndCategorySearchParams): any => ({
  to: PATH_NAMES.pages,
  search: searchParams,
});
export const goToPage = (id: string): any => ({ to: PATH_NAMES.pages + '/$id', params: { id } });
export const goToAddPage = (): any => ({ to: PATH_NAMES.pages + '/' + PATH_NAMES.create });
export const goToEditPage = (id: string): any => ({ to: PATH_NAMES.pages + '/$id/' + PATH_NAMES.edit, params: { id } });

/**
 * open the page in the website
 * NOTE: change this if the website url structure change
 * @param locale
 * @param slug
 * @returns website url, ex: https://www.example.com/en/my-page
 */
export const goToPageOnWebsite = (translated: Record<string, any>, locale: string): string => {
  const hostname = getWebsiteUrl();
  const slug = getTranslatedField(translated, locale, 'slug');

  return `${hostname}/${locale}/${slug}`;
};
