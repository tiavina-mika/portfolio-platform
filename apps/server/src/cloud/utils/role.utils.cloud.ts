import type { Role, User } from 'parse';

import { HIGHEST_LEVEL_ROLES } from '@/utils/constants';

import {
  getRolesForUser, getRolesForUserByEntity, hasRole, hasRoleAsManager,
} from '../services/userRole.service.cloud';

const RIGHTS: ('create' | 'update' | 'get' | 'find' | 'delete' | 'destroy')[] = ['create', 'update', 'get', 'find', 'delete', 'destroy'];

export const DEFAULT_COOPERATIVE_ROLES = ['admin', 'creator'];

export const isRequestFromManager = async (request: Record<string, any>): Promise<boolean> => {
  const hasUserManagerRole = await hasRoleAsManager(request.user);

  return request.master || hasUserManagerRole;
};

/**
 * @param user
 * @param roleName
 * @returns {Promise.<void>}
 */
export const checkRole = async (user: User, roleName: string): Promise<void> => {
  const hasRoleUser = await hasRole([roleName], user);

  if (!hasRoleUser) {
    throw new Error('The user ' + user.get('username') + ' doesn\'t have the role ' + roleName);
  }
};

/**
 * @param user
 * @returns {Promise.<boolean>}
 */
export const isAdministrator = async (user: User): Promise<boolean> => {
  const hasRoleUser = await hasRole(HIGHEST_LEVEL_ROLES, user);

  return hasRoleUser;
};

export const getUserRoles = async (user: User): Promise<Role[] | null> => {
  if (!user) return null;

  const roles = await getRolesForUser(user);

  return roles;
};

export const isAdministratorOrBetter = async (request: Record<string, any>): Promise<boolean> => {
  if (request.master) {
    return true;
  }
  const { user } = request;

  const isAdmin = await isAdministrator(user);

  return isAdmin;
};

/**
 * @param user
 * @returns {Promise.<boolean>}
 */
export const isOwner = async (user: User): Promise<boolean> => {
  const isUserOwner = await hasRole([HIGHEST_LEVEL_ROLES[1]!], user);

  return isUserOwner;
};

/**
 * @param user
 * @returns {Promise.<boolean>}
 */
const isHighestRoles = async (user: User): Promise<boolean> => {
  const isUserHasHighestRoles = await hasRole(HIGHEST_LEVEL_ROLES, user);

  return isUserHasHighestRoles;
};

/**
 * check if the user has the right to do something
 * @param user
 * @returns {Promise<boolean>}
 */
export const hasRight = async (user: User, className: string, operations = RIGHTS): Promise<boolean> => {
  // ------- admin and owner ------- //
  const hasFullRight = await isHighestRoles(user);

  if (hasFullRight) {
    return true;
  }

  // ------ other roles ------ //
  const roles = await getRolesForUserByEntity(className, user);

  const hasFinalRights: boolean[] = [];

  if (roles) {
    for (const role of roles) {
      const roleRights = role.get('rights');
      const roleForClassName = roleRights.find((right: any) => right.className === className);
      const hasEveryRight = operations.every((operation) => {
        if (Object.keys(roleForClassName.rights).includes(operation)) {
          return roleForClassName.rights[operation];
        }
        return false;
      });

      hasFinalRights.push(hasEveryRight);
    }
  }

  return hasFinalRights.every(right => !!right);
};

/**
 * @param user
 * @returns {Promise.<void>}
 */
export const checkAdministrator = async (user: User): Promise<void> => {
  await checkRole(user, 'Administrator');
};

export const createSecurityError = (message: string): any => {
  // see http://docs.parseplatform.org/js/guide/#error-codes
  return new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, message);
};
