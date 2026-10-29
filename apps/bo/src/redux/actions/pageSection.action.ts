import Parse from 'parse';
import { v4 as uuidv4 } from 'uuid';

import i18n,
{ locales } from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { IQueriesInput, ITabAndCategorySearchParams } from '@/types/app.type';
import { IPage, IPageSection, PageSectionInput } from '@/types/page.type';
import { convertSearchParamsToFilters } from '@/utils/app.utils';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/utils/constants';
import { isUpdatedFileChanged, uploadFilesAPI } from '@/utils/file.utils';
import { convertIdToPointer, setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { eachSectionBlockCodec, pageSectionCodec } from '@/validations/page.validations';

import { getPage } from './page.action';
import { setMessageSlice } from '../reducers/app.reducer';
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
} from '../reducers/page.reducer';
import { getSettingsLocaleSelector } from '../reducers/settings.reducer';

const collection = 'PageSection';
const PageSection = Parse.Object.extend(collection);

const SECTION_PROPERTIES = new Set(['active', 'translated', 'blocks', 'pages']);

export const getPageSection = async (
  id: string,
  pageId?: string,
  include: string[] = []
): Promise<{ page: IPage | undefined; section: IPageSection | undefined }> => {
  const section = await new Parse.Query(PageSection)
    .equalTo('objectId', id)
    .include(['blocks', ...include])
    .first() as IPageSection | undefined;

  if (!section) {
    return { page: undefined, section: undefined };
  }

  const page = (section.get('pages') || []).find((p: IPage) => (pageId ? p.id === pageId : true));

  return { page, section };
};

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadPageSections = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'updatedAt',
  order = 'desc',
  filters,
  search,
  include = [],
}: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    /*
     * result with count
     * we make it server side because we need to get user infos
     */
    const result: Record<string, any> = await Parse.Cloud.run('getPageSections', {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
      include,
    });

    dispatch(loadPageSectionsSlice(result.results));
    dispatch(setPageSectionCountSlice(result.count));
  });
};

export const createOrUpdatePageSection = (
  pageId: string, defaultSection: IPageSection | undefined | null, values: PageSectionInput
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    const isEdition = Boolean(defaultSection);

    let section = defaultSection;

    if (!section) {
      section = new PageSection();
    }

    if (!section) return;

    const newValues: Record<string, any> = {
      ...values,
      translated: pageSectionCodec.decode(values),
      pages: isEdition ? section.get('pages') : [convertIdToPointer('Page', pageId)],
    };

    const newBlocks = [];

    if (isEdition) {
      // Update
      for (const blockObj of (newValues.blocks || [])) {
        const newBlockObj: Record<string, any> = {};

        if (!blockObj.id) {
          newBlockObj.id = uuidv4();
        }
        const existingBlock = section
          .get('blocks')
          ?.find((b) => b.id === blockObj.id);

        const isNew = isUpdatedFileChanged(existingBlock?.image!, blockObj.image);

        if (!isNew) {
          if (blockObj.image) {
            const uploadInput = {
              folder: 'pages',
              sessionToken: currentUser.getSessionToken(),
              files: [blockObj.image] as File[],
              locale,
            };
            const files = await uploadFilesAPI(uploadInput);

            [newBlockObj.image] = files;
          }
        } else {
          newBlockObj.image = existingBlock?.image;
        }

        if (blockObj.imagePosition) newBlockObj.imagePosition = blockObj.imagePosition;
        newBlockObj.translated = eachSectionBlockCodec.decode(blockObj);

        newBlocks.push(newBlockObj);
      }
    // Creation
    } else {
      for (const blockObj of (newValues.blocks || [])) {
        const newBlockObj: Record<string, any> = {};

        newBlockObj.id = uuidv4();

        if (blockObj.image) {
          const uploadInput = {
            folder: 'pages',
            sessionToken: currentUser.getSessionToken(),
            files: [blockObj.image] as File[],
            locale,
          };
          const files = await uploadFilesAPI(uploadInput);

          [newBlockObj.image] = files;
        }

        if (blockObj.imagePosition) newBlockObj.imagePosition = blockObj.imagePosition;
        newBlockObj.translated = eachSectionBlockCodec.decode(blockObj);

        newBlocks.push(newBlockObj);
      }
    }
    newValues.blocks = newBlocks;
    setValues(section, newValues, SECTION_PROPERTIES);

    const savedPage = await section.save();

    dispatch(loadPageSectionSlice(savedPage));
    dispatch(setMessageSlice(i18n.t('cms:messages.pageSectionSavedSuccessfully', { value: savedPage.id })));
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
export const deletePageSection = (id: string, pageId?: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { page, section } = await getPageSection(id, pageId, ['pages']);

    if (!section) return;
    /*
     * --------- update database --------- //
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    section.set('deleted', true);
    const deletedPageSection = await section.save();

    const pageSections = page?.get('sections')?.filter((section: IPageSection) => section.id !== id) || [];

    if (page) {
      page.set('sections', pageSections);
      const updatedPage = await page.save();

      dispatch(loadPageSlice(updatedPage));
    }

    // --------- update store --------- //
    dispatch(deletePageSectionsSlice([deletedPageSection.id]));
    dispatch(setMessageSlice(i18n.t('cms:messages.pageSectionDeletedSuccessfully', { value: deletedPageSection.id })));
  },
  // rights
  {
    collection: 'Page',
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
export const togglePageSectionsByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await new Parse.Query(PageSection).containedIn('objectId', ids).each(async (pageSection) => {
      pageSection.set(field, value);
      await pageSection.save();
    });
    // delete
    dispatch(deletePageSectionsSlice(ids));
  },
  // rights
  {
    collection: 'Page',
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
export const onPageSectionsLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearPageSectionsSlice());
    dispatch(clearPageSectionCountSlice());
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
export const goToPageSections = (searchParams?: ITabAndCategorySearchParams): any => ({
  to: PATH_NAMES.pageSections,
  search: searchParams,
});
export const goToPageSection = (id: string): any => ({ to: PATH_NAMES.pageSections + '/$id', params: { id } });
export const goToAddPageSection = (pageId: string): any => ({ to: PATH_NAMES.pageSections + '/$pageId/' + PATH_NAMES.create, params: { pageId } });
export const goToEditPageSection = (pageId: string, id: string): any => {
  return { to: PATH_NAMES.pageSections + '/$pageId/' + PATH_NAMES.edit + '/$id', params: { pageId, id } };
};
