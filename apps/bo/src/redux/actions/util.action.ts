import { type Action } from '@reduxjs/toolkit';
import { notFound, redirect } from '@tanstack/react-router';

import i18n from '@/config/i18n';
import {
  closeMessageSlice,
  endLoadingSlice,
  getAppMessageSelector,
  setErrorSlice,
  startLoadingSlice,
} from '@/redux/reducers/app.reducer';
import { getRoleCurrentUserRolesSelector, loadCurrentUserIsAdminSlice, loadCurrentUserRolesSlice } from '@/redux/reducers/role.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { ITabSearchParams } from '@/types/app.type';
import { IRoleAction } from '@/types/role.type';
import { Errors, NOTIFICATION_COLLECTIONS } from '@/utils/constants';
import { PATH_NAMES } from '@/utils/pathnames';
import { canAccessTo, getRolesForUser, isAdmin } from '@/utils/role.utils';

import { setNotification } from './app.action';

/**
 * load data when entering any dashboard page
 * @returns
 */
export const onDashboardEnter = (): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    const [currentUserRoles, isAdministrator] = await Promise.all([
      getRolesForUser(null, true),
      isAdmin(),
      ...NOTIFICATION_COLLECTIONS.map(collection => dispatch(setNotification(collection))),
    ]);

    dispatch(loadCurrentUserRolesSlice(currentUserRoles));
    dispatch(loadCurrentUserIsAdminSlice(isAdministrator));
  };
};

/**
 * this function is called in route beforeLoad or loader
 * NOTE: it's a simple function, not a thunk (dispatched action)
 * it's take a params as thunk (function) and return a function
 * @param routeParams
 * @returns
 */
export const onEnter = (
  onEnterAction: (routeParams: any) => AppThunkAction
) =>

  /*
   * @important this function should be async to be able to use tanstack/react-router
   * notFound and redirect functions inside the thunk
   */
  async (routeParams: any) => {
    // get store from context (passed in RouterProvider)
    const {
      store,
    } = routeParams.context;

    if (!store) return;
    await onEnterAction(routeParams)(store.dispatch, store.getState);
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
   * ui role to check
   * it differs from the database role by the fact that it's used for UI access
   * @example access to a tab, a page, a menu, (miscellaneous, tests, ...)
   */
  uiRight?: string;
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
): AppThunkAction => {
  return async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const message = getAppMessageSelector(state);
    const {
      collection, action, uiRight, localLoadingAction, hasNoRightErrorMessage,
    } = options ?? {};

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

      return (error as any)?.message;
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

    return Promise.resolve();
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

    dispatch(endLoadingSlice());

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
  search?: ITabSearchParams
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
