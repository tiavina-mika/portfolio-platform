import {
  isNotFound, isRedirect, createRoute, redirect,
} from '@tanstack/react-router';

import { ROUTE_PENDING_MIN_MS, ROUTE_PENDING_MS } from '@/constants/_core/ui/ui.constants';
import DashboardLayout from '@/pages/_core/DashboardLayout';
import DashboardPending from '@/pages/_core/DashboardPending';
import { onDashboardEnter } from '@/redux/actions/_core/util.action';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { appLayout } from '@/routes/app.routes';
import {
  fetchCurrentUserSessionToken, isInvalidSessionTokenError, verifySessionValidity,
} from '@/services/_core/auth.service';
import { PATH_NAMES } from '@/utils/_core/pathnames';

/*
 * The dashboard shell and its guard live here rather than beside the routes they wrap: every page
 * route names this layout as its parent, so keeping it in the file that assembles them made the
 * two import each other, and whichever module was reached first left the other half-built — which
 * is a page rendering or a ReferenceError depending on where the entry point happened to start.
 *
 * The id is what gives a pathless route (a sub layout) something to be addressed by.
 * @see: https://github.com/TanStack/router/discussions/696
 */
export const privateLayout = createRoute({
  id: 'private',
  getParentRoute: () => appLayout,
  component: DashboardLayout,
  // the shell's own silhouette while the guard below loads the admin, rather than a blank page
  pendingComponent: DashboardPending,
  pendingMs: ROUTE_PENDING_MS,
  pendingMinMs: ROUTE_PENDING_MIN_MS,
  beforeLoad: async ({
    context, location,
  }) => {
    const {
      store,
    } = context;

    if (!store) return;

    /*
     * If the user is logged out, redirect them to the login page. Read from the SDK's local
     * storage, no round-trip.
     * NOTE: redirect is only available in beforeLoad and loader (not in component or in action)
     */
    let sessionToken: string | undefined;

    try {
      sessionToken = await fetchCurrentUserSessionToken();
    }
    // the SDK failed to read its own storage — there is no usable session either way
    catch {
      sessionToken = undefined;
    }

    if (!sessionToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: PATH_NAMES.login,
        search: {

          /*
           * Use the current location to power a redirect after login
           * (Do not use `router.state.resolvedLocation` as it can
           * potentially lag behind the actual current location)
           */
          redirect: location.href,
        },
      });
    }

    try {
      /*
       * load the current user and roles — on a cold start this is one parallel round-trip whose
       * user fetch also validates the token, which is why it runs before the session check below
       * (that check then reuses the fresh verdict instead of asking the server a second time)
       */
      await store.dispatch(onDashboardEnter());
    }
    catch (error) {
      // let tanstack router's own redirect / notFound throws pass through untouched
      if (isRedirect(error) || isNotFound(error)) {
        throw error;
      }

      /*
       * only a revoked token justifies destroying the session here. Anything else — the server
       * restarting, a network blip, a Cloud Function failing — is transient, and logging out on
       * it means every navigation is a chance to be thrown back to the login page while holding
       * a perfectly valid session. Let the router's error boundary offer a retry instead
       */
      if (isInvalidSessionTokenError(error)) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
          to: PATH_NAMES.logout,
          search: { redirect: location.href },
        });
      }

      console.log('private route beforeLoad error => keep session', error);

      throw error;
    }

    /*
     * a store already filled (any navigation after the first one) skips the load above, so the
     * token is re-checked here — at most once per SESSION_VALIDITY_CHECK_INTERVAL_MS
     */
    const { isValidSession } = await verifySessionValidity();

    // the token itself is gone (revoked, expired) — nothing to do but log out
    if (!isValidSession) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: PATH_NAMES.logout,
        search: { redirect: location.href },
      });
    }

    // get current user roles (from store)
    const roles = getRoleCurrentUserRolesSelector(store.getState());

    /*
     * a valid session with no role is an authorization problem, not an authentication one:
     * logging the admin out would blame their session and hide the real cause (no role granted)
     */
    if (roles.length === 0) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: PATH_NAMES.unauthorized });
    }
  },
});
