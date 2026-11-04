import { notFound, redirect } from '@tanstack/react-router';
import isEqual from 'lodash/isEqual';


import type { Action } from '@reduxjs/toolkit';

import i18n from '@/config/i18n';
import { Errors } from '@/constants/_core/app.constants';
import {
  closeMessageSlice, endLoadingSlice, getAppCurrentUserSelector, getAppMessageSelector,
  loadCurrentUserSlice, setErrorSlice, startLoadingSlice,
} from '@/redux/reducers/_core/app.reducer';
import { getRoleCurrentUserRolesSelector, loadCurrentUserIsAdminSlice, loadCurrentUserRolesSlice } from '@/redux/reducers/_core/role.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { fetchCurrentUserJson } from '@/services/_core/auth.service';
import { getRolesForUser, isAdmin } from '@/services/_core/role.service';
import { ITabSearchParams } from '@/types/_core/app.type';
import { IRoleAction } from '@/types/_core/role.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { canAccessTo } from '@/utils/_core/role.utils';


/**
 * re-reads the roles of the signed-in account. A network failure leaves the store as it is: a tab
 * left open overnight must not empty the menus because the connection dropped
 */
export const refreshCurrentUserRoles = (): AppThunkAction => {
  return async (dispatch: AppDispatch): Promise<void> => {
    try {
      const [currentUserRoles, isSuperAdmin] = await Promise.all([getRolesForUser(null, true), isAdmin()]);
      const roleObjects: any[] = currentUserRoles;

      dispatch(loadCurrentUserRolesSlice(roleObjects.map((role) => toJSONWithId(role))));
      dispatch(loadCurrentUserIsAdminSlice(isSuperAdmin));
    }
    catch { /* keep what is shown: the next server call reports a real session problem on its own */ }
  };
};

/**
 * loads what the dashboard shell needs before it can be drawn — the current user and their roles,
 * which filter the sidebar menu. Skipped entirely once both are in the store.
 *
 * On a hard reload the store starts empty (only `settings` is persisted), so the user, the roles
 * and the super-admin flag are all read in one parallel round-trip. They only depend on the local
 * Parse session, not on each other. The user is force-refreshed from the server rather than taken
 * from the SDK's local copy: MFA/profile changes made from another device would otherwise stay
 * invisible, and that fetch is also what proves the session token is still valid (it fails with
 * INVALID_SESSION_TOKEN otherwise), so no separate session check is needed on a cold start.
 *
 * The sidebar badges are deliberately not loaded here: up to ten `count` queries would hold the
 * whole shell until the slowest of them answered. `useNotificationCountsLiveQuery` loads them once
 * the shell is mounted.
 */
export const onDashboardEnter = (): AppThunkAction => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const hasCurrentUser = !!getAppCurrentUserSelector(state);
    const hasRoles = getRoleCurrentUserRolesSelector(state).length > 0;

    if (hasCurrentUser && hasRoles) return;

    const [currentUser, rolesResult] = await Promise.all([
      hasCurrentUser ? undefined : fetchCurrentUserJson(true),
      hasRoles ? undefined : Promise.all([getRolesForUser(null, true), isAdmin()]),
    ]);

    if (currentUser) dispatch(loadCurrentUserSlice(currentUser));

    if (!rolesResult) return;

    const [currentUserRoles, isSuperAdmin] = rolesResult;
    const roleObjects: any[] = currentUserRoles;

    dispatch(loadCurrentUserRolesSlice(roleObjects.map((role) => toJSONWithId(role))));
    dispatch(loadCurrentUserIsAdminSlice(isSuperAdmin));
  };
};

/**
 * this function is called in route beforeLoad or loader
 * @NOTE it's a simple function, not a thunk (dispatched action)
 * it's take a params as thunk (function) and return a function
 * @param routeParams
 * @returns
 */
export const onEnter = (
  onEnterAction: (routeParams: any) => AppThunkAction
) =>

  /**
   * @important this function should be async to be able to use tanstack/react-router
   * notFound and redirect functions inside the thunk
   */
  async (routeParams: any) => {
    // get store from context (passed in RouterProvider)
    const {
      store,
    } = routeParams.context;

    /*
     * a preload (the router's hover intent) only fetches the page's JS chunk: the enter thunks
     * write to the database (mark a row as seen), clear the slice of the page still on screen and
     * toggle the global loader, none of which may happen for a page the admin only hovered. The
     * real navigation runs `beforeLoad` again, rights check included.
     */
    if (!store || routeParams.preload) return;
    await onEnterAction(routeParams)(store.dispatch, store.getState);
  };

/**
 * dedicated wrapper for route onLeave hooks — mirrors onEnter but signals cleanup intent
 */
export const onLeave = (
  onLeaveAction: (routeParams: any) => AppThunkAction
) =>
  async (routeParams: any) => {
    const { store } = routeParams.context;

    if (!store) return;
    await onLeaveAction(routeParams)(store.dispatch, store.getState);
  };

/**
 * dedicated wrapper for route loaders feeding a page that draws its own placeholder: the load is
 * dispatched without being awaited, so the navigation lands on the page's skeleton at once instead
 * of holding the previous page on screen until the figures are in.
 *
 * A preload (the router's hover intent) dispatches nothing: the figures would be fetched for a page
 * that may never open, and a preload leaves no fresh data behind — the router's zero stale time runs
 * the loader again on the actual navigation.
 */
export const onLoad = (
  loadAction: (routeParams: any) => AppThunkAction
) =>
  (routeParams: any): void => {
    const { store } = routeParams.context;

    if (!store || routeParams.preload) return;
    store.dispatch(loadAction(routeParams));
  };

/*
 * The query each list's rows in the store were last read with, keyed by the slice action that
 * writes those rows. Leaving a list page no longer clears its rows: opened again, it shows them
 * while it reads them again (stale-while-revalidate). That is only true to the reader when the
 * rows answer the query the page is about to read — rows of another tab, another page or another
 * filter would be drawn under a header that does not describe them. Kept out of the store: it
 * never feeds a render, it only decides whether a list is cleared as its page is entered.
 */
const loadedListQueries = new Map<string, unknown>();

// the slice action creator that writes a list's rows, ex: `loadRidesSlice` — identifies the list
type ListWriter = { type: string };

/**
 * records the query the rows just written by `writer` answer — called by each list loader, right
 * after the rows land
 */
export const rememberListQuery = (writer: ListWriter, query: unknown): void => {
  loadedListQueries.set(writer.type, query);
};

/**
 * for the writers that fill a list's rows outside its loader (another page reading the same slice
 * for its own needs, a "load more" appending a page): the rows no longer answer any known query,
 * so the list page will not show them on its next visit
 */
export const forgetListQuery = (writer: ListWriter): void => {
  loadedListQueries.delete(writer.type);
};

/**
 * called by a list's enter thunk just before it reads `query`: the rows already in the store stay
 * on screen during that read when they answer the very same query, and are cleared otherwise so
 * the list shows its placeholder rows instead of rows it does not hold
 */
export const clearListUnlessLoadedWith = (
  writer: ListWriter,
  query: unknown,
  clearActions: Action[]
): AppThunkAction => {
  return (dispatch: AppDispatch): void => {
    if (isEqual(loadedListQueries.get(writer.type), query)) return;

    clearActions.forEach((action: Action) => dispatch(action));
  };
};

/**
 * mainly a translated key from server
 * @param text
 * @returns
 */
const translatedError = (text: string): string => {
  const hasDot = text.includes(':');

  if (hasDot) {
    return i18n.t(text);
  }

  return text;
};

/**
 * this wrapper is for thunk that does not need to display error message
 * NOTE: tanstack/react-router does not work with wrapper with catch block
 * notFound() and redirect() does not work with wrapper with catch block
 * @link https://github.com/tiavina-mika/tanstack-router-redux-issue
 * solution: dispatch manually the error messages in the thunk if needed
 * @param longPromiseCreatorOrPromise
 * @returns
 */
interface IEnterActionOption {

  /**
   * class name of the object = collection name
   * @example '_User', 'Role', 'Article', ...
   */
  collection?: string;

  /**
   * action to perform on the object (database action)
   * it differs from the ui role by the fact that it's used for database access
   * NOTE: it is not needed for UI access
   * @example 'find', 'get', 'update', 'delete'
   */
  action?: IRoleAction;

  /**
   * ui role(s) to check
   * it differs from the database role by the fact that it's used for UI access
   * an array checks for access to ANY of the given rights
   * @example access to a tab, a page, a menu, (migrations, cron, tests, ...)
   */
  uiRight?: string | string[];
  localLoadingAction?: (loading: boolean) => Action;

  /**
   * error message to display when the user has no right
   */
  hasNoRightErrorMessage?: string;

  // url to redirect to
  redirectTo?: string;
}

/**
 * wrapper for thunk, return a thunk
 * @param longPromiseCreatorOrPromise
 * @returns
 */
export const actionWithLoader = (
  longPromiseCreatorOrPromise: AppThunkAction,
  options?: IEnterActionOption
// returns the caught error (or undefined on success) so callers can gate logic (e.g. navigation) on it
): AppThunkAction => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<unknown> => {
    const state = getState?.()!;
    const message = getAppMessageSelector(state);
    const {
      collection, action, uiRight, localLoadingAction, hasNoRightErrorMessage,
    } = options ?? {};

    // returned to the caller so it can tell success from failure (e.g. `if (error) return;` before navigating)
    let caughtError: unknown;

    // --------------- start loading --------------- //
    if (localLoadingAction) {
      dispatch(localLoadingAction(true));
    }
    else {
      dispatch(startLoadingSlice());
    }
    try {
    // rights check
      if (collection || action || uiRight) {
        const state = getState?.()!;
        const roles = getRoleCurrentUserRolesSelector(state);
        const hasRight = canAccessTo(roles, collection, action, uiRight);

        if (!hasRight) {
          throw new Error(hasNoRightErrorMessage || i18n.t('common:errors.unauthorizedAction'));
        }
      }

      // --------------- dispatch action --------------- //
      await longPromiseCreatorOrPromise(dispatch, getState ?? undefined);
    }
    catch (error) {
      caughtError = error;

      // clear success message first
      if (message) {
        dispatch(closeMessageSlice());
      }

      // display error message
      if (typeof error === 'string') {
        dispatch(setErrorSlice(translatedError(error)));
      }
      else if (error instanceof Error) {
        dispatch(setErrorSlice(translatedError((error as any).message)));
      }
    }
    finally {
    // --------------- end loading --------------- //
      if (localLoadingAction) {
        dispatch(localLoadingAction(false));
      }
      else {
        dispatch(endLoadingSlice());
      }
    }

    return Promise.resolve(caughtError);
  };
};

/**
 * thunk wrapper for onEnter action
 * it's used in route beforeLoad or loader
 * @param longPromiseCreatorOrPromise
 * @param options
 * @returns
 */
export const onEnterActionWithLoader = (
  longPromiseCreatorOrPromise: AppThunkAction | null,
  options?: IEnterActionOption
): AppThunkAction => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
  // --------------- start loading --------------- //
    dispatch(startLoadingSlice());

    try {
    // --------------- check rights --------------- //
      if (options) {
        const state = getState?.()!;
        const roles = getRoleCurrentUserRolesSelector(state);
        const hasRight = canAccessTo(roles, options.collection, options.action, options.uiRight);

        if (!hasRight && roles.length > 0) {
          /*
           * throw a not found error to redirect to 404 page
           * see the catch block
           */
          throw new Error(Errors.notFound);
        }
      }

      /*
       * --------------- dispatch action --------------- //
       * sometimes we don't need to dispatch any action, just check the rights (roles),
       * so in this case it will be null
       */
      if (longPromiseCreatorOrPromise) {
        await longPromiseCreatorOrPromise(dispatch, getState ?? undefined);
      }
    }
    catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          // redirect to 404 page
          case Errors.notFound:
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw notFound();
            // redirect to another page
          case Errors.redirect:
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: options?.redirectTo || '/' });
            // display error message
          default:
            dispatch(setErrorSlice(translatedError(error.message)));
        }
      }
      else {
        return Promise.reject(new Error('Unknown error occurred'));
      }
    }
    finally {
      /*
       * always end loading, even when the catch block re-throws (notFound()/redirect()) —
       * otherwise app.loading stays stuck at true and the next list page a user opens renders
       * its skeleton forever until an unrelated onListEnter happens to succeed
       */
      dispatch(endLoadingSlice());
    }

    return Promise.resolve();
  };
};

/**
 * redirect to a list page with search params
 * @param path key of PATH_NAMES, ex: 'contacts'
 * @param search
 * @returns
 */
export const goToList = (
  path: keyof typeof PATH_NAMES,
  /*
   * the tab the list opens on, plus whatever else that list reads off its own address — a ride's
   * page sends the operator to the bookings scoped to that ride
   */
  search?: ITabSearchParams | Record<string, unknown>
): any => {
  // if path nested use that
  let toPath: string = PATH_NAMES[path] as string;

  if (typeof PATH_NAMES[path] === 'object') {
    const separatedPath = path.split('.') as (keyof typeof PATH_NAMES)[];

    toPath = PATH_NAMES[separatedPath[0]] as string;

    for (let i = 1; i < separatedPath.length; i++) {

      const value = PATH_NAMES[separatedPath[i]];

      if (typeof value === 'string') {
        toPath += value.startsWith('/') ? value : `/${value}`;
      } else if (typeof value === 'object' && 'root' in value) {
        toPath += value.root.startsWith('/') ? value.root : `/${value.root}`;
      } else {
        toPath += `/${String(value)}`;
      }
    }
  }
  return { to: toPath, search };
};

export const goToPreview = (
  path: keyof typeof PATH_NAMES,
  id: string
) => ({ to: `${PATH_NAMES[path] as any}/$id`, params: { id } });
