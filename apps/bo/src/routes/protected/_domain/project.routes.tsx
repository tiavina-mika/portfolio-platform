import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import { onEnter, onLeave } from '@/redux/actions/_core/util.action';
import {
  onProjectEnter,
  onProjectsEnter,
  onCreateProjectEnter,
  onCreateOrEditProjectLeave,
  onEditProjectEnter,
} from '@/redux/actions/_domain/project.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { projectsRouteSearchParams } from '@/validations/_domain/project.validations';


const CmsFormWideLayout = lazy(() => import('@/containers/_core/cms/CmsFormWideLayout'));
const Project = lazy(() => import('@/pages/_domain/project/Project'));
const Projects = lazy(() => import('@/pages/_domain/project/Projects'));
const CreateProject = lazy(() => import('@/pages/_domain/project/CreateProject'));
const EditProject = lazy(() => import('@/pages/_domain/project/EditProject'));


export const projectsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.projects,
  staticData: { breadcrumb: { labelKey: 'project:project.projects' } },
});

export const projectsRoute = createRoute({
  validateSearch: search => projectsRouteSearchParams.parse(search),
  getParentRoute: () => projectsLayout,
  beforeLoad: onEnter(onProjectsEnter),
  component: Projects,
  path: '/',
});

export const projectFormLayout = createRoute({
  id: 'project',
  getParentRoute: () => projectsLayout,
  component: CmsFormWideLayout,
});

export const projectRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  beforeLoad: onEnter(onProjectEnter),
  getParentRoute: () => projectsLayout,
  component: Project,
  path: '$id',
});

export const editProjectRoute = createRoute({
  parseParams: (params: any) => ({ id: z.string().parse(params.id) }),
  path: `$id/${PATH_NAMES.edit}`,
  beforeLoad: onEnter(onEditProjectEnter),
  onLeave: onLeave(onCreateOrEditProjectLeave),
  getParentRoute: () => projectFormLayout,
  component: EditProject,
});

export const createProjectRoute = createRoute({
  path: PATH_NAMES.create,
  beforeLoad: onEnter(onCreateProjectEnter),
  onLeave: onLeave(onCreateOrEditProjectLeave),
  getParentRoute: () => projectFormLayout,
  component: CreateProject,
});

const projectRoutes = [
  projectsRoute,
  projectRoute,
  projectFormLayout.addChildren([
    createProjectRoute,
    editProjectRoute,
  ]),
];

export default projectRoutes;
