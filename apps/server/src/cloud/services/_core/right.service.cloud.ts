import { ROLE_SESSION_TIMEOUT_MAX_MINUTES, ROLE_SESSION_TIMEOUT_MIN_MINUTES } from '@shared/constants';
import isEqual from 'lodash/isEqual.js';

import type { Locale } from '@/types/app.type';
import type { Role, User } from 'parse';


import {
  DEFAULT_QUERY_LIMIT, DEFAULT_ROLES, HIGHEST_LEVEL_ROLES, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  DEFAULT_ROLE_RIGHTS, DEFAULT_ROLE_TRANSLATED_LABELS, DEFAULT_ROLE_UI,
} from '@/constants/_core/role.constants';
import { logger } from '@/utils/_core/logger';
import { getChangedRightsClassNames } from '@/utils/_core/rights.utils';
import { getTranslatedField } from '@/utils/_core/utils';

import { createRoleAuditLog } from './roleAuditLog.service.cloud';
import { rebuildCLPForClasses } from './security.service.cloud';
import { clearAllowedCountriesCache } from '../../triggers/_core/country-scope.triggers';
import { isOwner } from '../../utils/_core/role.utils.cloud';

/**
 * fetches the display label for each role name in the given locale, falling back to the raw
 * role name for roles saved before the "translated" field existed — mirrors getRoleLabel in
 * apps/bo/src/containers/_core/roles/RoleForUserForm.tsx
 */
export const getRoleLabels = async (roleNames: string[], locale: Locale): Promise<string[]> => {
  const roles = await new Parse.Query(Parse.Role)
    .containedIn('name', roleNames)
    .select(['name', 'translated'])
    .find(USE_MASTER_KEY);

  return roles.map((role) => {
    const translated = role.get('translated');

    return translated ? getTranslatedField(translated, locale, 'label') : role.get('name');
  });
};

/** whether a role with this exact name is already stored */
export const roleExists = async (name: string): Promise<boolean> => {
  const role = await new Parse.Query(Parse.Role)
    .equalTo('name', name)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  return !!role;
};

type CreateRoleParams = {
  name: string;
  childNames?: string[];
  rights?: any[];
  ui?: string[];
  translated?: Record<string, { label?: string }>;
  sessionTimeoutMinutes?: number | null;
  /** the countries the role covers, none for every country */
  countries?: string[];
  performedBy?: User;
};

/**
 * writes the role's own back-office inactivity timeout: `null` unsets it (the BO then falls back
 * to its default), `undefined` leaves the stored value untouched. Clamped again here because a
 * value can also reach the database outside this cloud function (migration, direct write) and the
 * BO must never receive an out-of-range timeout
 */
const setSessionTimeoutMinutes = (role: Role, sessionTimeoutMinutes?: number | null): void => {
  if (sessionTimeoutMinutes === undefined) return;

  if (sessionTimeoutMinutes === null) {
    role.unset('sessionTimeoutMinutes');
    return;
  }

  const clamped = Math.min(
    Math.max(sessionTimeoutMinutes, ROLE_SESSION_TIMEOUT_MIN_MINUTES),
    ROLE_SESSION_TIMEOUT_MAX_MINUTES
  );

  role.set('sessionTimeoutMinutes', clamped);
};

/**
 * create new role with its rights
 * @param name - name of the role
 * @param childNames - roles that inherit this role's privileges
 * @param rights - rights of the role (for each collection)
 * @param ui - tabs or menus in the BO that the role can access
 * @param translated - translated label per locale (ex: { fr: { label: 'Manager' } })
 * @param sessionTimeoutMinutes - BO inactivity timeout for this role, null/undefined = BO default
 * @param performedBy - the BO user who created the role, for the audit trail
 * @returns {Promise<Role>}
 */
export const createRole = async ({
  name, childNames, rights, ui, translated, sessionTimeoutMinutes, countries, performedBy,
}: CreateRoleParams): Promise<Role> => {
  /*
   * actually we have only one Owner and one Super Admin
   * ---- checking saved role ----//
   */
  const existingRole = await new Parse.Query(Parse.Role).equalTo('name', name).first(USE_MASTER_KEY);

  if (existingRole) {
    return existingRole;
  }

  /*
   * only the highest roles are made children of a new role: a child inherits the CLP of its parent,
   * so listing MANAGER or SUPPORT_VIEWER here (as this once did) handed every member of those default
   * roles the raw-SDK rights of every role created after them
   */
  const administrators = await new Parse.Query(Parse.Role)
    .containedIn('name', HIGHEST_LEVEL_ROLES)
    .limit(HIGHEST_LEVEL_ROLES.length)
    .find(USE_MASTER_KEY);

  /*
   * ---------------------------//
   * --------- creation --------//
   * ---------------------------//
   * ---- ACL ----//
   */
  const userRoleACL = new Parse.ACL();

  userRoleACL.setPublicReadAccess(false);
  // All highest-level admins can read any role; role members are implicitly granted read by Parse
  for (const admin of HIGHEST_LEVEL_ROLES) {
    userRoleACL.setRoleReadAccess(admin, true);
  }
  userRoleACL.setRoleReadAccess(name, true);

  switch (name) {
    case HIGHEST_LEVEL_ROLES[0]:
      userRoleACL.setRoleWriteAccess(name, true);
      break;
    case HIGHEST_LEVEL_ROLES[1]:
      for (const admin of HIGHEST_LEVEL_ROLES) {
        userRoleACL.setRoleWriteAccess(admin, true);
      }
      break;
    default:
      // a role is only ever written by the services (master key): a session never needs write access
      for (const role of HIGHEST_LEVEL_ROLES) {
        userRoleACL.setRoleWriteAccess(role, true);
      }
      break;
  }

  // ---- actual creation ----//
  const newRole = new Parse.Role(name, userRoleACL);

  if (!administrators.find((admin: Parse.Role) => admin.get('name') === name)) {
    newRole.getRoles().add(administrators);
  }

  if (childNames && Array.isArray(childNames)) {
    await new Parse.Query(Parse.Role)
      .containedIn('name', childNames)
      .each((child) => {
        newRole.getRoles().add(child);
      }, USE_MASTER_KEY);
  }

  if (rights) {
    newRole.set('rights', rights);
  }

  if (ui) {
    newRole.set('ui', ui);
  }

  if (translated) {
    newRole.set('translated', translated);
  }

  setSessionTimeoutMinutes(newRole, sessionTimeoutMinutes);

  if (countries?.length) {
    newRole.set('countries', countries);
  }

  await newRole.save(null, USE_MASTER_KEY);

  if (rights) {
    await rebuildCLPForClasses(rights.map((r: any) => r.className));
  }

  await createRoleAuditLog({
    action: 'role_created', roleName: name, performedBy, rightsAfter: rights, uiAfter: ui,
  });

  return newRole;
};

/**
 * creates one of the DEFAULT_ROLES with its labels, rights and screens, as a child of SUPER_ADMIN —
 * shared by the bootstrap of a new platform and the start-up check of a running one
 */
export const createDefaultRole = async (name: string): Promise<Role> => createRole({
  name,
  childNames: [HIGHEST_LEVEL_ROLES[1]!],
  translated: DEFAULT_ROLE_TRANSLATED_LABELS[name],
  rights: DEFAULT_ROLE_RIGHTS[name],
  ui: DEFAULT_ROLE_UI[name],
});

/**
 * Creates the default roles a running platform does not have yet. The bootstrap trigger only runs when
 * the OWNER role is first created, so a default role added to the code later (TEAM_LEAD) would never
 * reach a database that already exists. A platform not bootstrapped yet is left to the trigger.
 */
export const ensureDefaultRolesExist = async (): Promise<void> => {
  if (!(await roleExists(HIGHEST_LEVEL_ROLES[1]!))) return;

  for (const name of DEFAULT_ROLES) {
    if (await roleExists(name)) continue;

    await createDefaultRole(name);
    logger.info(`[bootstrapAdmin] default role ${name} created`);
  }
};

/**
 * makes the given roles the only (non-highest) children of a role. The highest roles stay children
 * of every role (see createRole) and the form never lists them, so they are never removed here.
 * @returns whether the stored hierarchy changed
 */
const replaceChildRoles = async (role: Role, childNames?: string[]): Promise<boolean> => {
  if (!childNames || !Array.isArray(childNames)) return false;

  const currentChildren = await role.getRoles().query()
    .select(['name'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);
  const currentNames = currentChildren.map((child: Role) => child.getName());
  const removedChildren = currentChildren.filter((child: Role) =>
    !childNames.includes(child.getName()) && !HIGHEST_LEVEL_ROLES.includes(child.getName()));
  const addedNames = childNames.filter((childName) => !currentNames.includes(childName));

  if (!removedChildren.length && !addedNames.length) return false;

  role.getRoles().remove(removedChildren);

  if (addedNames.length) {
    await new Parse.Query(Parse.Role)
      .containedIn('name', addedNames)
      .each((child: Role) => {
        role.getRoles().add(child);
      }, USE_MASTER_KEY);
  }

  return true;
};

/** whether the labels or the inactivity timeout sent differ from what the role stores */
const hasChangedLabelsOrTimeout = (
  role: Role,
  translated?: Record<string, { label?: string }>,
  sessionTimeoutMinutes?: number | null
): boolean => {
  const hasChangedLabels = !!translated && !isEqual(translated, role.get('translated'));
  const hasChangedTimeout = sessionTimeoutMinutes !== undefined &&
    (sessionTimeoutMinutes ?? undefined) !== role.get('sessionTimeoutMinutes');

  return hasChangedLabels || hasChangedTimeout;
};

type UpdateRoleParams = {
  name: string;
  childNames?: string[];
  rights?: any[];
  ui?: string[];
  translated?: Record<string, { label?: string }>;
  sessionTimeoutMinutes?: number | null;
  /** the countries the role covers, none for every country */
  countries?: string[];
  performedBy?: User;
};

/**
 * update a role with its right
 * @param name - name of the role
 * @param childNames - the roles that inherit this role's privileges: replaces the stored list
 * @param rights - rights of the role (for each collection)
 * @param ui - tabs or menus in the BO that the role can access
 * @param translated - translated label per locale (ex: { fr: { label: 'Manager' } })
 * @param sessionTimeoutMinutes - BO inactivity timeout for this role, null clears it back to default
 * @param performedBy - the BO user who updated the role, for the audit trail
 * @returns {Promise<Role>}
 */
export const updateRole = async ({
  name, childNames, rights, ui, translated, sessionTimeoutMinutes, countries, performedBy,
}: UpdateRoleParams): Promise<Role> => {
  // the ACL of OWNER / SUPER_ADMIN does not stop the master key used below, so the rule lives here
  if (HIGHEST_LEVEL_ROLES.includes(name) && !(await isOwner(performedBy!))) {
    throw new Error('Unauthorized to do this action');
  }

  const role = await new Parse.Query(Parse.Role).equalTo('name', name).first(USE_MASTER_KEY);

  if (!role) {
    throw new Error('Role not found');
  }

  const rightsBefore = role.get('rights');
  const uiBefore = role.get('ui');
  const hasChangedAppearance = hasChangedLabelsOrTimeout(role, translated, sessionTimeoutMinutes) ||
    (!!countries && !isEqual([...countries].sort(), [...(role.get('countries') ?? [])].sort()));
  const hasChangedHierarchy = await replaceChildRoles(role, childNames);

  if (rights) {
    role.set('rights', rights);
  }

  if (ui) {
    role.set('ui', ui);
  }

  if (translated) {
    role.set('translated', translated);
  }

  setSessionTimeoutMinutes(role, sessionTimeoutMinutes);

  // an empty list takes the limit off: the role covers every country again
  if (countries) {
    role.set('countries', countries);
  }

  await role.save(null, USE_MASTER_KEY);

  // sessions already open must not keep the countries the role covered a moment ago
  clearAllowedCountriesCache();

  // only the classes whose rights really changed: a rebuild is one schema update per class
  const changedClassNames = rights ? getChangedRightsClassNames(rightsBefore, rights) : [];

  if (changedClassNames.length) {
    await rebuildCLPForClasses(changedClassNames);
  }

  if (rights || ui) {
    await createRoleAuditLog({
      action: 'role_rights_updated', roleName: name, performedBy, rightsBefore, rightsAfter: rights, uiBefore, uiAfter: ui,
    });
  }

  if (hasChangedHierarchy || hasChangedAppearance) {
    await createRoleAuditLog({ action: 'role_updated', roleName: name, performedBy });
  }

  return role;
};
