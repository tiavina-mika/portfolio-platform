
import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onCreateOrEditRoleLeave, onCreateRoleEnter, onEditRoleEnter, onRolesEnter,
} from '@/redux/actions/_core/role.action';
import { onEnter, onLeave } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';

const CreateRole = lazy(() => import('@/pages/_core/roles/CreateRole'));
const EditRole = lazy(() => import('@/pages/_core/roles/EditRole'));
const Roles = lazy(() => import('@/pages/_core/Roles'));

export const rolesLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.roles,
  staticData: { breadcrumb: { labelKey: 'user:role.roles' } },
});

export const rolesRoute = createRoute({
  getParentRoute: () => rolesLayout,
  loader: onEnter(onRolesEnter),
  component: Roles,
  path: '/',
});

export const createRoleRoute = createRoute({
  getParentRoute: () => rolesLayout,
  loader: onEnter(onCreateRoleEnter),
  onLeave: onLeave(onCreateOrEditRoleLeave),
  component: CreateRole,
  path: PATH_NAMES.create,
});

export const editRoleRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  getParentRoute: () => rolesLayout,
  loader: onEnter(onEditRoleEnter),
  onLeave: onLeave(onCreateOrEditRoleLeave),
  component: EditRole,
  path: `$id/${PATH_NAMES.edit}`,
});

const roleRoutes = [
  rolesRoute,
  createRoleRoute,
  editRoleRoute,
];

export default roleRoutes;
