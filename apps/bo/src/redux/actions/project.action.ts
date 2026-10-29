import Parse from 'parse';


import i18n, { locales } from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import { ALL_PROJECT_FIELDS } from '@/constants/project.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { IQueriesInput, ITabAndCategorySearchParams } from '@/types/app.type';
import { IProject, IProjectInput } from '@/types/project.type';
import { convertSearchParamsToFilters } from '@/utils/app.utils';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/utils/constants';
import { uploadFormFiles, uploadUpdatedFormFiles } from '@/utils/file.utils';
import { setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { setProjectDateRangeToDateStartAndEnd } from '@/utils/project.utils';
import { getTranslatedField } from '@/utils/settings.utils';
import { getWebsiteUrl } from '@/utils/utils';
import { PROJECT_SINGLE_IMAGE_FIELDS } from '@/validations/file.validation';
import { projectCodec } from '@/validations/project.validation';

import { setMessageSlice } from '../reducers/app.reducer';
import {
  clearProjectCountSlice,
  clearProjectEditorTempFilesSlice,
  clearProjectSlice,
  clearProjectsSlice,
  deleteProjectFromProjectsSlice,
  deleteProjectsSlice,
  getProjectEditorTempFilesSelector, loadProjectSlice, loadProjectsSlice, setProjectsCountSlice,
} from '../reducers/project.reducer';
import { getSettingsLocaleSelector } from '../reducers/settings.reducer';

const collection = 'Project';
const Project = Parse.Object.extend(collection);

const PROJECT_PROPERTIES = new Set(ALL_PROJECT_FIELDS);

export const getProject = async (id: string, include: string[] = []): Promise<IProject | undefined> => {
  const project = await Parse.Cloud.run('getProject', { id, include });

  return project;
};

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadProjects = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'updatedAt',
  order = 'desc',
  filters,
  search,
}: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    /*
     * result with count
     * we make it server side because we need to get user infos
     */
    const result: Record<string, any> = await Parse.Cloud.run('getProjects', {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
    });

    // save projects to store (in json)
    dispatch(loadProjectsSlice(result.results));
    dispatch(setProjectsCountSlice(result.count));
  });
};

export const createOrUpdateProject = (id: string | null, values: IProjectInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const editorTempFiles = getProjectEditorTempFilesSelector(state);
    const locale = getSettingsLocaleSelector(state);

    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }
    const type: 'create' | 'update' = id ? 'update' : 'create';
    let project: IProject | undefined;

    if (type === 'update' && id) {
      project = await getProject(id);
    } else {
      project = new Project();
    }

    let uploadValues: Record<string, any> = {};

    if (type === 'create') {
      uploadValues = await uploadFormFiles<IProjectInput>({
        folder: 'projects',
        sessionToken: currentUser.getSessionToken(),
        values,
        multipleUploadFields: ['images'],
        singleUploadFields: PROJECT_SINGLE_IMAGE_FIELDS,
        locale,
      });
    } else {
      uploadValues = await uploadUpdatedFormFiles<IProjectInput>({
        parseObj: project!,
        folder: 'projects',
        sessionToken: currentUser.getSessionToken(),
        values,
        singleUploadFields: PROJECT_SINGLE_IMAGE_FIELDS,
        multipleUploadFields: ['images'],
        locale,
      });
    }

    if (!project) return;

    const newValues: Record<string, any> = {
      ...values,
      ...uploadValues,
      editorFiles: editorTempFiles,
      translated: projectCodec.decode(values),
    };

    // convert dateRange to dateStart and dateEnd
    setProjectDateRangeToDateStartAndEnd(project, newValues.dateRange);

    setValues(project, newValues, PROJECT_PROPERTIES);

    const updatedProject = await project.save();

    dispatch(loadProjectSlice(updatedProject));
    // clear the temp editor files
    dispatch(clearProjectEditorTempFilesSlice());
  },
  // rights
  {
    collection,
    action: id ? 'update' : 'create',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:thisArticle') }),
  });
};


/**
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @param redirectToRecycleBin redirect to recycle bin after the request is deleted
 * @returns
 */
export const deleteProject = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- request --------- //
    const project = await getProject(id);

    if (!project) return;

    /*
     * --------- update database --------- //
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    project.set('deleted', true);
    const deletedProject = await project.save();

    // --------- update store --------- //
    dispatch(deleteProjectFromProjectsSlice(deletedProject.id));
    dispatch(setMessageSlice(i18n.t('common:project.messages.deletedSuccessfully', { value: deletedProject.id })));
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
export const toggleProjectsByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // update the database
    await new Parse.Query(Project)
      .containedIn('objectId', ids)
      .each(async (project) => {
        project.set(field, value);
        await project.save();
      });
    // delete
    dispatch(deleteProjectsSlice(ids));
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
 * load projects data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onProjectsEnter = (route: any): any => {
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
      acceptedFields: ['deleted', 'types'],
    });

    values.filters = newFilters;

    dispatch(loadProjects(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onProjectEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const project = await getProject(route.params?.id);

    if (!project) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadProjectSlice(project));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

export const onEditProjectEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const project = await getProject(route.params?.id);

    if (!project) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadProjectSlice(project));
  },
  // rights
  {
    collection,
    action: 'update',
  });
};

export const onCreateProjectEnter = (): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    dispatch(clearProjectSlice());
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
export const onProjectsLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearProjectsSlice());
    dispatch(clearProjectCountSlice());
  };
};


export const onCreateOrEditProjectLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearProjectEditorTempFilesSlice());
  };
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToProjects = (searchParams?: ITabAndCategorySearchParams): any => ({
  to: PATH_NAMES.projects,
  search: searchParams,
});
export const goToProject = (id: string): any => ({ to: PATH_NAMES.projects + '/$id', params: { id } });
export const goToAddProject = (): any => ({ to: PATH_NAMES.projects + '/' + PATH_NAMES.create });
export const goToEditProject = (id: string): any => ({ to: PATH_NAMES.projects + '/$id/' + PATH_NAMES.edit, params: { id } });

/**
 * open the page in the website
 * NOTE: change this if the website url structure change
 * @param locale
 * @param slug
 * @returns website url, ex: https://www.example.com/en/my-page
 */
export const goToProjectsOnWebsite = (translated: Record<string, any>, locale: string): string => {
  const hostname = getWebsiteUrl();
  const pathname = i18n.t('route:website.projects');
  const slug = getTranslatedField(translated, locale, 'slug');

  return `${hostname}/${locale}/${pathname}/${slug}`;
};
