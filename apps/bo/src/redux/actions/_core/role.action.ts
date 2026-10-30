import i18n from '@/config/i18n';
import { COLLECTIONS, Errors } from '@/constants/_core/app.constants';
import { DEFAULT_ROLES, RELATION_OPTIONS_LIMIT, ROLE_DEFAULT_LIMIT } from '@/constants/_core/user.constants';
import {
  actionWithLoader, clearListUnlessLoadedWith, forgetListQuery, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  addRoleSlice,
  clearRoleSlice,
  clearRolesSlice,
  destroyRoleSlice,
  getRoleCanManageStaffSelector,
  getRoleRolesSelector,
  loadHighestRoleAccountsSlice,
  loadRoleSlice,
  loadRolesSlice,
  loadRolesDelegationSlice,
  loadUserRolesSlice,
  setHighestRoleAccountsLoadingSlice,
  setRolesDelegationLoadingSlice,
  setUserRolesLoadingSlice,
  updateRolesByRoleSlice,
} from '@/redux/reducers/_core/role.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import {
  addRolesToUserInCloud,
  createRoleInCloud,
  destroyRoleById,
  fetchHighestRoleAccounts,
  fetchRoleChildren,
  fetchRoleNameById,
  fetchRoles,
  fetchRolesForUser,
  fetchRolesDelegation,
  removeRolesForUserInCloud,
  updateRoleInCloud,
} from '@/services/_core/role.service';
import {
  ILoadRolesInput, IRole, IRoleInput, RolesForUserInput, UIRoleEnum,
} from '@/types/_core/role.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getSessionTimeoutMinutesFromHours } from '@/utils/_core/role.utils';
import { roleCodec } from '@/validations/_core/role.validations';

const collection = COLLECTIONS.role;

export const loadRoles = (queries: Partial<ILoadRolesInput>): any => {
  const {
    limit = ROLE_DEFAULT_LIMIT,
    skip = 0,
    withAdminOrBetter: hasAdminOrBetter = true,
    withUsersCount: hasUsersCount = false,
    incrementItems: shouldIncrementItems = false,
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.();
    const oldRoles = getRoleRolesSelector(state as Record<string, any>);
    // --------- load from database --------- //
    const rolesWithCount = await fetchRoles(+limit, +skip, hasAdminOrBetter, hasUsersCount);

    const newRoles = shouldIncrementItems
      ? [...oldRoles, ...rolesWithCount]
      : rolesWithCount;

    // --------- update store --------- //
    dispatch(loadRolesSlice(newRoles));

    // a page appended to the ones already there answers no single query
    if (shouldIncrementItems) {
      forgetListQuery(loadRolesSlice);
      return;
    }

    rememberListQuery(loadRolesSlice, queries);
  });
};

/**
 * the accounts holding OWNER or SUPER_ADMIN, for the review on the posts page. Under the tab's own
 * loading flag rather than the app-wide one: the posts stay usable while the accounts are read
 */
export const loadHighestRoleAccounts = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    dispatch(loadHighestRoleAccountsSlice(await fetchHighestRoleAccounts()));
  }, { localLoadingAction: setHighestRoleAccountsLoadingSlice });
};

/**
 * the roles one account holds, for its detail page. Under the block's own loading flag rather than
 * the app-wide one: the account is drawn as soon as it is in, only the roles block waits for them
 * @param userId the account whose roles to list
 */
export const loadUserRoles = (userId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const roles = await fetchRolesForUser(userId);

    dispatch(loadUserRolesSlice(roles));
  }, { localLoadingAction: setUserRolesLoadingSlice });
};

// asks the server what the signed-in account may do with the posts of `userId`, for the posts in store
const fetchRolesDelegationOfStoredRoles = async (
  dispatch: AppDispatch,
  getState: (() => RootState) | undefined,
  userId: string
): Promise<void> => {
  const state = getState?.() as Record<string, any>;

  // the server answers only to an account that can give posts at all: the dialog is not reachable otherwise
  if (!getRoleCanManageStaffSelector(state)) return;

  const roleNames = getRoleRolesSelector(state).map((role) => role.name);

  dispatch(loadRolesDelegationSlice(await fetchRolesDelegation(userId, roleNames)));
};

/**
 * the posts the "add posts" dialog of an account offers, and what the signed-in account may do with
 * that account's posts: nothing at all (its own, an owner's), or everything but the posts it may not
 * hand out — shown greyed out rather than refused by the server afterwards. Under its own loading
 * flag, so the roles block and the dialog can wait on the answer without holding the page
 * @param userId the account whose posts are on screen
 */
export const loadRolesDelegation = (userId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    await dispatch(loadRoles({ limit: RELATION_OPTIONS_LIMIT }));
    await fetchRolesDelegationOfStoredRoles(dispatch, getState, userId);
  }, { localLoadingAction: setRolesDelegationLoadingSlice });
};

/**
 * reads the delegation again once the posts of the account changed: giving it a post that carries the
 * staff right locks it for a team lead, taking that post back unlocks it. Its own loader, so a failure
 * here never turns the change that was just written into an error
 */
const refreshRolesDelegation = (userId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    await fetchRolesDelegationOfStoredRoles(dispatch, getState, userId);
  }, { localLoadingAction: setRolesDelegationLoadingSlice });
};

/**
 * create Role with hierarchy
 * @param values
 * @returns
 */
export const createRole = (values: IRoleInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- update database --------- //
    const body = {
      childRoleNames: values.children,
      roleName: values.name,
      rights: values.rights.map((right: any) => ({ className: right.className, rights: right.rights })),
      ui: values.ui,
      // an empty list takes the limit off: the role covers every country
      countries: values.countries ?? [],
      translated: roleCodec.decode(values),
      /*
       * the form asks for hours, the role stores minutes; null (not undefined) so an emptied
       * field clears the override server-side instead of leaving the stored value untouched
       */
      sessionTimeoutMinutes: getSessionTimeoutMinutesFromHours(values.sessionTimeoutHours),
    };

    const newRole = await createRoleInCloud(body);

    if (!newRole) {
      throw new Error(i18n.t('user:role.roleNotCreated'));
    }

    // --------- update store --------- //
    dispatch(addRoleSlice(newRole));
  },
  // rights
  {
    collection,
    action: 'create',
  });
};

export const updateRole = (name: string, values: IRoleInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- update database --------- //
    const body = {
      name,
      childRoleNames: values.children,
      rights: values.rights.map((right: any) => ({ className: right.className, rights: right.rights })),
      ui: values.ui,
      // an empty list takes the limit off: the role covers every country
      countries: values.countries ?? [],
      translated: roleCodec.decode(values),
      /*
       * the form asks for hours, the role stores minutes; null (not undefined) so an emptied
       * field clears the override server-side instead of leaving the stored value untouched
       */
      sessionTimeoutMinutes: getSessionTimeoutMinutesFromHours(values.sessionTimeoutHours),
    };

    const newRole = await updateRoleInCloud(body);

    if (!newRole) {
      throw new Error(i18n.t('user:role.roleNotCreated'));
    }

    // --------- update store --------- //
    dispatch(updateRolesByRoleSlice(newRole));
  },
  // rights
  {
    collection,
    action: 'update',
  });
};

export const addRolesToUser = (userId: string, values: RolesForUserInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- update database --------- //
    await addRolesToUserInCloud(userId, values.roles);

    // reload user roles from the server: it holds the whole set, the screen only sees part of it
    const roles = await fetchRolesForUser(userId);

    dispatch(loadUserRolesSlice(roles));
    await dispatch(refreshRolesDelegation(userId));

    dispatch(setMessageSlice(i18n.t('user:role.addRolesToThisUserSuccessfully', { count: values.roles.length })));
  },
  /*
   * rights: giving a post takes the staff right, not editing the account — the server asks the same,
   * and TEAM_LEAD only reads the accounts it staffs
   */
  { uiRight: UIRoleEnum.STAFF });
};

export const removeRolesForUser = (userId: string, roles: IRole[]): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    // --------- update database --------- //
    const roleNames = roles.map((role: IRole): string => role.name);

    await removeRolesForUserInCloud(userId, roleNames);

    /*
     * --------- update store --------- //
     * read back from the server: the screen must show what the account really holds
     */
    dispatch(loadUserRolesSlice(await fetchRolesForUser(userId)));
    await dispatch(refreshRolesDelegation(userId));

    dispatch(
      setMessageSlice(i18n.t('user:role.removeRolesForThisUserSuccessfully', { count: roleNames.length }))
    );
  },
  // rights: taking a post back takes the staff right too, not deleting the account
  { uiRight: UIRoleEnum.STAFF });
};

/**
 * destroy role and unlink its users
 * @param id
 * @returns
 */
export const destroyRole = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // update the database
    const roleName = await fetchRoleNameById(id);

    if (!roleName) {
      throw new Error(i18n.t('user:role.roleNotFound'));
    }

    if (DEFAULT_ROLES.includes(roleName)) {
      throw new Error(i18n.t('user:role.roleCannotBeDeleted'));
    }

    // display success message
    await destroyRoleById(id);

    dispatch(setMessageSlice(i18n.t('user:role.deleteRoleSuccessfully', { name: roleName })));

    // reload the list of deleted rides
    await dispatch(destroyRoleSlice(id));
  },
  // rights
  {
    collection,
    action: 'delete',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
export const onRolesEnter = (): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Partial<ILoadRolesInput> = { withAdminOrBetter: false, withUsersCount: true };

    dispatch(clearListUnlessLoadedWith(loadRolesSlice, values, [clearRolesSlice()]));
    dispatch(loadRoles(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const onCreateRoleEnter = (): any => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    dispatch(clearRoleSlice());

    // load every role for the hierarchy select field
    const roles = await fetchRoles(RELATION_OPTIONS_LIMIT, 0, false, false);

    dispatch(loadRolesSlice(roles));
    // read without the member counts the roles list shows, so that list cannot draw them
    forgetListQuery(loadRolesSlice);
  },
  // rights
  {
    collection,
    action: 'create',
  });
};

export const onEditRoleEnter = (route?: any): any => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const id = route?.params?.id;

    if (!id) return;

    /*
     * load every role: one is the edited role, the rest feed the hierarchy select field. Neither
     * shows how many accounts hold a role, so the per-role member count is not fetched
     */
    const roles = await fetchRoles(RELATION_OPTIONS_LIMIT, 0, false, false);
    const role = roles.find((currentRole: IRole): boolean => currentRole.id === id);

    if (!role) {
      throw new Error(Errors.notFound);
    }

    // the stored hierarchy: the form starts from it, not from an empty list
    const children = await fetchRoleChildren(id);

    dispatch(loadRolesSlice(roles));
    // read without the member counts the roles list shows, so that list cannot draw them
    forgetListQuery(loadRolesSlice);
    dispatch(loadRoleSlice({ ...role, children }));
  },
  // rights
  {
    collection,
    action: 'update',
  });
};

export const onCreateOrEditRoleLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearRoleSlice());
  };
};

/*
 * ---------------------------------------- //
 * -------------- redirection ------------- //
 * ---------------------------------------- //
 */
export const goToRoles = () => ({ to: PATH_NAMES.roles });
export const goToAddRole = (): any => ({ to: PATH_NAMES.roles + '/' + PATH_NAMES.create });
export const goToEditRole = (id: string): any => ({ to: PATH_NAMES.roles + '/$id/' + PATH_NAMES.edit, params: { id } });
