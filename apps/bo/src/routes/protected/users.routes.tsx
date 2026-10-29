import { Outlet, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import User from '@/pages/users/User';
import Users from '@/pages/users/Users';
import {
  onUserEnter, onUserLeave, onUsersEnter, onUsersLeave,
} from '@/redux/actions/user.action';
import { onEnter } from '@/redux/actions/util.action';
import { IIdParams } from '@/types/app.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { usersRouteSearchParams } from '@/validations/user.validation';

import { privateLayout } from './private.routes';

export const usersLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.users,
});

export const usersRoute = createRoute({
  validateSearch: search => usersRouteSearchParams.parse(search),
  getParentRoute: () => usersLayout,
  beforeLoad: onEnter(onUsersEnter),
  onLeave: onEnter(onUsersLeave),
  component: Users,
  path: '/',
});

export const userRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  getParentRoute: () => usersLayout,
  beforeLoad: onEnter(onUserEnter),
  onLeave: onEnter(onUserLeave),
  component: User,
  path: '$id',
});

const userRoutes = [usersRoute, userRoute];

export default userRoutes;
