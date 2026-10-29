import Parse from 'parse';

import i18n from '@/config/i18n';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { setMessageSlice } from '@/redux/reducers/app.reducer';
import {
  addRoleSlice,
  clearRolesSlice,
  destroyRoleSlice,
  getRoleRolesSelector,
  loadRolesSlice,
  loadUserRolesSlice,
  updateRolesByRoleSlice,
} from '@/redux/reducers/role.reducer';
import { AppDispatch, RootState } from '@/redux/store';
import {
  ILoadRolesInput, IRole, IRoleInput, RolesForUserInput,
} from '@/types/role.type';
import { DEFAULT_ROLES, HIGHEST_LEVEL_DEFAULT_ROLES, ROLE_DEFAULT_LIMIT } from '@/utils/constants';
import { PATH_NAMES } from '@/utils/pathnames';

const collection = 'Role';

export const loadRoles = ({
  limit = ROLE_DEFAULT_LIMIT,
  skip = 0,
  withAdminOrBetter = true,
  withUsersCount = false,
  incrementItems = false,
}: Partial<ILoadRolesInput>): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.();
    const oldRoles = getRoleRolesSelector(state as Record<string, any>);
    // --------- load from database --------- //
    const query = await new Parse.Query(Parse.Role).notEqualTo('deleted', true);

    if (withAdminOrBetter) {
      query.notEqualTo('name', HIGHEST_LEVEL_DEFAULT_ROLES[0]);
    }
    else {
      query.notContainedIn('name', HIGHEST_LEVEL_DEFAULT_ROLES);
    }

    query.limit(+limit).skip(+skip);

    const roles: Record<string, any>[] = await query.find();

    let rolesWithCount: any[] = [];

    if (withUsersCount) {
      for (const role of roles) {
        const count = await role.getUsers().query().count();

        role.set('count', count);
        rolesWithCount.push(role);
      }
    }
    else {
      rolesWithCount = roles;
    }

    const newRoles = incrementItems
      ? [...oldRoles, ...rolesWithCount]
      : rolesWithCount;

    // --------- update store --------- //
    dispatch(loadRolesSlice(newRoles));
  });
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
      parentRoleNames: values.children,
      roleName: values.name,
      rights: values.rights.map((right: any) => ({ className: right.className, rights: right.rights })),
      ui: values.ui,
    };

    const newRole = await Parse.Cloud.run('createRole', body);

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
      parentRoleNames: values.children,
      rights: values.rights.map((right: any) => ({ className: right.className, rights: right.rights })),
      ui: values.ui,
    };

    const newRole = await Parse.Cloud.run('updateRole', body);

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

export const addRolesToUser = (userId: string, values: RolesForUserInput, currentRoles?: IRole[]): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- update database --------- //
    const currentRoleNames = currentRoles?.map((role: IRole): string => role.get('name')) || [];
    const allRoleNames = [...values.roles, ...currentRoleNames];

    const body = { userId, roleNames: allRoleNames };

    await Parse.Cloud.run('addOrUpdateRolesToUser', body);

    // reload user roles
    const roles = await new Parse.Query(Parse.Role)
      .notEqualTo('deleted', true)
      .containedIn('name', allRoleNames)
      .limit(1000)
      .skip(0)
      .find();

    dispatch(loadUserRolesSlice(roles as any));

    dispatch(setMessageSlice(i18n.t('user:role.addRolesToThisUserSuccessfully', { count: roles.length })));
  },
  // rights
  {
    collection: '_User',
    action: 'update',
  });
};

export const removeRolesForUser = (userId: string, roles: IRole[]): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.();
    const userRoles = (state as any)?.role.userRoles ?? [];

    // --------- update database --------- //
    const roleNames = roles.map((role: IRole): string => role.get('name'));
    const body = { userId, roleNames };

    await Parse.Cloud.run('removeRolesForUser', body);

    // get the non removed roles
    const newRoles = userRoles.filter((role: IRole) => !roleNames.includes(role.get('name')));

    // --------- update store --------- //
    dispatch(loadUserRolesSlice(newRoles));

    dispatch(
      setMessageSlice(
        i18n.t('user:role.removeRolesForThisUserSuccessfully', { count: roleNames.length - newRoles.length })
      )
    );
  },
  // rights
  {
    collection: '_User',
    action: 'delete',
  });
};

/**
 * destroy role and unlink its users
 * @param id
 * @returns
 */
export const destroyRole = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // update the database
    const role = await new Parse.Query(Parse.Role).equalTo('objectId', id).first();

    if (!role) {
      throw new Error(i18n.t('user:role.roleNotFound'));
    }

    if (DEFAULT_ROLES.includes(role.getName() ?? '')) {
      throw new Error(i18n.t('user:role.roleCannotBeDeleted'));
    }

    // display success message
    await role.destroy();

    dispatch(setMessageSlice(i18n.t('user:role.deleteRoleSuccessfully', { name: role.getName() })));

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
    dispatch(loadRoles({ withAdminOrBetter: false, withUsersCount: true }));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
export const onRolesLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearRolesSlice());
  };
};

/*
 * ---------------------------------------- //
 * -------------- redirection ------------- //
 * ---------------------------------------- //
 */
export const goToRoles = (): any => ({ to: PATH_NAMES.roles });
