import {
  createRouter,
  createRoute,
  notFound,
} from '@tanstack/react-router';

import ErrorPage from '@/pages/_core/ErrorPage';
import UnauthorizedPage from '@/pages/_core/UnauthorizedPage';
import { logout } from '@/redux/actions/_core/auth.action';
import { onEnter } from '@/redux/actions/_core/util.action';
import { appLayout } from '@/routes/app.routes';
import privateRoutes from '@/routes/protected/private.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';

import accountPublicRoutes from './public/account.routes';
import authPublicRoutes from './public/auth.routes';


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

/*
 * sits outside privateLayout on purpose: it is where that layout's guard sends an admin whose
 * account has no role, and a child of the guard would immediately be redirected here again
 */
export const unauthorizedRoute = createRoute({
  path: PATH_NAMES.unauthorized,
  getParentRoute: () => appLayout,
  component: UnauthorizedPage,
});

/*
 * Exported so Storybook can mount a page inside the real tree: a page story lands on the same
 * layout chain and the same route ids the page reads its own search off.
 */
export const routeTree = appLayout.addChildren([
  authPublicRoutes,
  accountPublicRoutes,
  privateRoutes,
  logoutRoute,
  notFoundRoute,
  unauthorizedRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  /*
   * the data lives in redux, not in the router's loader cache: a preload keeps nothing worth
   * reusing (onLoad skips it), so the actual navigation must always run the loader again instead
   * of treating the hover as a fresh load for 30 s
   */
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ErrorPage,
  defaultOnCatch: (error) => {
    console.error('Uncaught rendering error caught by the router:', error);
  },
  context: {
    // This will be set after we wrap the app in an AuthProvider
    store: undefined!,
  },
});

export default router;
