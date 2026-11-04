import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import CreateButton from '@/components/CreateButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import ListWithSelection from '@/components/table/ListWithSelection';
import UserCell from '@/components/UserCell';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/_core/app.constants';
import { CMS_JSON_DOWNLOAD_IGNORED_FIELDS } from '@/constants/_core/cms.constants';
import { PROJECT_COLLECTION } from '@/constants/_domain/project.constants';
import ProjectStatusCell from '@/containers/_domain/project/ProjectStatusCell';
import ProjectTechnologiesCell from '@/containers/_domain/project/ProjectTechnologiesCell';
import ProjectTitleCell from '@/containers/_domain/project/ProjectTitleCell';
import SearchProjects from '@/containers/_domain/project/SearchProjects';
import { useProtect } from '@/hooks/_core/useProtect';
import { destroyObjects } from '@/redux/actions/_core/app.action';
import {
  deleteProject,
  exportProjects,
  goToAddProject,
  goToEditProject,
  goToProject,
  goToProjectsOnWebsite,
  loadProjects,
  toggleProjectsByIds,
} from '@/redux/actions/_domain/project.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import {
  deleteProjectsSlice, getProjectCountSelector, getProjectProjectsSelector,
} from '@/redux/reducers/_domain/project.reducer';
import { projectsRoute } from '@/routes/protected/_domain/project.routes';
import {
  ExportFormat,
  IQueriesInput,
  IRenderSearchProps, ITableHeadCell,
} from '@/types/_core/app.type';
import { IProject, IProjectTranslatedFields } from '@/types/_domain/project.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { downloadObjectAsJson } from '@/utils/_core/download.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { ProjectsRouteSearchParams } from '@/validations/_domain/project.validations';

interface IData {
  project: ReactNode;
  updated: ReactNode;
  user: ReactNode | null;
  technologies: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

/*
 * The columns answer, in order, the questions an editor asks of a project: what it is, when it was
 * last touched, who wrote it, what it was built with and whether it is on the site.
 */
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'project',
    label: i18n.t('project:project.project'),
    width: 280,
    // the name lives under `translated.<locale>.name`, there is no one field to order on
    disableSorting: true,
  },
  {
    id: 'updated',
    label: i18n.t('common:updatedAt'),
    sortFields: [
      { id: 'updatedAt', label: i18n.t('common:updatedAt') },
      { id: 'createdAt', label: i18n.t('common:createdAt') },
    ],
  },
  {
    id: 'user',
    label: i18n.t('cms:author'),
    align: 'left',
  },
  {
    id: 'technologies',
    label: i18n.t('project:project.technologies'),
    disableSorting: true,
  },
  {
    id: 'status',
    label: i18n.t('common:status'),
    // read off `active` and `deleted` together, neither of the two alone orders the column
    disableSorting: true,
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
  },
];

const collection = PROJECT_COLLECTION;

const Projects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const projects = useSelector(getProjectProjectsSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const count = useSelector(getProjectCountSelector);
  const searchParams: ProjectsRouteSearchParams = projectsRoute.useSearch();

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    canCreate,
  } = useProtect(collection);

  const { t } = useTranslation(['cms', 'project']);

  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

  // destroy objects (in recycle bin)
  const handleDestroy = useCallback(
    (id: string | string[]): void => {
      const options = {
        collection, messageLabel: t('project:project.projects'), updateListCallback: deleteProjectsSlice,
      };
      const ids = Array.isArray(id) ? id : [id];

      dispatch(destroyObjects(ids, options));
    },
    [dispatch, t]
  );

  const handleDelete = useCallback(
    (project: IProject): void => {
      dispatch(deleteProject(project.id));
    },
    [dispatch]
  );

  const handlePreview = useCallback(
    (id: string): void => {
      navigate(goToProject(id));
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (project: IProject): void => {
      navigate(goToEditProject(project.id));
    },
    [navigate]
  );

  const handleDownloadJson = useCallback(
    (project: IProject): void => {
      downloadObjectAsJson(project, CMS_JSON_DOWNLOAD_IGNORED_FIELDS, `project-${project.id}`);
    },
    []
  );

  const handleCreate = (): void => {
    navigate(goToAddProject());
  };

  // puts a deleted row back in the list: the same soft-delete flag, flipped
  const handleRestore = useCallback(
    (id: string): void => {
      dispatch(toggleProjectsByIds([id], 'deleted', false));
    },
    [dispatch]
  );

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(toggleProjectsByIds(ids, 'deleted', true));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadProjects(queries));
  };

  const handleExport = (format: ExportFormat, queries: IQueriesInput) => {
    dispatch(exportProjects(queries, format));
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    return projects.map((project: IProject) => {
      const name = getTranslatedField<IProjectTranslatedFields>(project.translated, locale, 'name');
      // default data
      const data: Record<string, any> = {
        id: project.id, // required even if not displayed
        project: <ProjectTitleCell locale={locale} project={project} />,
        updated: displayDate(project.updatedAt, true, true),
        user: (project.user !== undefined)
          ? <UserCell compact contactType="email" user={project.user} />
          : null,
        technologies: <ProjectTechnologiesCell project={project} />,
        status: <ProjectStatusCell project={project} />,
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={name}
              onDestroy={() => handleDestroy(project.id)}
              onDownloadJson={() => handleDownloadJson(project)}
              onPreview={() => handlePreview(project.id)}
              onRestore={() => handleRestore(project.id)}
              type="row"
            />
          )
          : (
            <ActionsMenu
              label={name}
              onDownloadJson={() => handleDownloadJson(project)}
              type="row"
              websiteUrl={goToProjectsOnWebsite(project.translated, locale)}
              onDelete={canDelete
                ? () => handleDelete(project)
                : undefined}
              onEdit={canEdit
                ? () => handleEdit(project)
                : undefined}
              onPreview={canPreview
                ? () => handlePreview(project.id)
                : undefined}
            />
          ),
      };

      return data as IData;
    });
  }, [
    projects,
    handleDelete,
    handlePreview,
    handleDestroy,
    handleEdit,
    handleDownloadJson,
    handleRestore,
    locale,
    canDelete,
    canEdit,
    canPreview,
    isRecycleBin,
  ]);

  return (
    <>
      <Head title={t('project:project.projects')} />
      <PageHeader
        actions={canCreate && <CreateButton label={t('project:project.createProject')} onClick={handleCreate} />}
        title={t('project:project.projects')}
      />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams} // @see project.routes.tsx
        headCells={headCells}
        items={dataTable}
        onDeleteSelected={handleDeleteSelected}
        onExport={handleExport}
        onUpdateData={handleUpdateData}
        renderFilter={(props: IRenderSearchProps) => <SearchProjects {...props} />}
        tabs={recycleBinTabOptions}
      />
    </>
  );
};

export default Projects;
