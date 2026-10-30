import { STAFF_UI_RIGHT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { type IHighestRoleAccount, type IRolesDelegation } from '@/types/user.type';
import {
  addRolesToUserSchema, createRoleSchema, getHighestRoleAccountsSchema, getRolesDelegationSchema,
  removeRolesForUserSchema, roleNamesSchema, updateRoleSchema,
} from '@/validations/_core/role.validations';
import { getRoleAuditLogsSchema } from '@/validations/_core/roleAuditLog.validations';

import { createRole, roleExists, updateRole } from '../../services/_core/right.service.cloud';
import { getRoleAuditLogs } from '../../services/_core/roleAuditLog.service.cloud';
import {
  addRolesToUser, getHighestRoleAccounts, getRolesDelegation, hasRole, removeRolesForUser,
} from '../../services/_core/userRole.service.cloud';
import { assertHasBoRight, checkHighestRole } from '../../utils/_core/role.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';


/**
 * to check if user of request has permission on the BO
 */
Parse.Cloud.define('hasRole',
  parseFunction(async (request: Record<string, any>): Promise<boolean> => {
    const { user } = request; // current user
    const { roleNames } = request.params; // role that can access to the BO
    const hasUserRole = await hasRole(roleNames, user);

    return hasUserRole;
  }),
  // -------- validation -------- //
  parseFunctionValidation(roleNamesSchema)
);

Parse.Cloud.define(
  'addRolesToUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { roleNames, userId } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    await addRolesToUser(roleNames, user, request.user);
  }),
  // -------- validation -------- //
  parseFunctionValidation(addRolesToUserSchema)
);

/**
 * What the caller may do with the posts of an account — why they cannot be changed at all, and which
 * of the posts listed cannot be given — so the screen shows it before the dialog is used. Asked of
 * anybody who can give posts; the server still refuses the change itself.
 */
Parse.Cloud.define(
  'getRolesDelegation',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<IRolesDelegation> => {
    const { userId, roleNames } = request.params;
    const target = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    return getRolesDelegation(request.user, target, roleNames);
  }),
  // -------- validation -------- //
  parseFunctionValidation(getRolesDelegationSchema)
);

Parse.Cloud.define(
  'removeRolesForUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { userId, roleNames } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    await removeRolesForUser(user, request.user, roleNames);
  }),
  // -------- validation -------- //
  parseFunctionValidation(removeRolesForUserSchema)
);

Parse.Cloud.define(
  'createRole',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Role> => {
    // fromBO() throws before reaching here when shouldLogin (default true) and no user is set
    await checkHighestRole(request.user!, request.params.locale);

    const {
      childRoleNames, roleName, rights, ui, translated, sessionTimeoutMinutes, countries,
    } = request.params;

    // the service stays idempotent for the server bootstrap; an admin must be told the name is taken
    if (await roleExists(roleName)) {
      throw new Error('user:role.roleAlreadyExists');
    }

    const newRole = await createRole({
      name: roleName,
      childNames: childRoleNames,
      rights,
      ui,
      translated,
      sessionTimeoutMinutes,
      countries,
      performedBy: request.user,
    });

    return newRole;
  }),
  // -------- validation -------- //
  parseFunctionValidation(createRoleSchema)
);

Parse.Cloud.define(
  'updateRole',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Role> => {
    // fromBO() throws before reaching here when shouldLogin (default true) and no user is set
    await checkHighestRole(request.user!, request.params.locale);

    const {
      childRoleNames, name, rights, ui, translated, sessionTimeoutMinutes, countries,
    } = request.params;

    const updatedRole = await updateRole({
      name,
      childNames: childRoleNames,
      rights,
      ui,
      translated,
      sessionTimeoutMinutes,
      countries,
      performedBy: request.user,
    });

    return updatedRole;
  }),
  // -------- validation -------- //
  parseFunctionValidation(updateRoleSchema)
);

type RoleAuditLogsResult = { results: Parse.Object[]; count: number };

Parse.Cloud.define(
  'getRoleAuditLogs',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<RoleAuditLogsResult> => {
    /*
     * the journal of who gave which post to whom is read by whoever staffs the back-office — the
     * highest roles, or the `staff` right. A collection right on RoleAuditLog cannot stand in for
     * it: the class is always locked, so no role ever holds one that means anything
     */
    await assertHasBoRight(request.user!, STAFF_UI_RIGHT, request.params.locale);

    const {
      limit, skip, orderBy, order, roleName,
    } = request.params;

    return getRoleAuditLogs({
      limit, skip, orderBy, order, roleName,
    });
  }),
  // -------- validation -------- //
  parseFunctionValidation(getRoleAuditLogsSchema)
);

/**
 * The accounts holding OWNER or SUPER_ADMIN, for the owners' periodic review — a highest role only:
 * who holds the highest powers is no business of the rest of the staff.
 */
Parse.Cloud.define(
  'getHighestRoleAccounts',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<IHighestRoleAccount[]> => {
    await checkHighestRole(request.user!, request.params.locale);

    return getHighestRoleAccounts();
  }),
  // -------- validation -------- //
  parseFunctionValidation(getHighestRoleAccountsSchema)
);
