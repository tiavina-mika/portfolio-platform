import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onUserEnter, onUserLeave, onUsersEnter,
} from '@/redux/actions/_core/user.action';
import { onEnter, onLeave } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { usersRouteSearchParams } from '@/validations/_core/user.validations';

const User = lazy(() => import('@/pages/_core/users/User'));
const Users = lazy(() => import('@/pages/_core/users/Users'));

export const usersLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.users,
  staticData: { breadcrumb: { labelKey: 'user:users' } },
});

export const usersRoute = createRoute({
  validateSearch: search => usersRouteSearchParams.parse(search),
  getParentRoute: () => usersLayout,
  beforeLoad: onEnter(onUsersEnter),
  component: Users,
  path: '/',
});

export const userRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  getParentRoute: () => usersLayout,
  beforeLoad: onEnter(onUserEnter),
  onLeave: onLeave(onUserLeave),
  component: User,
  path: '$id',
});

const userRoutes = [usersRoute, userRoute];

export default userRoutes;
