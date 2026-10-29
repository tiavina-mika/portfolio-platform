import { createRoute } from '@tanstack/react-router';

import Roles from '@/pages/Roles';
import { onRolesEnter, onRolesLeave } from '@/redux/actions/role.action';
import { onEnter } from '@/redux/actions/util.action';
import { PATH_NAMES } from '@/utils/pathnames';

import { privateLayout } from './private.routes';

const rolesRoute = createRoute({
  getParentRoute: () => privateLayout,
  loader: onEnter(onRolesEnter),
  onLeave: onEnter(onRolesLeave),
  component: Roles,
  path: PATH_NAMES.roles,
});

export default rolesRoute;
