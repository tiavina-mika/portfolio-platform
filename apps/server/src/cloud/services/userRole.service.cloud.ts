import type { Role, User } from 'parse';

import { HIGHEST_LEVEL_ROLES, USE_MASTER_KEY } from '@/utils/constants';

import { createRole } from './right.service.cloud';

const setRoleForUser = async (role: Role, action = 'add', user?: User): Promise<undefined | void> => {
  try {
    if (!user || !role) return;
    if (role.getName() != null) {
      if (action === 'remove') {
        // remove any role for user
        role.getUsers().remove(user);
      }
      else {
        // add new role for user
        role.getUsers().add(user);
      }
      await role.save(null, USE_MASTER_KEY);
    }
  }
  catch (error) {
    let messageType = 'adding new role';

    if (action === 'remove') {
      messageType = 'removing old role';
    }
    if (!user) return;
    console.log('Error while ' + messageType + ' ' + role.id + ' for user ' + user.id + ' : ' + (error as Error).message);
  }
};

/**
 * get roles of selected user
 * @param user
 * @returns {Promise<Role>}
 */
export const getRolesForUser = async (user?: User): Promise<Role[] | null> => {
  if (!user) return null;

  const query = new Parse.Query(Parse.Role);

  query.equalTo('users', user);
  const roles = await query.find(USE_MASTER_KEY);

  return roles;
};

export const getRolesForUserByEntity = async (className: string, user?: User): Promise<Role[] | null> => {
  if (!user) return null;

  const query = new Parse.Query(Parse.Role);

  query.equalTo('users', user);
  query.equalTo('rights.className', className);
  const roles = await query.find(USE_MASTER_KEY);

  return roles;
};

export const addOrUpdateRoleForUser = async (roleName: string, user?: User): Promise<void> => {
  let role = await new Parse.Query(Parse.Role).equalTo('name', roleName).first(USE_MASTER_KEY);

  if (!role) {
    role = await createRole(roleName);
  }
  // ---- add new role for user ----//
  await setRoleForUser(role, 'add', user);
};

/**
 * get roles of selected user
 * @param user
 * @returns {Promise<Role>}
 */
export const updateRoleForUser = async (roleNames: string[], user?: User): Promise<void | undefined> => {
  if (!user) {
    throw new Error('User is not found');
  }

  /*
   * -------------------------------------------------------//
   * -------------- checking roleNames ---------------------//
   * -------------------------------------------------------//
   */
  if (!roleNames) {
    throw new Error('Missing roles for selected user');
  }

  /*
   * -------------------------------------------------------//
   * -------------------- checking roles -------------------//
   * -------------------------------------------------------//
   */
  const saveRolesForUser = await getRolesForUser(user);

  // ---- checking new roles ----//
  if (roleNames?.length) {
    // we use for.. of not foreach because of async await
    for (const roleName of roleNames) {
      const hasNoRole = !saveRolesForUser;
      const hasRoleButNotForThisUser =
        saveRolesForUser &&
        !saveRolesForUser.find(
          savedRoleForUser => savedRoleForUser.getName() === roleName
        );

      if (hasNoRole || hasRoleButNotForThisUser) {
        await addOrUpdateRoleForUser(roleName, user);
      }
    }
  }

  // ---- checking old roles ----//
  if (saveRolesForUser?.length) {
    // we use for.. of not foreach because of async await
    for (const savedRoleForUser of saveRolesForUser) {
      const savedRoleName = savedRoleForUser.getName();

      if (!roleNames.includes(savedRoleName)) {
        /*
         * current saved role should be deleted on user
         * ---- remove old role for user ----//
         */
        await setRoleForUser(savedRoleForUser, 'remove', user);
      }
    }
  }
};

export const removeRolesForUser = async (user?: User): Promise<void | undefined> => {
  /*
   * -------------------------------------------------------//
   * -------------------- checking roles -------------------//
   * -------------------------------------------------------//
   */
  const savedRoles = await getRolesForUser(user);

  // ---- checking old roles ----//
  if (savedRoles?.length) {
    // we use for.. of not foreach because of async await
    for (const savedRole of savedRoles) {
      /*
       * current saved role should be deleted on this user
       * ---- remove old role for user ----//
       */
      await setRoleForUser(savedRole, 'remove', user);
    }
  }
};

/**
 * check if user has role (at least one profile)
 * @param user
 * @param roleName (optional)
 * @returns {Promise.<boolean>}
 */
export const hasRole = async (roleNames = HIGHEST_LEVEL_ROLES, user?: User): Promise<boolean> => {
  if (!user) {
    return false;
  }

  // ---- query ----//
  const query = new Parse.Query(Parse.Role);

  query.equalTo('users', user);

  if (roleNames) {
    query.containedIn('name', roleNames);
  }

  const role = await query.first(USE_MASTER_KEY);

  return role != null;
};

/**
 * check if user has any role as manager
 */
export const hasRoleAsManager = async (user?: User): Promise<boolean> => {
  if (!user) {
    throw new Error('Missing user');
  }
  const roles = await new Parse.Query(Parse.Role).find(USE_MASTER_KEY);
  const managerNames = roles ? roles.map((role: Parse.Role) => role.get('name')) : [];
  const roleManager = await new Parse.Query(Parse.Role).equalTo('users', user).containedIn('name', managerNames).first(USE_MASTER_KEY);

  return !!roleManager;
};

export const getUserIdsFromRoles = async (roleNames: string[] = []): Promise<string[]> => {
  const userIds = new Set();

  await new Parse.Query(Parse.Role)
    .containedIn('name', roleNames)
    .each(async (role: Parse.Role): Promise<void> => {
      await role
        .getUsers()
        .query()
        .each(
          (user: User): void => {
            (userIds as any).add(user.id as any);
          },
          USE_MASTER_KEY
        );
    }, USE_MASTER_KEY);

  return Array.from(userIds) as string[];
};


/**
 * get list of users to send notification
 * @param {Array<String>} roleNames
 * @returns {Promise.<Parse.User>}
 */
export const getUsersFromRoles = async (roleNames = ['Administrator']): Promise<User[]> => {
  const userIds = await getUserIdsFromRoles(roleNames);

  const users = await new Parse.Query(Parse.User)
    .containedIn('objectId', Array.from(userIds))
    .find(USE_MASTER_KEY);

  return users;
};
