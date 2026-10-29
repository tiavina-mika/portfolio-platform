import { Outlet, createRoute, redirect } from '@tanstack/react-router';
import Parse from 'parse';
import { z } from 'zod';

import Login from '@/pages/auth/Login';
import SignUp from '@/pages/auth/SignUp';
import { clearErrorSlice } from '@/redux/reducers/app.reducer';
import { PATH_NAMES } from '@/utils/pathnames';

import { appLayout } from '../routes';

/**
 * add id to pathless route (sub layouts)
 * @see: https://github.com/TanStack/router/discussions/696
 */
const authPublicLayout = createRoute({
  id: 'public',
  getParentRoute: () => appLayout,
  component: () => <Outlet />,
  beforeLoad: async ({
    context, location,
  }) => {
    const {
      store,
    } = context;

    if (store) {
      // clear error messages on page load
      store.dispatch(clearErrorSlice());
    }

    /*
     * If the user is logged in, redirect them to the home page
     * only in signup and login page
     */
    if ([PATH_NAMES.login, PATH_NAMES.signUp].includes(location.pathname)) {
      const user = await Parse.User.currentAsync();

      if (user) {
        // If the user is logged out, redirect them to the login page
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
          to: '/',
          replace: true,
        });
      }
    }
  },
});

const loginRoute = createRoute({
  validateSearch: z.object({ redirect: z.string().optional() }),
  getParentRoute: () => authPublicLayout,
  component: Login,
  path: PATH_NAMES.login,
});

const signUpRoute = createRoute({
  getParentRoute: () => authPublicLayout,
  component: SignUp,
  path: PATH_NAMES.signUp,
});


const authPublicRoutes = authPublicLayout.addChildren([loginRoute, signUpRoute]);

export default authPublicRoutes;
