import {
  createRouter,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  notFound,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import NotFoundPage from '@/pages/NotFoundPage';
import { logout } from '@/redux/actions/auth.action';
import { onEnter } from '@/redux/actions/util.action';
import { IRouteContext } from '@/types/app.type';
import { PATH_NAMES } from '@/utils/pathnames';

import privateRoutes from './protected/private.routes';
import accountPublicRoutes from './public/account.routes';
import authPublicRoutes from './public/auth.routes';


export const appLayout = createRootRouteWithContext<IRouteContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
  notFoundComponent: () => (
    <NotFoundPage />
  ),
});

const logoutRoute = createRoute({
  path: PATH_NAMES.logout,
  getParentRoute: () => appLayout,
  component: () => <>...Loading</>,
  beforeLoad: onEnter(logout),
});

/**
 * we need this route to navigate to 404 page
 * so we can redirect to 404 page in page or actions (onEnter) using useNavigate (instead of throwing error)
 */
export const notFoundRoute = createRoute({
  path: PATH_NAMES.notFound,
  getParentRoute: () => appLayout,
  beforeLoad: () => {
    const shouldRedirect = true;

    if (shouldRedirect) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw notFound();
    }
    return null;
  },
  component: () => null,
});

const routeTree = appLayout.addChildren([
  authPublicRoutes,
  accountPublicRoutes,
  privateRoutes,
  logoutRoute,
  notFoundRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    // This will be set after we wrap the app in an AuthProvider
    store: undefined!,
  },
});

export default router;
