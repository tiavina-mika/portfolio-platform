import { Outlet, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import CMSFormLayout from '@/containers/cms/CMSFormLayout';
import CreateProject from '@/pages/projects/CreateProject';
import EditProject from '@/pages/projects/EditProject';
import Project from '@/pages/projects/Project';
import Projects from '@/pages/projects/Projects';
import {
  onProjectEnter,
  onProjectsEnter,
  onCreateProjectEnter,
  onEditProjectEnter,
  onProjectsLeave,
  onCreateOrEditProjectLeave,
} from '@/redux/actions/project.action';
import { onEnter } from '@/redux/actions/util.action';
import { IIdParams } from '@/types/app.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { tabAndCategoryRouteSearchParams } from '@/validations/app.validations';

import { privateLayout } from './private.routes';

export const projectsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.projects,
});

export const projectsRoute = createRoute({
  validateSearch: search => tabAndCategoryRouteSearchParams.parse(search),
  getParentRoute: () => projectsLayout,
  beforeLoad: onEnter(onProjectsEnter),
  onLeave: onEnter(onProjectsLeave),
  component: Projects,
  path: '/',
});

export const projectFormLayout = createRoute({
  id: 'project',
  getParentRoute: () => projectsLayout,
  component: CMSFormLayout,
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
  onLeave: onEnter(onCreateOrEditProjectLeave),
  getParentRoute: () => projectFormLayout,
  component: EditProject,
});

export const createProjectRoute = createRoute({
  path: PATH_NAMES.create,
  beforeLoad: onEnter(onCreateProjectEnter),
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
