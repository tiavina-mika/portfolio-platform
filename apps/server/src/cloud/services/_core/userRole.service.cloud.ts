import type { Locale } from '@/types/app.type';
import type { Role, User } from 'parse';


import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import {
  DEFAULT_QUERY_LIMIT, HIGHEST_LEVEL_ROLES, STAFF_UI_RIGHT, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  MIN_OWNERS_COUNT, ROLE_ANCESTORS_LEVEL_MAX_COUNT, ROLE_ANCESTORS_MAX_DEPTH,
} from '@/constants/_core/role.constants';
import { OwnerAlertEventEnum } from '@/types/ownerAlert.type';
import { type IHighestRoleAccount, type IRolesDelegation } from '@/types/user.type';
import { logger } from '@/utils/_core/logger';
import { isRoleWithinRights, type RoleGrants } from '@/utils/_core/rights.utils';

import { alertOwners } from './ownerAlert.service.cloud';
import { createRoleAuditLog } from './roleAuditLog.service.cloud';
import { forgetAllowedCountriesOf } from '../../triggers/_core/country-scope.triggers';
import { sendEmailToUser } from '../../utils/_core/email.utils.cloud';

const setRoleForUser = async (role: Role, action: 'add' | 'remove' = 'add', user?: User): Promise<void> => {
  if (!user || role?.getName() == null) return;

  if (action === 'remove') {
    role.getUsers().remove(user);
  }
  else {
    role.getUsers().add(user);
  }

  // a failure reaches the caller before any audit line is written
  await role.save(null, USE_MASTER_KEY);

  // the countries this account may work on come from its roles: the old answer must not outlive them
  forgetAllowedCountriesOf(user.id);
};

/**
 * number of users currently holding the given role — used to guard against removing the last
 * holder of a structural role (e.g. OWNER) and leaving the platform without one
 */
const countUsersWithRole = async (roleName: string): Promise<number> => {
  const role = await new Parse.Query(Parse.Role).equalTo('name', roleName).select(['objectId']).first(USE_MASTER_KEY);

  if (!role) return 0;

  return role.getUsers().query().count(USE_MASTER_KEY);
};

/**
 * removes a role from a user, then checks the platform still has an OWNER. The count read before
 * the removal (the last OWNER guard) and the write are not tied together: two owners demoting
 * each other at once both read "2" and both pass. Counting again after the write catches that —
 * the role is put back and the demotion refused, before any audit line is written.
 */
const removeRoleKeepingAnOwner = async (role: Role, user: User): Promise<void> => {
  await setRoleForUser(role, 'remove', user);

  if (role.getName() !== HIGHEST_LEVEL_ROLES[0] || (await countUsersWithRole(HIGHEST_LEVEL_ROLES[0])) > 0) {
    return;
  }

  try {
    await setRoleForUser(role, 'add', user);
  }
  catch (error) {
    // the refusal below is the error the caller must see: the failed restore is only logged
    logger.error(`Could not put the OWNER role back on ${user.id} after a concurrent demotion`, {
      error: (error as Error).stack,
    });
  }

  throw new Error('user:role.lastOwnerCannotBeRemoved');
};

/** the names, among the given ones, that no stored role carries */
export const getMissingRoleNames = async (roleNames: string[]): Promise<string[]> => {
  const roles = await new Parse.Query(Parse.Role)
    .containedIn('name', roleNames)
    .select(['name'])
    .limit(roleNames.length)
    .find(USE_MASTER_KEY);
  const existingNames = new Set(roles.map((role) => role.getName()));

  return roleNames.filter((roleName) => !existingNames.has(roleName));
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
  query.select(['name', 'rights', 'ui', 'sessionTimeoutMinutes', 'countries']);
  const roles = await query.find(USE_MASTER_KEY);

  return roles;
};

/**
 * The roles held by each user of one page of the back-office users list, keyed by user id.
 *
 * A role's members live in a Parse relation on `_Role`, not on the user record, so the users the
 * list query returns carry nothing about them — which is why the "Roles" column of the
 * administrators tab has nothing to show without this. A relation can only be queried for one
 * object at a time (`equalTo('users', user)` resolves to a `$relatedTo` on that single user), so
 * the page is read role by role: there is a handful of roles against a whole page of users, where
 * the other way round would be one query per row.
 * @param users one page of users
 * @returns the roles of each user that holds at least one, as plain values the client can read
 */
export const getRolesByUserId = async (users: User[]): Promise<Map<string, Record<string, unknown>[]>> => {
  const rolesByUserId = new Map<string, Record<string, unknown>[]>();

  if (users.length === 0) return rolesByUserId;

  const userIds = users.map((user) => user.id);
  const roles = await new Parse.Query(Parse.Role)
    .select(['name', 'translated'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  await Promise.all(roles.map(async (role: Role): Promise<void> => {
    const holders = await role
      .getUsers()
      .query()
      .containedIn('objectId', userIds)
      .select(['objectId'])
      .limit(userIds.length)
      .find(USE_MASTER_KEY);

    holders.forEach((holder: User): void => {
      const roleValue = {
        id: role.id,
        objectId: role.id,
        name: role.getName(),
        translated: role.get('translated'),
      };

      rolesByUserId.set(holder.id, [...(rolesByUserId.get(holder.id) ?? []), roleValue]);
    });
  }));

  return rolesByUserId;
};

export const getRolesForUserByEntity = async (className: string, user?: User): Promise<Role[] | null> => {
  if (!user) return null;

  const query = new Parse.Query(Parse.Role);

  query.equalTo('users', user);
  query.equalTo('rights.className', className);
  query.select(['name', 'rights']);
  const roles = await query.find(USE_MASTER_KEY);

  return roles;
};

export const addOrUpdateRoleForUser = async (roleName: string, user?: User): Promise<void> => {
  const role = await new Parse.Query(Parse.Role).equalTo('name', roleName).first(USE_MASTER_KEY);

  if (!role) {
    throw new Error(`Role "${roleName}" does not exist — create it explicitly via createRole first`);
  }
  // ---- add new role for user ----//
  await setRoleForUser(role, 'add', user);
};

/**
 * check if user has role (at least one profile)
 * @param user
 * @param roleNames (optional)
 * @returns {Promise.<boolean>}
 */
export const hasRole = async (roleNames = HIGHEST_LEVEL_ROLES, user?: User): Promise<boolean> => {
  if (!user) {
    return false;
  }

  /*
   * ---- query ----//
   * only existence matters: don't load the role's rights
   */
  const query = new Parse.Query(Parse.Role).select(['name']);

  query.equalTo('users', user);

  if (roleNames) {
    query.containedIn('name', roleNames);
  }

  const role = await query.first(USE_MASTER_KEY);

  return role != null;
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
 * ids of every user holding at least one Parse.Role (BO staff), regardless of the role's name —
 * custom roles can be created at runtime via `createRole`, so no hardcoded role-name list can
 * stay exhaustive; used to exclude staff/admin accounts from user-facing counts
 */
export const getAllRoleUserIds = async (): Promise<string[]> => {
  const userIds = new Set();

  await new Parse.Query(Parse.Role)
    .select(['objectId'])
    .each(async (role: Parse.Role): Promise<void> => {
      await role
        .getUsers()
        .query()
        .select(['objectId'])
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
export const getUsersFromRoles = async (roleNames = ['SUPER_ADMIN']): Promise<User[]> => {
  const userIds = await getUserIdsFromRoles(roleNames);

  const users = await new Parse.Query(Parse.User)
    .containedIn('objectId', Array.from(userIds))
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  return users;
};

/**
 * Warns, in the server log, when the platform has fewer owners than recommended. The OWNER-only
 * actions — resetting an administrator's MFA, revoking a super-administrator — have no way round
 * them: a single owner who loses their authenticator leaves them out of reach of everybody. Run at
 * every start, the warning is what an operator reads in the hosting console.
 */
export const warnIfTooFewOwners = async (): Promise<void> => {
  const ownersCount = await countUsersWithRole(HIGHEST_LEVEL_ROLES[0]!);

  if (ownersCount >= MIN_OWNERS_COUNT) return;

  logger.warn(
    `[bootstrapAdmin] ${ownersCount} OWNER account(s), ${MIN_OWNERS_COUNT} required: ` +
    'give the role to a second trusted person so the owner-only actions keep a way back'
  );
};

const ROLE_GRANTS_FIELDS = ['name', 'rights', 'ui', 'countries'];

const toRoleGrants = (role: Role): RoleGrants => ({
  rights: role.get('rights'),
  ui: role.get('ui'),
  countries: role.get('countries'),
});

type RoleAncestry = {
  // a role → the roles listing it as a child
  parentsById: Map<string, Role[]>;
  // the roles whose parents could not all be read
  unreadIds: Set<string>;
};

/**
 * Every role above the given ones, read once for all of them: a member of a role inherits the CLP of
 * each role that lists it as a child, so giving a post also gives what its parents grant through the
 * raw SDK. A role is unread when the walk stopped before its parents — past the depth limit, or on a
 * level so wide that the query hit its page size — so what was not read can be told from what was
 * read and found harmless. One query per level, plus one per parent found: the level query says which
 * roles are parents, not of which role of the level, so each parent tells which ones it holds.
 */
const getRoleAncestry = async (roles: Role[]): Promise<RoleAncestry> => {
  const parentsById = new Map<string, Role[]>();
  const unreadIds = new Set<string>();
  const seenIds = new Set(roles.map((role) => role.id));
  let level = roles;

  for (let depth = 0; depth < ROLE_ANCESTORS_MAX_DEPTH && level.length; depth++) {
    const levelIds = level.map((role) => role.id);
    const parents = await new Parse.Query(Parse.Role)
      .containedIn('roles', level)
      .select(ROLE_GRANTS_FIELDS)
      .limit(ROLE_ANCESTORS_LEVEL_MAX_COUNT)
      .find(USE_MASTER_KEY);

    if (parents.length >= ROLE_ANCESTORS_LEVEL_MAX_COUNT) levelIds.forEach((id) => unreadIds.add(id));

    const childrenOfParents = await Promise.all(parents.map((parent) => parent.getRoles().query()
      .containedIn('objectId', levelIds)
      .select(['name'])
      .limit(levelIds.length)
      .find(USE_MASTER_KEY)));

    parents.forEach((parent, index) => {
      childrenOfParents[index]!.forEach((child) => {
        parentsById.set(child.id, [...(parentsById.get(child.id) ?? []), parent]);
      });
    });

    level = parents.filter((parent) => !seenIds.has(parent.id));
    level.forEach((parent) => seenIds.add(parent.id));
  }

  // roles are still left to read past the last level
  level.forEach((role) => unreadIds.add(role.id));

  return { parentsById, unreadIds };
};

/** whether a role and every role above it grant nothing beyond `actorGrants`, and were all read */
const isWithinRightsWithAncestors = (
  role: Role,
  ancestry: RoleAncestry,
  actorGrants: RoleGrants[]
): boolean => {
  const toVisit = [role];
  const visitedIds = new Set<string>();

  while (toVisit.length) {
    const current = toVisit.pop()!;

    if (visitedIds.has(current.id)) continue;
    visitedIds.add(current.id);

    if (ancestry.unreadIds.has(current.id) || !isRoleWithinRights(toRoleGrants(current), actorGrants)) {
      return false;
    }
    toVisit.push(...(ancestry.parentsById.get(current.id) ?? []));
  }
  return true;
};

/**
 * Which of the given posts grant something the actor's own roles do not: a collection right, a
 * back-office screen or a country they lack — in the post itself or in any post above it. A post
 * whose parents could not all be read counts as granting more: a check on rights refuses what it
 * could not verify. The roles above are read once for every post, the posts sharing most of them.
 */
const getRoleNamesBeyondRights = async (roleNames: string[], actorRoles: Role[]): Promise<string[]> => {
  if (!roleNames.length) return [];

  const roles = await new Parse.Query(Parse.Role)
    .containedIn('name', roleNames)
    .select(ROLE_GRANTS_FIELDS)
    .limit(roleNames.length)
    .find(USE_MASTER_KEY);
  const actorGrants = actorRoles.map(toRoleGrants);
  const ancestry = await getRoleAncestry(roles);

  return roles
    .filter((role) => !isWithinRightsWithAncestors(role, ancestry, actorGrants))
    .map((role) => role.getName());
};

const hasStaffRight = (roles: Role[]): boolean => roles.some(
  (role) => (role.get('ui') ?? []).includes(STAFF_UI_RIGHT)
);

/**
 * Who may give or take back posts. An OWNER or a SUPER_ADMIN may (the other guards of
 * `updateRoleForUser` still apply to them). Anybody else needs the `staff` right, and then only:
 * - never on their own account, nor on an account holding a highest role, nor on an account that has
 *   the `staff` right too — a stolen or angry team lead could otherwise strip every colleague;
 * - never a highest role;
 * - only a post that grants nothing they do not hold themselves — its parents included.
 * The owners are not employees: without this, staffing the back-office would wait on them, or push
 * them to make every team lead a super-administrator.
 * @param actor the back-office account making the change
 * @param roleNames the posts given or taken back
 * @param target the account whose posts change — none for an invitation, whose account does not exist yet
 */
export const assertCanDelegateRoles = async (
  actor: User | undefined,
  roleNames: string[],
  target?: User
): Promise<void> => {
  if (!actor) throw new Error('user:role.notAllowedToManageStaff');
  if (await hasRole(HIGHEST_LEVEL_ROLES, actor)) return;

  const actorRoles = (await getRolesForUser(actor)) ?? [];

  if (!hasStaffRight(actorRoles)) {
    throw new Error('user:role.notAllowedToManageStaff');
  }

  if (target?.id === actor.id) {
    throw new Error('user:role.cannotChangeOwnRoles');
  }

  const isGivingHighestRole = roleNames.some((roleName) => HIGHEST_LEVEL_ROLES.includes(roleName));

  if (isGivingHighestRole || (target && await hasRole(HIGHEST_LEVEL_ROLES, target))) {
    throw new Error('user:role.cannotDelegateHighestRole');
  }

  if (target && hasStaffRight((await getRolesForUser(target)) ?? [])) {
    throw new Error('user:role.cannotChangeStaffManagerRoles');
  }

  if ((await getRoleNamesBeyondRights(roleNames, actorRoles)).length) {
    throw new Error('user:role.roleWiderThanYours');
  }
};

/**
 * What the actor may do with the posts of `target`, so the screen can say so before the server has to
 * refuse: the same rules as `assertCanDelegateRoles` and the OWNER-only grants of `updateRoleForUser`.
 * - an OWNER may give every post;
 * - a SUPER_ADMIN may not give OWNER nor SUPER_ADMIN;
 * - anybody else with the `staff` right may not touch their own posts nor those of an account holding
 *   a highest role or the `staff` right too, may not give a highest role, nor a post beyond their rights.
 * @param actor the back-office account that opens the screen
 * @param target the account whose posts are about to change
 * @param roleNames the posts the "add posts" dialog lists
 */
export const getRolesDelegation = async (
  actor: User | undefined,
  target: User | undefined,
  roleNames: string[]
): Promise<IRolesDelegation> => {
  if (!actor) throw new Error('user:role.notAllowedToManageStaff');
  if (!target) throw new Error('User is not found');
  if (await hasRole([HIGHEST_LEVEL_ROLES[0]!], actor)) return { undelegableRoleNames: [] };

  const highestRoleNames = roleNames.filter((roleName) => HIGHEST_LEVEL_ROLES.includes(roleName));

  if (await hasRole(HIGHEST_LEVEL_ROLES, actor)) return { undelegableRoleNames: highestRoleNames };

  const actorRoles = (await getRolesForUser(actor)) ?? [];

  if (!hasStaffRight(actorRoles)) {
    throw new Error('user:role.notAllowedToManageStaff');
  }

  if (target.id === actor.id) return { lock: 'ownAccount', undelegableRoleNames: roleNames };

  if (await hasRole(HIGHEST_LEVEL_ROLES, target)) {
    return { lock: 'highestRoleAccount', undelegableRoleNames: roleNames };
  }

  if (hasStaffRight((await getRolesForUser(target)) ?? [])) {
    return { lock: 'staffAccount', undelegableRoleNames: roleNames };
  }

  const ordinaryRoleNames = roleNames.filter((roleName) => !HIGHEST_LEVEL_ROLES.includes(roleName));
  const beyondRightsRoleNames = await getRoleNamesBeyondRights(ordinaryRoleNames, actorRoles);

  return { undelegableRoleNames: [...highestRoleNames, ...beyondRightsRoleNames] };
};

/** tells the owners when OWNER or SUPER_ADMIN changes hands — the change is already written */
const alertOwnersOfElevatedRoles = async (
  event: OwnerAlertEventEnum,
  roleNames: string[],
  target: User,
  actor?: User
): Promise<void> => {
  const elevatedRoleNames = roleNames.filter((roleName) => HIGHEST_LEVEL_ROLES.includes(roleName));

  if (!elevatedRoleNames.length) return;

  await alertOwners(event, actor, {
    roles: elevatedRoleNames.join(', '),
    target: target.get('email') || target.id,
  });
};

/**
 * alerts every OWNER when the roles of an invitation could not be given to the account created
 * from it — the account exists without any role and nobody else would notice
 */
export const notifyOwnersOfInvitationFailure = async (
  targetEmail: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  try {
    const owners = await getUsersFromRoles([HIGHEST_LEVEL_ROLES[0]!]);

    await Promise.all(owners.map((owner) => sendEmailToUser(owner, {
      subject: translate('email.invitationRolesFailedSubject', locale),
      message: translate('email.invitationRolesFailedMessage', locale, { targetEmail }),
    })));
  }
  catch (error) {
    logger.error(`Could not alert the owners of the failed invitation roles of ${targetEmail}`, {
      error: (error as Error).stack,
    });
  }
};

type UpdateRoleForUserOptions = { bypassEscalationGuard?: boolean; invitedBy?: User };

/**
 * get roles of selected user
 * @param roleNames
 * @param user
 * @param requestingUser - the BO user performing the assignment, used for the escalation guard
 * @param options.bypassEscalationGuard - true only for trusted server-side bootstrap (e.g. owner signup),
 * never set from a value reachable from a Cloud Function param
 * @param options.invitedBy - the BO user whose invitation carried these roles, credited in the audit trail
 * when there is no requesting user (roles applied at sign-up)
 * @returns {Promise<Role>}
 */
export const updateRoleForUser = async (
  roleNames: string[],
  user?: User,
  requestingUser?: User,
  { bypassEscalationGuard = false, invitedBy }: UpdateRoleForUserOptions = {}
): Promise<void | undefined> => {
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

  const existingRolesByUser = await getRolesForUser(user) || [];
  const existingRoleNames = existingRolesByUser.map((existingRole) => existingRole.getName());
  const grantedRoleNames = roleNames.filter((roleName) => !existingRoleNames.includes(roleName));
  const revokedRoleNames = existingRoleNames.filter((roleName) => !roleNames.includes(roleName));

  /*
   * -------------------------------------------------------//
   * ------------ privilege escalation guard ----------------//
   * -------------------------------------------------------//
   * the cloud function only checks that the caller holds some role, so without this a read-only
   * account could give itself any ordinary role: only a highest role, or the `staff` right within
   * its bounds, may change someone's posts. Only the trusted server bootstrap bypasses it
   */
  if (!bypassEscalationGuard) {
    await assertCanDelegateRoles(requestingUser, [...grantedRoleNames, ...revokedRoleNames], user);
  }

  /*
   * every requested role must exist before the first write: giving them one by one would
   * otherwise apply the ones before an unknown role, then fail with a raw English message
   */
  if (roleNames.length && (await getMissingRoleNames(roleNames)).length) {
    throw new Error('user:role.unknownRole');
  }

  /*
   * -------------------------------------------------------//
   * -------------------- checking roles -------------------//
   * -------------------------------------------------------//
   */

  // giving OWNER is OWNER-only, like taking it away — otherwise a SUPER_ADMIN could promote themselves
  const isGrantingOwner =
    roleNames.includes(HIGHEST_LEVEL_ROLES[0]!) && !existingRoleNames.includes(HIGHEST_LEVEL_ROLES[0]!);

  if (isGrantingOwner && !bypassEscalationGuard) {
    if (!(await hasRole([HIGHEST_LEVEL_ROLES[0]!], requestingUser))) {
      throw new Error('user:role.onlyOwnerCanGrantOwner');
    }
  }

  /*
   * giving SUPER_ADMIN is OWNER-only too, like taking it away below: a SUPER_ADMIN account that is
   * stolen must not be able to make more of itself, which an e-mail to the owners afterwards only
   * reports once it is done. The owners decided that no employee holds it (they get the `staff` right)
   */
  const isGrantingSuperAdmin = grantedRoleNames.includes(HIGHEST_LEVEL_ROLES[1]!);

  if (isGrantingSuperAdmin && !bypassEscalationGuard) {
    if (!(await hasRole([HIGHEST_LEVEL_ROLES[0]!], requestingUser))) {
      throw new Error('user:role.onlyOwnerCanGrantSuperAdmin');
    }
  }

  /*
   * -------------------------------------------------------//
   * ---------------- last OWNER guard ----------------------//
   * -------------------------------------------------------//
   * never allow removing OWNER from the only account that still holds it — the platform would
   * be left with no owner and no recovery path short of a direct database/master-key edit
   */
  const isRemovingOwner =
    existingRoleNames.includes(HIGHEST_LEVEL_ROLES[0]!) && !roleNames.includes(HIGHEST_LEVEL_ROLES[0]!);

  if (isRemovingOwner) {
    // demoting an OWNER is OWNER-only, like revoking a SUPER_ADMIN just below
    if (!bypassEscalationGuard && !(await hasRole([HIGHEST_LEVEL_ROLES[0]!], requestingUser))) {
      throw new Error('user:role.onlyOwnerCanRevokeOwner');
    }

    if ((await countUsersWithRole(HIGHEST_LEVEL_ROLES[0]!)) <= 1) {
      throw new Error('user:role.lastOwnerCannotBeRemoved');
    }
  }

  /*
   * -------------------------------------------------------//
   * -------- OWNER-only guard: revoking SUPER_ADMIN --------//
   * -------------------------------------------------------//
   * demoting an existing SUPER_ADMIN is OWNER-only, like giving the role: a SUPER_ADMIN must not be
   * able to strip a peer of their powers
   */
  const isRemovingSuperAdmin =
    existingRoleNames.includes(HIGHEST_LEVEL_ROLES[1]!) && !roleNames.includes(HIGHEST_LEVEL_ROLES[1]!);

  if (
    isRemovingSuperAdmin &&
    !bypassEscalationGuard &&
    !(await hasRole([HIGHEST_LEVEL_ROLES[0]!], requestingUser))
  ) {
    throw new Error('user:role.onlyOwnerCanRevokeSuperAdmin');
  }

  // ---- checking new roles ----//
  if (roleNames?.length) {
    for (const roleName of roleNames) {
      const hasNoRole = !existingRolesByUser.length;
      const hasRoleButNotForThisUser =
        existingRolesByUser &&
        !existingRolesByUser.find(
          savedRoleForUser => savedRoleForUser.getName() === roleName
        );

      if (hasNoRole || hasRoleButNotForThisUser) {
        await addOrUpdateRoleForUser(roleName, user);
        await createRoleAuditLog({
          action: 'role_assigned', roleName, targetUserId: user.id, performedBy: requestingUser ?? invitedBy,
        });
      }
    }
  }

  // ---- checking old roles ----//
  if (existingRolesByUser?.length) {
    // we use for.. of not foreach because of async await
    for (const savedRoleForUser of existingRolesByUser) {
      const savedRoleName = savedRoleForUser.getName();

      if (!roleNames.includes(savedRoleName)) {
        /*
         * current saved role should be deleted on user
         * ---- remove old role for user ----//
         */
        await removeRoleKeepingAnOwner(savedRoleForUser, user);
        await createRoleAuditLog({
          action: 'role_removed', roleName: savedRoleName, targetUserId: user.id, performedBy: requestingUser,
        });
      }
    }
  }

  const actor = requestingUser ?? invitedBy;

  await alertOwnersOfElevatedRoles(OwnerAlertEventEnum.ELEVATED_ROLE_GRANTED, grantedRoleNames, user, actor);
  await alertOwnersOfElevatedRoles(OwnerAlertEventEnum.ELEVATED_ROLE_REVOKED, revokedRoleNames, user, actor);
};

/**
 * gives roles to a user without touching the ones they already hold — the whole set is read here,
 * so roles the caller cannot see (OWNER is hidden in the back-office) are kept
 */
export const addRolesToUser = async (
  roleNames: string[],
  user?: User,
  requestingUser?: User
): Promise<void> => {
  const heldRoles = (await getRolesForUser(user)) ?? [];
  const mergedRoleNames = [...new Set([...heldRoles.map((role) => role.getName()), ...roleNames])];

  await updateRoleForUser(mergedRoleNames, user, requestingUser);
};

/**
 * removes only the requested roles from a user — the others are kept
 * @param roleNames - the roles to remove
 */
export const removeRolesForUser = async (
  user: User | undefined,
  performedBy: User | undefined,
  roleNames: string[]
): Promise<void | undefined> => {
  if (!user) {
    throw new Error('User is not found');
  }

  /*
   * -------------------------------------------------------//
   * -------------------- checking roles -------------------//
   * -------------------------------------------------------//
   */
  const heldRoles = await getRolesForUser(user);
  const savedRoles = heldRoles?.filter((role) => roleNames.includes(role.getName()));

  // a highest role, or the `staff` right within its bounds — see updateRoleForUser
  await assertCanDelegateRoles(performedBy, (savedRoles ?? []).map((role) => role.getName()), user);

  // ---- checking old roles ----//
  if (savedRoles?.length) {
    const savedRoleNames = savedRoles.map((savedRole) => savedRole.getName());

    if (savedRoleNames.includes(HIGHEST_LEVEL_ROLES[0]!)) {
      // demoting an OWNER is OWNER-only — see updateRoleForUser
      if (!(await hasRole([HIGHEST_LEVEL_ROLES[0]!], performedBy))) {
        throw new Error('user:role.onlyOwnerCanRevokeOwner');
      }

      // never allow removing OWNER from the only account that still holds it — see updateRoleForUser
      if ((await countUsersWithRole(HIGHEST_LEVEL_ROLES[0]!)) <= 1) {
        throw new Error('user:role.lastOwnerCannotBeRemoved');
      }
    }

    // demoting an existing SUPER_ADMIN is OWNER-only — see updateRoleForUser
    if (
      savedRoleNames.includes(HIGHEST_LEVEL_ROLES[1]!) &&
      !(await hasRole([HIGHEST_LEVEL_ROLES[0]!], performedBy))
    ) {
      throw new Error('user:role.onlyOwnerCanRevokeSuperAdmin');
    }

    // we use for.. of not foreach because of async await
    for (const savedRole of savedRoles) {
      /*
       * current saved role should be deleted on this user
       * ---- remove old role for user ----//
       */
      await removeRoleKeepingAnOwner(savedRole, user);
      await createRoleAuditLog({
        action: 'role_removed', roleName: savedRole.getName(), targetUserId: user.id, performedBy,
      });
    }

    await alertOwnersOfElevatedRoles(
      OwnerAlertEventEnum.ELEVATED_ROLE_REVOKED, savedRoleNames, user, performedBy
    );
  }
};

/**
 * check if user has any role as manager (i.e. holds at least one Parse.Role membership)
 */
export const hasRoleAsManager = async (user?: User): Promise<boolean> => {
  if (!user) {
    throw new Error('Missing user');
  }

  const role = await new Parse.Query(Parse.Role)
    .equalTo('users', user)
    .select(['name'])
    .limit(1)
    .first(USE_MASTER_KEY);

  return !!role;
};

/**
 * Every account holding OWNER or SUPER_ADMIN, for the owners to review who holds the highest powers.
 * Only what the review needs leaves the server: the second factor is a yes or no, never its secret.
 */
export const getHighestRoleAccounts = async (): Promise<IHighestRoleAccount[]> => {
  const roles = await new Parse.Query(Parse.Role)
    .containedIn('name', HIGHEST_LEVEL_ROLES)
    .select(['name'])
    .limit(HIGHEST_LEVEL_ROLES.length)
    .find(USE_MASTER_KEY);
  const accounts = new Map<string, { user: User; roles: string[] }>();

  for (const role of roles) {
    const holders = await role.getUsers().query()
      .select(['firstName', 'lastName', 'email', 'mfa', 'lastLoginAt'])
      .limit(DEFAULT_QUERY_LIMIT)
      .find(USE_MASTER_KEY);

    holders.forEach((holder) => {
      const account = accounts.get(holder.id) ?? { user: holder, roles: [] };

      accounts.set(holder.id, { ...account, roles: [...account.roles, role.getName()] });
    });
  }

  return [...accounts.values()].map(({ user, roles: roleNames }): IHighestRoleAccount => ({
    id: user.id,
    firstName: user.get('firstName'),
    lastName: user.get('lastName'),
    email: user.get('email'),
    roles: roleNames,
    isMfaEnabled: !!user.get('mfa')?.enabled,
    lastLoginAt: user.get('lastLoginAt')?.toISOString(),
  }));
};
