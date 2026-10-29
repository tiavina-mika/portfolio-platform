import i18n from '@/config/i18n';
import {
  recycleBinTabOptions,
  DEFAULT_PAGINATION, Errors, EXPORT_MAX_ROWS, PAGINATION,
} from '@/constants/_core/app.constants';
import { PROJECT_COLLECTION } from '@/constants/_domain/project.constants';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import { clearErrorSlice, setInfoMessageSlice, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { clearContentVersionsSlice } from '@/redux/reducers/_core/contentVersion.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import {
  clearProjectCountSlice,
  clearProjectEditorTempFilesSlice,
  clearProjectSlice,
  clearProjectsSlice,
  deleteProjectFromProjectsSlice,
  deleteProjectsSlice,
  getProjectEditorTempFilesSelector,
  loadProjectSlice,
  loadProjectsSlice,
  setProjectsCountSlice,
} from '@/redux/reducers/_domain/project.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import { fetchEntityListForExport } from '@/services/_core/crud.service';
import {
  fetchProject, fetchProjects, saveProject, setProjectActive, toggleProjectsFieldByIds,
} from '@/services/_domain/project.service';
import { ExportFormat, IExportColumn, IQueriesInput } from '@/types/_core/app.type';
import { Locale } from '@/types/_core/setting.type';
import { IProject, IProjectInput, IProjectTranslatedFields } from '@/types/_domain/project.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { assertNoConcurrentEdit } from '@/utils/_core/parse.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { getWebsiteUrl } from '@/utils/_core/utils';
import {
  getProjectStatus, getProjectTypeLabel, getTranslatedProjectStatusLabel,
} from '@/utils/_domain/project.utils';
import { ProjectsRouteSearchParams } from '@/validations/_domain/project.validations';

const collection = PROJECT_COLLECTION;

const getProjectExportColumns = (locale: Locale): IExportColumn<IProject>[] => [
  {
    header: i18n.t('common:name'),
    getValue: (project) => getTranslatedField<IProjectTranslatedFields>(project.translated, locale, 'name'),
  },
  {
    header: i18n.t('cms:title'),
    getValue: (project) => getTranslatedField<IProjectTranslatedFields>(project.translated, locale, 'title'),
  },
  {
    header: i18n.t('project:project.projectTypes'),
    getValue: (project) => (project.types ?? []).map(getProjectTypeLabel).join(', '),
  },
  {
    header: i18n.t('project:project.technologies'),
    getValue: (project) => (project.technologies ?? []).join(', '),
  },
  {
    header: i18n.t('project:project.society'),
    getValue: (project) => project.society ?? '',
  },
  {
    header: i18n.t('common:status'),
    getValue: (project) => getTranslatedProjectStatusLabel(getProjectStatus(project)),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (project) => displayDate(project.createdAt, false, true),
  },
  {
    header: i18n.t('common:updatedAt'),
    getValue: (project) => displayDate(project.updatedAt, false, true),
  },
];

export const getProject = fetchProject;

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */

export const loadProjects = (queries: IQueriesInput): any => {
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
    const result = await fetchProjects({
      limit, skip, orderBy, order, filters, search, include,
    });

    dispatch(loadProjectsSlice(result.results));
    dispatch(setProjectsCountSlice(result.count));
    rememberListQuery(loadProjectsSlice, queries);
  });
};

/**
 * exports the projects the toolbar was scoped to (every one matching the current filters, one page,
 * or the rows ticked) as CSV/Excel
 * @param queries current filters/search/order from the list, bounded by EXPORT_MAX_ROWS
 * @param format
 */
export const exportProjects = (queries: IQueriesInput, format: ExportFormat): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const locale = getSettingsLocaleSelector(getState?.()!);
    const { ids, ...listQueries } = queries;

    const result = await fetchEntityListForExport<IProject>('getProjects', listQueries, EXPORT_MAX_ROWS);
    const rows = ids?.length
      ? result.results.filter((project) => ids.includes(project.id))
      : result.results;

    await exportRows(rows, getProjectExportColumns(locale), 'projects', format);

    if (!listQueries.limit && result.count > EXPORT_MAX_ROWS) {
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

type SaveProjectParams = {
  id?: string | null | undefined;
  values: IProjectInput;
  // `updatedAt` the admin last saw when opening the edit form, used for optimistic locking
  expectedUpdatedAt?: string;
  onSuccess?: (id: string) => void;
};

export const createOrUpdateProject = ({
  id,
  values,
  expectedUpdatedAt,
  onSuccess,
}: SaveProjectParams): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const editorTempFiles = getProjectEditorTempFilesSelector(state);

    const sessionToken = await fetchCurrentUserSessionToken();

    if (!sessionToken) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    let existingProject: IProject | undefined;

    if (id) {
      existingProject = await getProject(id);

      if (!existingProject) return;
      assertNoConcurrentEdit(existingProject, expectedUpdatedAt);
    }

    const savedProject = await saveProject({
      id, existingProject, values, sessionToken, locale, editorTempFiles,
    });

    dispatch(loadProjectSlice(savedProject));
    // clear the temp editor files
    dispatch(clearProjectEditorTempFilesSlice());
    onSuccess?.(savedProject.id);
  },
  // rights
  {
    collection,
    action: id ? 'update' : 'create',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', {
      value: i18n.t('project:project.thisProject'),
    }),
  });
};

/*
 * generic deleteOne thunk, shared with every list through the CRUD factory. The list, the export and
 * the bulk toggle stay hand-written: they forward the `include` and `ids` the factory does not.
 */
const projectCrud = createCrudThunks<IProject>({
  collection,
  listCloudFunction: 'getProjects',
  getOne: (id: string) => getProject(id),
  slice: {
    loadListSlice: loadProjectsSlice,
    setCountSlice: setProjectsCountSlice,
    clearOneSlice: clearProjectSlice,
    clearListSlice: clearProjectsSlice,
    clearCountSlice: clearProjectCountSlice,
    removeFromListSlice: deleteProjectFromProjectsSlice,
    removeManyFromListSlice: deleteProjectsSlice,
  },
  deletedMessage: (id: string) => i18n.t('project:project.messages.deletedSuccessfully', { value: id }),
  hasNoRightToDeleteMessage: i18n.t('common:errors.hasNoRightToDelete', {
    value: i18n.t('project:project.thisProject'),
  }),
});

export const deleteProject: any = projectCrud.deleteOne;

/**
 * Publishes or unpublishes the project currently open, and refreshes what the page shows so the
 * label of the action flips with it.
 */
export const toggleProjectActive = (project: IProject, value: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedProject = await setProjectActive(project, value);

    dispatch(loadProjectSlice(updatedProject));
    dispatch(setMessageSlice(value
      ? i18n.t('project:project.messages.published')
      : i18n.t('project:project.messages.unpublished')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', {
      value: i18n.t('project:project.thisProject'),
    }),
  });
};

/**
 * flips a boolean field on several projects at once and takes them out of the list,
 * ex: (['xxx', 'yyy'], 'deleted', true) sends them to the recycle bin
 * @param ids
 * @param field
 * @param value
 */
export const toggleProjectsByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await toggleProjectsFieldByIds(ids, field, value);
    dispatch(deleteProjectsSlice(ids));
  },
  // rights
  {
    collection,
    action: field === 'deleted'
      ? 'delete'
      : 'update',
    hasNoRightErrorMessage: field === 'deleted'
      ? i18n.t('common:errors.hasNoRightToDelete', { value: i18n.t('project:project.theseProjects') })
      : i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('project:project.theseProjects') }),
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
    values.filters = convertSearchParamsToFilters({
      tabs: recycleBinTabOptions,
      searchParams: route.search,
      filters,
    });

    // clear the prev state first
    dispatch(clearProjectSlice());
    dispatch(clearListUnlessLoadedWith(
      loadProjectsSlice, values, [clearProjectsSlice(), clearProjectCountSlice()]
    ));
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
    if (!route.params?.id) return;
    const project = await getProject(route.params.id);

    if (!project) {
      throw new Error(Errors.notFound);
    }

    // clear the temp editor files
    dispatch(clearProjectEditorTempFilesSlice());
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
    const id = route?.params?.id;

    if (!id) return;
    const project = await getProject(id);

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
  return onEnterActionWithLoader((dispatch: AppDispatch): void => {
    /*
     * clear any project or error left over from a previous view or edit: otherwise the post-save
     * redirect of the create page can be blocked by stale state from before it was even opened
     */
    dispatch(clearProjectSlice());
    dispatch(clearErrorSlice());
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
export const onCreateOrEditProjectLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearProjectEditorTempFilesSlice());
    dispatch(clearContentVersionsSlice());
  };
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToProjects = (searchParams?: ProjectsRouteSearchParams): any => ({
  to: PATH_NAMES.projects,
  search: searchParams,
});
export const goToProject = (id: string): any => ({ to: PATH_NAMES.projects + '/$id', params: { id } });
export const goToAddProject = (): any => ({ to: PATH_NAMES.projects + '/' + PATH_NAMES.create });
export const goToEditProject = (id: string): any => ({
  to: PATH_NAMES.projects + '/$id/' + PATH_NAMES.edit,
  params: { id },
});

/**
 * open the project in the website
 * NOTE: change this if the website url structure change
 * @param translated the translated fields of the project
 * @param locale
 * @returns website url, ex: https://www.example.com/en/projects/my-project
 */
export const goToProjectsOnWebsite = (translated: Record<string, any>, locale: string): string => {
  const hostname = getWebsiteUrl();
  const pathname = i18n.t('route:website.projects');
  const slug = getTranslatedField(translated, locale, 'slug');

  return `${hostname}/${locale}/${pathname}/${slug}`;
};
