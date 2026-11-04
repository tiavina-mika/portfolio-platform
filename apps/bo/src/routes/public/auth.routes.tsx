import { createRoute, redirect } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

// eslint-disable-next-line import/order -- pre-existing import/order + pathGroups quirk, unrelated to this task
import { clearErrorSlice, getAppMfaChallengeTokenSelector } from '@/redux/reducers/_core/app.reducer';

const Login = lazy(() => import('@/pages/_core/auth/Login'));
const MfaVerify = lazy(() => import('@/pages/_core/auth/MfaVerify'));
const SignUp = lazy(() => import('@/pages/_core/auth/SignUp'));
const PublicRouteLayout = lazy(() => import('@/containers/_core/auth/PublicRouteLayout'));

import { appLayout } from '@/routes/app.routes';
import { getCurrentUser, verifyBOInvitationToken } from '@/services/_core/user.service';
import { PATH_NAMES } from '@/utils/_core/pathnames';


/**
 * add id to pathless route (sub layouts)
 * @see: https://github.com/TanStack/router/discussions/696
 */
const authPublicLayout = createRoute({
  id: 'public',
  getParentRoute: () => appLayout,
  component: PublicRouteLayout,
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
     * only in invite and login page
     */
    if ([PATH_NAMES.login, PATH_NAMES.invite].includes(location.pathname)) {
      const user = await getCurrentUser();

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
  validateSearch: z.object({
    redirect: z.string().optional(),
    // set when an invitation link was refused (expired, already used, unknown)
    invitation: z.literal('invalid').optional(),
  }),
  getParentRoute: () => authPublicLayout,
  component: Login,
  path: PATH_NAMES.login,
});

export const mfaVerifyRoute = createRoute({
  getParentRoute: () => authPublicLayout,
  component: MfaVerify,
  path: PATH_NAMES.mfaVerify,
  beforeLoad: ({ context }) => {
    const { store } = context;

    // no pending challenge (direct navigation, refresh) — nothing to verify, back to login
    if (store && !getAppMfaChallengeTokenSelector(store.getState())) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: PATH_NAMES.login, replace: true });
    }
  },
});

export const inviteRoute = createRoute({
  validateSearch: (search: Record<string, unknown>) => z.object({ token: z.string() }).parse(search),
  getParentRoute: () => authPublicLayout,
  component: SignUp,
  path: PATH_NAMES.invite,
  beforeLoad: async ({ search }) => {
    try {
      const result: { email: string } = await verifyBOInvitationToken(search.token);

      return { invitationEmail: result.email };
    } catch {
      /*
       * a search field rather than the error slice: the public layout clears the error on every
       * navigation to the login page, so the message would vanish at once
       */
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: PATH_NAMES.login, search: { invitation: 'invalid' }, replace: true });
    }
  },
});

const authPublicRoutes = authPublicLayout.addChildren([loginRoute, mfaVerifyRoute, inviteRoute]);

export default authPublicRoutes;
