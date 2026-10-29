import { CategoryEntityEnum } from '@shared/types';

import i18n from '@/config/i18n';
import {
  recycleBinTabOptions,
  DEFAULT_PAGINATION, Errors, EXPORT_MAX_ROWS, PAGINATION,
} from '@/constants/_core/app.constants';
import { loadCategoryTree } from '@/redux/actions/_core/category.action';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import { clearErrorSlice, setInfoMessageSlice, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { clearContentVersionsSlice } from '@/redux/reducers/_core/contentVersion.reducer';
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
  setPageTabCountsSlice,
} from '@/redux/reducers/_core/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import {
  fetchPage, fetchPages, fetchPagesForExport, fetchPageSections, savePage, setPageActive,
  togglePagesFieldByIds,
} from '@/services/_core/page.service';
import {
  ExportFormat, IExportColumn, IQueriesInput, ITabAndCategorySearchParams,
} from '@/types/_core/app.type';
import {
  IPage, IPageInput, IPageTranslatedFields,
} from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { convertSearchParamsToFilters, isCurrentTab } from '@/utils/_core/app.utils';
import {
  getPageStatus, getTranslatedCategoriesName, getTranslatedPageStatusLabel,
} from '@/utils/_core/cms.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { assertNoConcurrentEdit } from '@/utils/_core/parse.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { getWebsiteUrl } from '@/utils/_core/utils';


const collection = 'Page';

const getPageExportColumns = (locale: Locale): IExportColumn<IPage>[] => [
  {
    header: i18n.t('cms:name'),
    getValue: (page) => getTranslatedField<IPageTranslatedFields>(page.translated, locale, 'name'),
  },
  {
    header: i18n.t('cms:title'),
    getValue: (page) => getTranslatedField<IPageTranslatedFields>(page.translated, locale, 'title'),
  },
  {
    header: i18n.t('cms:technicalCode'),
    getValue: (page) => page.code ?? '',
  },
  {
    header: i18n.t('cms:category.categories'),
    getValue: (page) => getTranslatedCategoriesName(page.categories ?? [], locale),
  },
  {
    header: i18n.t('cms:author'),
    getValue: (page) => (page.user
      ? `${page.user.firstName ?? ''} ${page.user.lastName}`.trim()
      : ''),
  },
  {
    header: i18n.t('cms:sections'),
    getValue: (page) => page.sectionsCount ?? 0,
  },
  {
    header: i18n.t('cms:blocks'),
    getValue: (page) => page.blocksCount ?? 0,
  },
  {
    header: i18n.t('common:status'),
    getValue: (page) => getTranslatedPageStatusLabel(getPageStatus(page)),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (page) => displayDate(page.createdAt, false, true),
  },
  {
    header: i18n.t('common:updatedAt'),
    getValue: (page) => displayDate(page.updatedAt, false, true),
  },
];

export const getPage = fetchPage;

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadPages = (queries: IQueriesInput): any => {
  const {
    limit = PAGINATION.rowsPerPage,
    skip = 0,
    orderBy = 'updatedAt',
    order = 'desc',
    filters,
    search,
    // the list shows the author of every row, and the author is a pointer that has to be resolved
    include = ['categories', 'user'],
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await fetchPages({
      limit, skip, orderBy, order, filters, search, include,
    });

    dispatch(loadPagesSlice(result.results));
    dispatch(setPagesCountSlice(result.count));
    rememberListQuery(loadPagesSlice, queries);
    // the strip above the list states both tabs at once, including the one not being fetched here
    dispatch(setPageTabCountsSlice(result.tabCounts));
  });
};

/**
 * exports every page matching the current filters/search (not just the current page) as CSV/Excel
 * @param queries current filters/search/order from the list (bypasses pagination, bounded by EXPORT_MAX_ROWS)
 * @param format
 */
export const exportPages = (queries: IQueriesInput, format: ExportFormat): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const locale = getSettingsLocaleSelector(getState?.()!);

    const result = await fetchPagesForExport(queries, EXPORT_MAX_ROWS);

    await exportRows(result.results, getPageExportColumns(locale), 'pages', format);

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

type CreateOrUpdatePageParams = {
  id: string | null;
  values: IPageInput;
  expectedUpdatedAt?: string;
  onSuccess?: (id: string) => void;
};
export const createOrUpdatePage = ({
  id,
  values,
  expectedUpdatedAt,
  onSuccess,
}: CreateOrUpdatePageParams): any => {
  const type = id ? 'update' : 'create';

  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const editorTempFiles = getPageEditorTempFilesSelector(state);
    const locale = getSettingsLocaleSelector(state);

    const sessionToken = await fetchCurrentUserSessionToken();

    if (!sessionToken) {
      throw new Error(i18n.t('user:errors.userNotExist'));
    }

    let existingPage: IPage | undefined;

    if (id) {
      existingPage = await getPage(id);

      if (!existingPage) return;
      if (type === 'update') assertNoConcurrentEdit(existingPage, expectedUpdatedAt);
    }

    const savedPage = await savePage({
      id, existingPage, values, sessionToken, locale, editorTempFiles,
    });

    dispatch(loadPageSlice(savedPage));
    dispatch(setMessageSlice(i18n.t(
      type === 'create'
        ? 'cms:messages.pageCreatedSuccessfully'
        : 'cms:messages.pageEditedSuccessfully',
      { value: savedPage.id }
    )));
    // clear the temp editor files
    dispatch(clearPageEditorTempFilesSlice());
    onSuccess?.(savedPage.id);
  },
  // rights
  {
    collection,
    action: type,
    hasNoRightErrorMessage: i18n.t(`common:errors.hasNoRightTo${type === 'create' ? 'Create' : 'Update'}`, { value: i18n.t('cms:thisPage') }),
  });
};

/*
 * generic deleteOne thunk, shared with every list through the CRUD factory. `loadPages`/
 * `exportPages`/`onPagesEnter` stay hand-written: they need a category filter + a conditional
 * `include` the generic factory doesn't support (dropping `include: ['categories']` from the export
 * call would silently break the "Categories" column — Parse pointers only resolve with `.include()`).
 * `togglePagesByIds` also stays hand-written — it batches via `saveAll` instead of `.each()`.
 */
const pageCrud = createCrudThunks<IPage>({
  collection,
  listCloudFunction: 'getPages',
  getOne: (id: string) => getPage(id),
  slice: {
    loadListSlice: loadPagesSlice,
    setCountSlice: setPagesCountSlice,
    clearOneSlice: clearPageSlice,
    clearListSlice: clearPagesSlice,
    clearCountSlice: clearPageCountSlice,
    removeFromListSlice: deletePageFromPagesSlice,
    removeManyFromListSlice: deletePagesSlice,
  },
  deletedMessage: (id: string) => i18n.t('cms:messages.pageDeletedSuccessfully', { value: id }),
  hasNoRightToDeleteMessage: i18n.t('common:errors.hasNoRightToDelete', { value: i18n.t('cms:thisPage') }),
});

export const deletePage: any = pageCrud.deleteOne;

/**
 * mark seen field as true
 * so that its not more treated as notification
 * ex: (['xxx', 'yyy'], seen, false)
 * @param ids
 * @returns
 */
export const togglePagesByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await togglePagesFieldByIds(ids, field, value);
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

/**
 * publish or unpublish a single page (toggles the `active` field)
 * unlike togglePagesByIds, this refreshes the single `page` slice instead of
 * removing the item from the `pages` list slice, since it is used from the page preview screen
 * @param id
 * @param value
 * @returns
 */
export const togglePageActive = (id: string, value: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const page = await getPage(id);

    if (!page) return;

    const updatedPage = await setPageActive(page, value);

    dispatch(loadPageSlice(updatedPage));
    dispatch(setMessageSlice(i18n.t('cms:messages.pageEditedSuccessfully', { value: updatedPage.id })));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:thisPage') }),
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

    dispatch(clearListUnlessLoadedWith(loadPagesSlice, values, [clearPagesSlice(), clearPageCountSlice()]));
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

    // the sections only need the page id the address carries, so both are read at the same time
    const [page, sections] = await Promise.all([
      getPage(route.params?.id, [
        'categories', 'categories.parentCategory', 'categories.parentCategory.parentCategory',
      ]),
      fetchPageSections(route.params.id),
    ]);

    if (!page) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadPageSlice(page));
    dispatch(loadSectionsByPageSlice(sections));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onEditPageEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params?.id) return;
    const page = await getPage(route.params?.id, [
      'categories', 'categories.parentCategory', 'categories.parentCategory.parentCategory',
    ]);

    if (!page) {
      throw new Error(Errors.notFound);
    }

    // clear the temp editor files
    dispatch(clearPageEditorTempFilesSlice());
    dispatch(loadPageSlice(page));
    dispatch(loadCategoryTree(CategoryEntityEnum.PAGE));
  },
  // rights
  {
    collection,
    action: 'update',
  });
};

export const onCreatePageEnter = (): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    /*
     * clear any page/error left over from a previous view or edit — otherwise the post-save
     * redirect effect in CreatePage (which waits for the `page` slice to change and bails if
     * `error` is truthy) can be blocked by stale state from before this page was even opened
     */
    dispatch(clearPageSlice());
    dispatch(clearErrorSlice());
    dispatch(loadCategoryTree(CategoryEntityEnum.PAGE));
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
export const onCreateOrEditPageLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearPageEditorTempFilesSlice());
    dispatch(clearContentVersionsSlice());
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
