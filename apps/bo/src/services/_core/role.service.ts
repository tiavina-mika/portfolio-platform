import Parse from 'parse';

import { HIGHEST_LEVEL_ROLES, RELATION_OPTIONS_LIMIT, ROLE_DEFAULT_LIMIT } from '@/constants/_core/user.constants';
import { IHighestRoleAccount, IRole, IRolesDelegation } from '@/types/_core/role.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchRoles = async (
  limit: number,
  skip: number,
  withAdminOrBetter: boolean,
  withUsersCount: boolean
): Promise<IRole[]> => {
  // a stable order keeps a "load more" page from repeating or skipping a role
  const query = new Parse.Query(Parse.Role).notEqualTo('deleted', true).ascending('name');

  if (withAdminOrBetter) {
    query.notEqualTo('name', HIGHEST_LEVEL_ROLES[0]);
  }
  else {
    query.notContainedIn('name', HIGHEST_LEVEL_ROLES);
  }

  query.limit(+limit).skip(+skip);

  const roles = await query.find();

  if (!withUsersCount) {
    return roles.map((role) => toJSONWithId<IRole>(role));
  }

  // one count per role, independent of each other: fired together rather than one round-trip after another
  return Promise.all(roles.map(async (role): Promise<IRole> => {
    const count = await role.getUsers().query().count();

    return { ...toJSONWithId<IRole>(role), count };
  }));
};

export const createRoleInCloud = async (body: Record<string, any>): Promise<IRole | undefined> => {
  const newRole = await Parse.Cloud.run('createRole', body);

  return newRole ? toJSONWithId<IRole>(newRole) : undefined;
};

export const updateRoleInCloud = async (body: Record<string, any>): Promise<IRole | undefined> => {
  const newRole = await Parse.Cloud.run('updateRole', body);

  return newRole ? toJSONWithId<IRole>(newRole) : undefined;
};

// adds to the roles the account already holds — the server merges, the caller never sends the whole set
export const addRolesToUserInCloud = async (userId: string, roleNames: string[]): Promise<void> => {
  await Parse.Cloud.run('addRolesToUser', { userId, roleNames });
};

/**
 * the roles that inherit the privileges of the given role, without the highest ones — the form never
 * lists those, they are children of every role by construction
 */
export const fetchRoleChildren = async (id: string): Promise<IRole[]> => {
  const role = await new Parse.Query(Parse.Role).select(['name']).get(id);
  const children = await role
    .getRoles()
    .query()
    .notContainedIn('name', HIGHEST_LEVEL_ROLES)
    .select(['name'])
    .limit(RELATION_OPTIONS_LIMIT)
    .find();

  return children.map((child) => toJSONWithId<IRole>(child));
};

/**
 * why the signed-in account may not change the posts of an account (its own, a highest role holder's),
 * and which of the given posts it may not hand out — a highest role, or a post that grants something
 * the signed-in account does not hold itself
 */
export const fetchRolesDelegation = async (
  userId: string,
  roleNames: string[]
): Promise<IRolesDelegation> => Parse.Cloud.run('getRolesDelegation', { userId, roleNames });

export const removeRolesForUserInCloud = async (userId: string, roleNames: string[]): Promise<void> => {
  await Parse.Cloud.run('removeRolesForUser', { userId, roleNames });
};

export const fetchRoleNameById = async (id: string): Promise<string | undefined> => {
  const role = await new Parse.Query(Parse.Role).equalTo('objectId', id).first();

  return role?.getName() ?? undefined;
};

export const destroyRoleById = async (id: string): Promise<void> => {
  const role = await new Parse.Query(Parse.Role).equalTo('objectId', id).first();

  await role?.destroy();
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
    .equalTo('users', parseUser)
    // a user is expected to hold only a handful of roles — same cap as fetchRoles above
    .limit(ROLE_DEFAULT_LIMIT);

  if (!all) {
    query.notEqualTo('name', HIGHEST_LEVEL_ROLES[0]);
  }

  const roles = await query.find();

  return roles;
};

/**
 * the roles one account holds, read from its id alone — a pointer is all the relation needs, so it
 * does not wait for the account itself to be fetched first
 * @param userId the account whose roles to list
 */
export const fetchRolesForUser = async (userId: string): Promise<IRole[]> => {
  const roles: Parse.Role[] = await getRolesForUser(Parse.User.createWithoutData(userId));

  return roles.map((role) => toJSONWithId<IRole>(role));
};

export const isAdmin = async (): Promise<boolean> => {
  const hasRole = await Parse.Cloud.run('hasRole', { roleNames: HIGHEST_LEVEL_ROLES });

  return hasRole;
};

// owners and super administrators only: the server refuses anybody else
export const fetchHighestRoleAccounts = async (): Promise<IHighestRoleAccount[]> => {
  return Parse.Cloud.run('getHighestRoleAccounts');
};
