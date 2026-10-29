import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import AddFab from '@/components/AddFab';
import Head from '@/components/Head';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import SearchProjects from '@/containers/projects/SearchProjects';
import { useProtect } from '@/hooks/useProtect';
import { destroyObjects } from '@/redux/actions/app.action';
import {
  deleteProject,
  goToAddProject,
  goToProject,
  goToProjectsOnWebsite,
  goToEditProject,
  loadProjects,
  toggleProjectsByIds,
} from '@/redux/actions/project.action';
import { deleteProjectsSlice, getProjectCountSelector, getProjectProjectsSelector } from '@/redux/reducers/project.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { projectsRoute } from '@/routes/protected/project.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/app.type';
import { IProject, IProjectTranslatedFields } from '@/types/project.type';
import { isCurrentTab } from '@/utils/app.utils';
import { displayDate } from '@/utils/date.utils';
import { getTranslatedField } from '@/utils/settings.utils';

interface IData {
  name: string;
  title: string;
  society: string;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
  actions: ReactNode;
}

const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'name',
    label: i18n.t('common:name'),
  },
  {
    id: 'title',
    label: i18n.t('cms:title'),
    align: 'left',
  },
  {
    id: 'society',
    label: i18n.t('project.society'),
    align: 'left',
  },
  {
    id: 'start',
    label: i18n.t('start'),
    align: 'right',
  },
  {
    id: 'end',
    label: i18n.t('end'),
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

const collection = 'Project';

const Projects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const projects = useSelector(getProjectProjectsSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const count = useSelector(getProjectCountSelector);
  const {
    t,
  } = useTranslation();
  const searchParams = projectsRoute.useSearch();

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    canCreate,
  } = useProtect(collection);
  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

  // destroy objects (in recycle bin)
  const handleDestroy = useCallback(
    (id: string | string[]): void => {
      const options = { collection, messageLabel: t('project.projects'), updateListCallback: deleteProjectsSlice };

      const ids = Array.isArray(id) ? id : [id];

      dispatch(destroyObjects(ids, options));
    },
    [dispatch, t]
  );

  // delete a row
  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteProject(id));
    },
    [dispatch]
  );

  // go to preview page
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

  const handleCreate = (): void => {
    navigate(goToAddProject());
  };

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

  // table data
  const dataTable = useMemo((): IData[] => {
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const projectsData = projects.map((project: IProject) => {
      const name = getTranslatedField<IProjectTranslatedFields>(project.get('translated'), locale, 'name');
      // default data
      const data: Record<string, any> = {
        id: project.id, // required even if not displayed
        name,
        title: getTranslatedField<IProjectTranslatedFields>(project.get('translated'), locale, 'title'),
        society: project.get('society'),
        start: project.has('dateStart')
          ? dayjs(project.get('dateStart')).format('MMM YYYY')
          : '',
        end: project.has('dateEnd')
          ? dayjs(project.get('dateEnd')).format('MMM YYYY')
          : '',
        createdAt: displayDate(project.createdAt, false, true, true),
        updatedAt: displayDate(project.updatedAt, false, true, true),
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={name}
              type="icon"
              onDestroy={() => handleDestroy(project.id)}
              onPreview={() => handlePreview(project.id)}
            />
          )
          : (
            <ActionsMenu
              label={name}
              type="icon"
              websiteUrl={goToProjectsOnWebsite(project.get('translated'), locale)}
              onDelete={canDelete
                ? () => handleDelete(project.id)
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

    return projectsData;
  }, [
    projects,
    handleDelete,
    handlePreview,
    handleEdit,
    locale,
    handleDestroy,
    canDelete,
    canDestroy,
    canEdit,
    canPreview,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title={t('project.projects')} />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        headCells={headCells}
        items={dataTable}
        renderFilter={(props: IRenderSearchProps) => <SearchProjects {...props} />}
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

export default Projects;
