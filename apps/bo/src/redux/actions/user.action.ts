import Parse from 'parse';

import i18n from '@/config/i18n';
import { usersTabOptions } from '@/constants/user.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import {
  loadCurrentUserSlice,
  loadCurrentUserImageSlice,
  setMessageSlice,
  getAppNotificationsSelector,
  setNotificationsSlice,
  setErrorSlice,
} from '@/redux/reducers/app.reducer';
import { clearCurrentUserRolesSlice,
  loadUserRolesSlice,
  clearRolesSlice } from '@/redux/reducers/role.reducer';
import {
  clearUserCountSlice,
  clearUserSlice,
  clearUsersSlice,
  deleteUsersSlice,
  getUserUserSelector,
  getUserUsersSelector,
  loadUserSlice,
  loadUsersSlice,
  setUserLoadingSlice,
  setUsersCountSlice,
  updateUsersByUserSlice,
  updateUsersByUsersSlice,
} from '@/redux/reducers/user.reducer';
import { AppDispatch, AppThunkAction } from '@/redux/store';
import { IQueriesInput, ITabSearchParams } from '@/types/app.type';
import { ISignUpInput } from '@/types/auth.type';
import {
  ProfileUserInfoInput, IUser, SendEmailInput, IUserCloudInput,
  PlatformEnum,
} from '@/types/user.type';
import { convertSearchParamsToFilters } from '@/utils/app.utils';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/utils/constants';
import { uploadFilesAPI } from '@/utils/file.utils';
import { setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { getRolesForUser } from '@/utils/role.utils';
import { getUserFullName, isUserFromBO } from '@/utils/user.utils';
import { escapeText } from '@/utils/utils';


import { RootState } from '../store';
import { SIGNUP_PROPERTIES } from './auth.action';
import { loadRoles } from './role.action';
import { getSettingsLocaleSelector } from '../reducers/settings.reducer';

const collection = '_User';

/*
 * ----------------------------------------------------- //
 * ------------------- Parse queries ------------------- //
 * ----------------------------------------------------- //
 */
/**
 * query a user relation from another query
 * pointer = relation
 * ex: search a user who create a contact by its name or email
 * @param mainQuery
 * @param text
 * @param field pointer name
 */
export const searchUserPointerQuery = async (
  mainQuery: Parse.Query,
  text: string,
  field = 'user'
): Promise<void> => {
  const formattedText = escapeText(text);
  let userPointerQuery: Parse.Query = await new Parse.Query(Parse.User);

  userPointerQuery = Parse.Query.or(
    new Parse.Query(Parse.User).matches('lastName', formattedText),
    new Parse.Query(Parse.User).matches('firstName', formattedText),
    new Parse.Query(Parse.User).matches('username', formattedText)
  );

  mainQuery.matchesQuery(field, userPointerQuery);
};

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
/**
 * get current connected user from database
 * @returns
 */
export const getCurrentUser = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const currentUser = await Parse.User.currentAsync(); // it can throw (rarely)

    if (!currentUser) {
      dispatch(clearUserSlice());
      return;
    }

    dispatch(loadCurrentUserSlice(currentUser));
  });
};

export const loadUsers = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'updatedAt',
  order = 'desc',
  filters,
  search,
}: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const params: IUserCloudInput = {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
    };

    if (filters?.roles && filters.roles.length > 0) {
      params.ids = await Parse.Cloud.run('getUserIdsFromRoles', { roleNames: filters.roles });
    }

    // result with count
    const result: Record<string, any> = await Parse.Cloud.run('getUsers', params);

    // get and display user roles depending on the role of the current user
    let users = [];

    if (filters?.platform === PlatformEnum.BO) {
      for (const user of result.results) {
        const rolesForUser = await getRolesForUser(user, true);

        // add roles to user if admin (created from bo)
        user.set('roles', rolesForUser);
        users.push(user);
      }
    }
    else {
      users = result.results;
    }

    dispatch(loadUsersSlice(users));
    dispatch(setUsersCountSlice(result.count));
  });
};


export const uploadCurrentUserProfileImage = (file: File): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const currentUser = await Parse.User.currentAsync();
    const sessionToken = currentUser?.getSessionToken() ?? '';
    const userId = currentUser?.id ?? '';

    const files = await uploadFilesAPI({
      files: [file],
      folder: 'user',
      userId,
      sessionToken,
      locale,
    });

    currentUser?.set('image', files[0]);
    await currentUser?.save();

    dispatch(loadCurrentUserImageSlice(files[0]));
  });
};

/**
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @param redirectToRecycleBin redirect to recycle bin after the request is deleted
 * @returns
 */
export const deleteUserById = (id: string, redirectToRecycleBin = false): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void | undefined> => {
    /*
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    const updatedUser = await Parse.Cloud.run('deleteUser', { id });

    if (redirectToRecycleBin) {
    // dispatch(goToRecycleBin(RECYCLE_BIN_TAB_PATHNAMES.users));
      return;
    }

    dispatch(deleteUsersSlice(updatedUser.id));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

export const deleteUsersById = (ids: string[]): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    /*
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    const updatedUsers = await Parse.Cloud.run('deleteUsers', { ids });

    dispatch(updateUsersByUsersSlice(updatedUsers));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

/**
 * this will delete the data from database
 * be careful when using it,
 * only the highest level (ex: Admin) can do this
 * @param ids
 * @returns
 */
export const destroyUsers = (ids: string[]): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const error = await Parse.Cloud.run('destroyUsers', { ids });

    if (error?.code === 206) {
      throw new Error(i18n.t('user:errors.insufficientAuth'));
    }

    // display success message
    dispatch(
      setMessageSlice(
        i18n.t('common:infoMessages.successfullyDeletedFromDatabase', {
          count: ids.length,
          value: i18n.t('user:users'),
        })
      )
    );

    // reload the list of deleted requests
    const params = { filters: { deleted: true } };

    dispatch(loadUsers(params as any));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

export const toggleBanUserById = (id: string, value: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // only the user or the MasterKey can update other user
    const updatedUser = await Parse.Cloud.run('toggleBanUser', { id, value });

    dispatch(updateUsersByUserSlice(updatedUser));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};

/**
 * count all users with seen = false
 * it's used for notification count
 * @returns
 */
export const getNewUsersCount = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void | undefined> => {
    const count = await Parse.Cloud.run('getNewUsersCount');

    if (!count) return;

    dispatch(setNotificationsSlice({ user: count }));
  });
};


/**
 * mark user notification as seen or not seen
 * @param ids user ids
 * @param value seen or not seen
 * @returns
 */
export const toggleUsersNotification = (ids: string[], value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const notification = getAppNotificationsSelector(state);
    let count = notification?.user ?? 0;
    const prevStoredUsers = getUserUsersSelector(state) || [];
    const storedUser = getUserUserSelector(state) || [];

    const storedUsers = [...prevStoredUsers];

    let users = await Parse.Cloud.run('toggleUsersSeen', { ids, value });

    if (value) {
      count -= users.length;
      users = storedUsers.filter((user: IUser) => ids.includes(user.id));
    }
    else {
      count += users.length;
      users = storedUsers.filter((user: IUser) => !ids.includes(user.id));
    }

    // update notification count
    dispatch(setNotificationsSlice({ user: count })); // in sidebar

    // preview page
    if (storedUser) {
      storedUser.set('seen', value);
      dispatch(loadUserSlice(storedUser));
      return;
    }

    // list page
    dispatch(loadUsersSlice(users));
  });
};

export const updateProfileUserInfo = (values: ProfileUserInfoInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) return;
    setValues(currentUser, values, ['lastName', 'firstName']);

    await currentUser.save();

    dispatch(loadCurrentUserSlice(currentUser));
  });
};

export const toggleBanUser = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // query user from database
    const user = await new Parse.Query(Parse.User).equalTo('objectId', id).first();

    if (!user) return;

    user.set('banned', !user.get('banned'));

    dispatch(loadUserSlice(user as any));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('user:errors:canNotUpdateUser'),
  });
};

export const inviteUser: any = (values: ISignUpInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const newValues = { ...values, username: values.email };

    // ---------- user creation ---------- //
    let user = await Parse.Cloud.run('getUserByEmail', { email: values.email });

    if (!user) {
      const newUser = new Parse.User();

      setValues(newUser, newValues, SIGNUP_PROPERTIES);
      user = await newUser.save();
    }


    dispatch(setMessageSlice(i18n.t('user:messages.employeeAddedSuccessfully')));
  }, { localLoadingAction: setUserLoadingSlice });
};

export const sendEmailToUser = (user: IUser, values: SendEmailInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const isSend = await Parse.Cloud.run('sendEmailToUser', values);

    if (!isSend) {
      dispatch(setErrorSlice(i18n.t('user:errors.emailNotSendTo', { email: values.email })));
      return;
    }
    // TODO: send email to user here
    const message = i18n.t('user:emailSentTo', { name: getUserFullName(user) });

    dispatch(setMessageSlice(message));
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
export const onUsersLeave = (): AppThunkAction => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearUsersSlice());
    dispatch(clearUserCountSlice());
  };
};

export const onUserLeave = (): AppThunkAction => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearCurrentUserRolesSlice());
    dispatch(clearRolesSlice());
  };
};


/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
export const onUsersEnter = (route: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    /*
     * TODO: should have admin-only list page
     * if (params.location.search?.from === PlatformEnum.BO) {
     * filters.fromBO = true;
     *   filters.roles = [capitalizeFirstLetter(params.location.search.role)];
     * }
     */

    // in "All" tab, we fetch all users other than users from BO (admins)
    if (route.search.tab === undefined) {
      values.filters = {
        ...filters,
        fromBO: false,
      };
    }
    else {
      const newFilters = convertSearchParamsToFilters({
        tabs: usersTabOptions,
        searchParams: route.search,
        filters,
        acceptedFields: ['deleted'],
      });

      values.filters = newFilters;
    }

    dispatch(loadUsers(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onUserEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.();
    const notification = getAppNotificationsSelector(state as any);
    const count = notification?.user ?? 0;

    if (!route.params?.id) return;

    const user = await Parse.Cloud.run('getUser', { id: route.params?.id, shouldMarkAsSeen: true });

    if (!user) {
      throw new Error(Errors.notFound);
    }

    if (count > 0) {
      dispatch(setNotificationsSlice({ user: count - 1 })); // from sidebar
    }

    // load role for this user if it's created from BO
    if (isUserFromBO(user)) {
      const rolesForThisUser = await getRolesForUser(user);

      dispatch(loadUserRolesSlice(rolesForThisUser));
      dispatch(loadRoles({ limit: 1000 }));
    }

    dispatch(loadUserSlice(user));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToUsers = (search?: ITabSearchParams): any => ({ to: PATH_NAMES.users, search });
export const goToUser = (id: string): any => ({ to: PATH_NAMES.users + '/$id', params: { id } });
