import i18n from '@/config/i18n';
import {
  recycleBinTabOptions, DEFAULT_PAGINATION, Errors, PAGINATION,
} from '@/constants/_core/app.constants';
import { getPage } from '@/redux/actions/_core/page.action';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  clearPageEditorTempFilesSlice,
  clearPageSectionCountSlice,
  clearPageSectionsSlice,
  clearPageSectionSlice,
  deletePageSectionsSlice,
  loadPageSectionSlice,
  loadPageSectionsSlice,
  setPageSectionCountSlice,
  loadPageSlice,
} from '@/redux/reducers/_core/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import {
  deletePageSectionEntity, fetchPageSection, fetchPageSections, saveOrUpdatePageSection, setPageSectionActive,
} from '@/services/_core/pageSection.service';
import { IQueriesInput, ITabAndCategorySearchParams } from '@/types/_core/app.type';
import { IPageSection, PageSectionInput } from '@/types/_core/page.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';


const collection = 'PageSection';

export const getPageSection = fetchPageSection;

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadPageSections = (queries: IQueriesInput): any => {
  const {
    limit = PAGINATION.rowsPerPage,
    skip = 0,
    orderBy = 'updatedAt',
    order = 'desc',
    filters,
    search,
    include = [],
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await fetchPageSections({
      limit, skip, orderBy, order, filters, search, include,
    });

    dispatch(loadPageSectionsSlice(result.results));
    dispatch(setPageSectionCountSlice(result.count));
    rememberListQuery(loadPageSectionsSlice, queries);
  });
};

export const createOrUpdatePageSection = (
  pageId: string, defaultSection: IPageSection | undefined | null, values: PageSectionInput
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const sessionToken = await fetchCurrentUserSessionToken();

    if (!sessionToken) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    const savedSection = await saveOrUpdatePageSection({
      pageId, defaultSection, values, sessionToken, locale,
    });

    dispatch(loadPageSectionSlice(savedSection));
    dispatch(setMessageSlice(i18n.t('cms:messages.pageSectionSavedSuccessfully', { value: savedSection.id })));
  },
  // rights
  {
    collection: 'Page',
    action: defaultSection ? 'update' : 'create',
    hasNoRightErrorMessage: i18n.t(`common:errors.hasNoRightTo${defaultSection ? 'Update' : 'Create'}`, { value: i18n.t('cms:thisPage') }),
  });
};

/**
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @returns
 */
export const deletePageSection = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { section } = await getPageSection(id);

    if (!section) return;
    /*
     * --------- update database --------- //
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    const deletedId = await deletePageSectionEntity(section);

    // --------- update store --------- //
    dispatch(deletePageSectionsSlice([deletedId]));
    dispatch(setMessageSlice(i18n.t('cms:messages.pageSectionDeletedSuccessfully', { value: deletedId })));
  },
  // rights
  {
    collection: 'Page',
    action: 'delete',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToDelete', { value: i18n.t('cms:thisPage') }),
  });
};

/**
 * publish or unpublish a single page section (toggles the `active` field)
 * unlike togglePageSectionsByIds, this refreshes the single `pageSection` slice instead of
 * removing the item from the `pageSections` list slice, since it is used from the section preview screen
 * @param id
 * @param value
 * @returns
 */
export const togglePageSectionActive = (id: string, value: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { section } = await getPageSection(id);

    if (!section) return;

    const updatedSection = await setPageSectionActive(section, value);

    dispatch(loadPageSectionSlice(updatedSection));
    dispatch(setMessageSlice(i18n.t('cms:messages.pageSectionEditedSuccessfully', { value: updatedSection.id })));
  },
  // rights
  {
    collection: 'Page',
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:thisPage') }),
  });
};

/*
 * generic toggleByIds thunk, shared with every list through the CRUD factory. `loadPageSections`/
 * `onPageSectionsEnter` stay hand-written (extra `include` param). `deletePageSection` also stays
 * hand-written — it uses the single hand-written `deletePageSectionEntity` service call instead of
 * the generic factory's `getOne`/`softDeleteEntity` pair.
 * NOTE: rights are checked against the `Page` collection (not `PageSection`, see `collection`
 * below), since section access is governed by the parent page's permissions — but the actual
 * bulk-toggle query below must still target the real `PageSection` Parse class, hence
 * `queryCollection`.
 */
const pageSectionCrud = createCrudThunks<IPageSection>({
  collection: 'Page',
  queryCollection: 'PageSection',
  listCloudFunction: 'getPageSections',
  slice: {
    loadListSlice: loadPageSectionsSlice,
    setCountSlice: setPageSectionCountSlice,
    clearOneSlice: clearPageSectionSlice,
    clearListSlice: clearPageSectionsSlice,
    clearCountSlice: clearPageSectionCountSlice,
    removeManyFromListSlice: deletePageSectionsSlice,
  },
});

export const togglePageSectionsByIds: any = pageSectionCrud.toggleByIds;

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
export const onPageSectionsEnter = (route: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    // convert the url search params tab to (db) filters
    const newFilters = convertSearchParamsToFilters({
      tabs: recycleBinTabOptions,
      searchParams: route.search,
      filters,
      acceptedFields: ['deleted'],
    });

    values.filters = newFilters;

    dispatch(clearListUnlessLoadedWith(
      loadPageSectionsSlice, values, [clearPageSectionsSlice(), clearPageSectionCountSlice()]
    ));
    dispatch(loadPageSections(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onPageSectionEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params) return;
    const { id, pageId } = route.params;

    if (!id) return;
    const { section, page } = await getPageSection(id, pageId, ['pages']);

    if (!section) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadPageSectionSlice(section));

    if (!page) return;
    dispatch(loadPageSlice(page));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

export const onEditPageSectionEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params) return;
    const { id, pageId } = route.params;

    if (!id || !pageId) return;
    const { section, page } = await getPageSection(id, pageId, ['pages']);

    if (!section) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadPageSectionSlice(section));

    if (!page) return;
    dispatch(loadPageSlice(page));
  },
  // rights
  {
    collection: 'Page',
    action: 'update',
  });
};

export const onCreatePageSectionEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    dispatch(clearPageSectionSlice());

    if (!route.params) return;
    const { pageId } = route.params;

    if (!pageId) return;
    const page = await getPage(pageId);

    if (!page) return;
    dispatch(loadPageSlice(page));
  },
  // rights
  {
    collection: 'Page',
    action: 'create',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
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
export const goToPageSections = (searchParams?: ITabAndCategorySearchParams): any => ({
  to: PATH_NAMES.pageSections,
  search: searchParams,
});
export const goToPageSection = (id: string): any => ({ to: PATH_NAMES.pageSections + '/$id', params: { id } });
export const goToAddPageSection = (pageId: string): any => ({ to: PATH_NAMES.pageSections + '/$pageId/' + PATH_NAMES.create, params: { pageId } });
export const goToEditPageSection = (pageId: string, id: string): any => {
  return { to: PATH_NAMES.pageSections + '/$pageId/' + PATH_NAMES.edit + '/$id', params: { pageId, id } };
};
