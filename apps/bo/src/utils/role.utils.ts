import Parse from 'parse';

import { ITabSearchParams } from '@/types/app.type';
import {
  IHasRights,
  IRightsItem, IRole, IRoleAction,
} from '@/types/role.type';

import { isCurrentTab } from './app.utils';
import { HIGHEST_LEVEL_DEFAULT_ROLES } from './constants';


/**
 * get list of users by roles
 * @param {Array<String>} roleNames
 * @returns {Promise.<Parse.User>}
 */
export const getUsersIdsFromRoles = async (roleNames = HIGHEST_LEVEL_DEFAULT_ROLES): Promise<string[]> => {
  const userIds: string[] = [];

  await new Parse.Query(Parse.Role).containedIn('name', roleNames).each(async (role) => {
    await role
      .getUsers()
      .query()
      .each((userRelation: any): any => userIds.push(userRelation.id));
  });

  return userIds;
};

/**
 * get roles of selected user
 * @param {ParseObject} user
 * @returns {Promise<IRole>}
 */
export const getRolesForUser = async (user?: Record<string, any> | null, all = false): Promise<any> => {
  let parseUser: any = user;

  // current user by default
  if (!user) {
    parseUser = await Parse.User.currentAsync();
  }

  // if json
  if (user && !user.className) {
    parseUser = await new Parse.Query(Parse.User).equalTo('objectId', user.objectId).first();
  }

  const query = new Parse.Query(Parse.Role)
    .equalTo('users', parseUser);

  if (!all) {
    query.notEqualTo('name', HIGHEST_LEVEL_DEFAULT_ROLES[0]);
  }

  const roles = await query.find();

  return roles;
};

export const isAdmin = async (): Promise<boolean> => {
  const hasRole = await Parse.Cloud.run('hasRole', { roleNames: HIGHEST_LEVEL_DEFAULT_ROLES });

  return hasRole;
};


/**
 * action based on roles and rights
 * @param roles
 * @param className
 * @param action {find, get, update, delete}
 * @returns
 */
export const canAccessTo = (
  roles: IRole[],

  /**
   * class name of the object = collection name
   * @example '_User', 'Role', 'Article', ...
   */
  className?: string,

  /**
   * action to perform on the object (database action)
   * it differs from the ui role by the fact that it's used for database access
   * NOTE: it is not needed for UI access
   * @example 'find', 'get', 'update', 'delete'
   */
  action: IRoleAction = 'find',

  /**
   * ui role to check
   * it differs from the database role by the fact that it's used for UI access
   * @example access to a tab, a page, a menu, (miscellaneous, tests, ...)
   */
  uiRight?: string
): boolean => {
  // high level roles can access to all
  const hasHighestRoles = roles.some((role: IRole) => HIGHEST_LEVEL_DEFAULT_ROLES.includes(role.get('name')));

  if (hasHighestRoles) {
    return true;
  }

  // Rights for resources (database collections), ex: _User, _Role, Article, Page, Category
  if (className) {
    for (const role of roles) {
      const rights = role.get('rights');

      if (rights) {
        const right = rights.find(
          (right: IRightsItem) => right.className === className && right.rights[action]
        );

        if (right) {
          return true;
        }
      }
    }
    return false;
  }

  // UI rights (ex: misc, tests)
  if (uiRight) {
    return roles.some((role: IRole) => role.get('ui').includes(uiRight));
  }

  return false;
};

export const getRights = (
  roles: IRole[],
  className?: string,
  uiRight?: string
): any => {
  // high level roles can access to all
  const hasHighestRoles = roles.some((role: IRole) => HIGHEST_LEVEL_DEFAULT_ROLES.includes(role.get('name')));

  const rightsObj: IHasRights = {
    canPreview: false,
    canDelete: false,
    canCreate: false,
    canFind: false,
    canEdit: false,
    canDestroy: false,
  };

  if (hasHighestRoles) {
    Object.keys(rightsObj).forEach((key: string) => (rightsObj[key as keyof IHasRights] = true));
    return rightsObj;
  }

  // Rights for resources (database collections), ex: _User, _Role, Article, Page, Category
  if (className) {
    for (const role of roles) {
      const rights = role.get('rights');

      if (rights) {
        const right = rights.find((right: IRightsItem) => right.className === className);

        if (right) {
          rightsObj.canCreate = right.rights.create;
          rightsObj.canFind = right.rights.find;
          rightsObj.canPreview = right.rights.get;
          rightsObj.canEdit = right.rights.update;
          rightsObj.canDelete = right.rights.delete;
          rightsObj.canDestroy = right.rights.destroy;
          break; // Exit loop early if rights are found
        }
      }
    }
  }

  // UI rights (ex: misc, tests)
  if (uiRight) {
    const hasUIRight = roles.some((role: IRole): boolean => role.get('ui').includes(uiRight));

    if (hasUIRight) {
      rightsObj.canFind = true;
      rightsObj.canPreview = true;
    }
  }

  return rightsObj;
};

/**
 * get rights for a collection
 * it's used to display the rights in the UI
 */
type IGetActionRightsOutput = {
  canDelete: boolean;
  canPreview: boolean;
  canEdit: boolean;
  canDestroy: boolean;
  canCreate: boolean;
};

export const getActionRights = <T extends Partial<ITabSearchParams>>(
  roles: IRole[],
  collection: string,
  searchParams: T
): IGetActionRightsOutput => {
  const canDelete = canAccessTo(roles, collection, 'delete');
  const canPreview = canAccessTo(roles, collection, 'get');
  const canEdit = canAccessTo(roles, collection, 'update');
  const canCreate = canAccessTo(roles, collection, 'create');

  const canDestroy = isCurrentTab(searchParams.tab) &&
    canAccessTo(roles, collection, 'destroy');

  return { canDelete, canPreview, canEdit, canDestroy, canCreate };
};
