import type { DBRights, Locale } from '@/types/app.type';
import type { IMfa } from '@/types/auth.type';
import type { Role, User } from 'parse';


import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { ENFORCE_HIGHEST_ROLES_MFA, HIGHEST_LEVEL_ROLES } from '@/constants/_core/constants';
import { mergeRoleCountries } from '@/utils/_core/rights.utils';

import {
  getRolesForUser, getRolesForUserByEntity, hasRole, hasRoleAsManager,
} from '../../services/_core/userRole.service.cloud';

const RIGHTS: DBRights[] = ['create', 'update', 'get', 'find', 'delete', 'destroy'];

export const isRequestFromManager = async (request: Record<string, any>): Promise<boolean> => {
  const hasUserManagerRole = await hasRoleAsManager(request.user);

  return request.master || hasUserManagerRole;
};

/**
 * whether the account holds one of the highest roles — OWNER or SUPER_ADMIN, both of them: a check
 * meant for the OWNER alone goes through `isOwner`
 * @param user
 * @returns {Promise.<boolean>}
 */
export const isHighestRole = async (user: User): Promise<boolean> => hasRole(HIGHEST_LEVEL_ROLES, user);

export const getUserRoles = async (user: User): Promise<Role[] | null> => {
  if (!user) return null;

  const roles = await getRolesForUser(user);

  return roles;
};

/**
 * @param user
 * @returns {Promise.<boolean>}
 */
export const isOwner = async (user: User): Promise<boolean> => {
  const isUserOwner = await hasRole([HIGHEST_LEVEL_ROLES[0]!], user);

  return isUserOwner;
};

/**
 * The countries a back-office user may work on, or `null` when nothing limits them. A role lists
 * the countries it covers; an empty list is a role for every country. Like rights, the roles of a
 * user add up: the countries are the union of their roles', and one role without a limit lifts it.
 * The highest roles are never limited, and neither is an account holding no role at all (a member).
 */
export const getAllowedCountryCodes = async (user?: User): Promise<string[] | null> => {
  if (!user) return null;
  if (await isHighestRole(user)) return null;

  const roles = await getRolesForUser(user);

  return mergeRoleCountries((roles ?? []).map((role: Role) => ({ countries: role.get('countries') })));
};

/**
 * whether the given roles grant every operation on a collection
 * @NOTE the rights of the roles add up, like the BO client's `canAccessTo()` and Parse's CLP: each
 * requested operation is granted as soon as one role grants it, so giving a role never takes a right
 * away. A user with role A (`find` only) and role B (`delete` only) on the same collection passes
 * `rolesGrantRight([A, B], class, ['find', 'delete'])`.
 *
 * Synchronous on purpose: nothing in the body awaits anything (an earlier version drove it through
 * `async`'s `eachOfLimit` with a synchronous iteratee, whose callback was never called, so every call
 * reaching this branch hung forever). A role with no entry for this class grants nothing rather than
 * throwing on `.rights`.
 * @param roles the roles of the account — not the highest ones, which grant everything
 * @param className
 * @param operations
 */
export const rolesGrantRight = (roles: Role[], className: string, operations = RIGHTS): boolean => (
  operations.every((operation) => roles.some((role: Role) => {
    const roleForClassName = (role.get('rights') ?? []).find((right: any) => right.className === className);

    return !!roleForClassName?.rights?.[operation];
  }))
);

/**
 * check if the user has the right to do something
 * @param user
 * @returns {Promise<boolean>}
 */
export const hasRight = async (user: User, className: string, operations = RIGHTS): Promise<boolean> => {
  // ------- admin and owner ------- //
  const hasFullRight = await isHighestRole(user);

  if (hasFullRight) {
    return true;
  }

  // ------ other roles ------ //
  const roles = await getRolesForUserByEntity(className, user);

  if (!roles?.length) return false;

  return rolesGrantRight(roles, className, operations);
};

/**
 * `hasRight` for a function whose class is only known at call time (it comes from the params), where
 * `fromBO(fn, rights, className)` cannot be given the class up front
 * @param user
 * @param className
 * @param operations
 * @param locale
 */
export const assertHasRight = async (
  user: User,
  className: string,
  operations: DBRights[],
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  if (!(await hasRight(user, className, operations))) {
    throw new Error(translate('error.unauthorizedToDoThisAction', locale));
  }
};

/**
 * whether one of the account's roles carries a BO-only "ui" right — the highest roles always do
 * @param user
 * @param uiRight
 */
export const hasBoRight = async (user: User, uiRight: string): Promise<boolean> => {
  if (await isHighestRole(user)) return true;

  const roles = await getRolesForUser(user);

  return !!roles?.some((role) => (role.get('ui') || []).includes(uiRight));
};

/**
 * checks a BO-only "ui" right (tab/menu/action access, distinct from per-collection DB rights)
 * @NOTE mirrors `canAccessTo(roles, undefined, undefined, uiRight)` on the BO client
 * (apps/bo/src/utils/_core/role.utils.ts) — never trust the client-side check alone for a
 * sensitive UI right such as impersonation: the interface check only hides a button, so the server
 * must refuse the action itself
 * @param user
 * @param uiRight
 * @param locale
 */
export const assertHasBoRight = async (
  user: User,
  uiRight: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  if (!(await hasBoRight(user, uiRight))) {
    throw new Error(translate('error.unauthorizedToDoThisAction', locale));
  }
};

/**
 * Refuses the caller unless they hold one of the highest roles — OWNER or SUPER_ADMIN, both of them.
 * @param user
 * @param locale language of the refusal message
 * @returns {Promise.<void>}
 */
export const checkHighestRole = async (user: User, locale: Locale = DEFAULT_LANGUAGE): Promise<void> => {
  if (!(await isHighestRole(user))) {
    throw new Error(translate('error.unauthorizedToDoThisAction', locale));
  }
};

/**
 * Refuses an account action taken from the back-office (signing out its devices, banning it) on a
 * user who holds one of the highest roles, unless the admin holds one too. The `update` right on
 * users is enough to reach these actions, and it must not be enough to lock the owners out of the
 * platform.
 * @param actor the back-office user taking the action
 * @param target the account the action is taken on
 * @param locale language of the refusal message
 */
export const assertCanActOnUser = async (
  actor: User,
  target: User,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  if (!(await isHighestRole(target))) return;
  if (await isHighestRole(actor)) return;

  throw new Error(translate('error.cannotActOnHigherRole', locale));
};

/**
 * Stricter than `checkHighestRole` — only the `OWNER` role passes, `SUPER_ADMIN` is rejected.
 * Reserved for actions where a compromised SUPER_ADMIN account must not be able to act on another
 * admin's account (e.g. `adminResetMfa`).
 * @param user
 * @param locale language of the refusal message
 * @returns {Promise.<void>}
 */
export const checkOwner = async (user: User, locale: Locale = DEFAULT_LANGUAGE): Promise<void> => {
  if (!(await isOwner(user))) {
    throw new Error(translate('error.unauthorizedToDoThisAction', locale));
  }
};

export const createSecurityError = (message: string): any => {
  // see http://docs.parseplatform.org/js/guide/#error-codes
  return new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, message);
};

/**
 * Refuses the back-office functions to an OWNER / SUPER_ADMIN who has not enabled MFA: the banner
 * in the back-office only hides the screens, a stolen password could still call every function
 * directly. Enrolling an authenticator stays possible — those functions are not back-office ones —
 * so the refusal never locks anybody out.
 */
export const assertMfaEnabledForHighestRoles = async (user: User): Promise<void> => {
  if (!ENFORCE_HIGHEST_ROLES_MFA) return;
  if ((user.get('mfa') as IMfa | undefined)?.enabled) return;
  if (!(await isHighestRole(user))) return;

  throw createSecurityError(JSON.stringify({ code: 'MFA_ENROLLMENT_REQUIRED' }));
};
