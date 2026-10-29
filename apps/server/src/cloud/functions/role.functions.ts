
import { USE_MASTER_KEY } from '@/utils/constants';
import { UserIdSchema } from '@/validations/auth.validation';
import { AddOrUpdateRolesToUserSchema, RoleNamesSchema } from '@/validations/role.validation';

import { createRole, updateRole } from '../services/right.service.cloud';
import { hasRole, removeRolesForUser, updateRoleForUser } from '../services/userRole.service.cloud';
import { fromBO, parseFunction, parseFunctionValidation } from '../utils/utils.cloud';

Parse.Cloud.define(
  'getUserRoles',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Role[]> => {
    let { user } = request;
    const { userId } = request.params;

    if (userId) {
      user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);
    }

    const roles = await new Parse.Query(Parse.Role).equalTo('users', user).find();

    return roles;
  }),
  // -------- validation -------- //
  parseFunctionValidation(UserIdSchema)
);

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
  parseFunctionValidation(RoleNamesSchema)
);

Parse.Cloud.define(
  'addOrUpdateRolesToUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { roleNames, userId } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    await updateRoleForUser(roleNames, user);
  }),
  // -------- validation -------- //
  parseFunctionValidation(AddOrUpdateRolesToUserSchema)
);

Parse.Cloud.define(
  'removeRolesForUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { userId } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    await removeRolesForUser(user);
  }),
  // -------- validation -------- //
  parseFunctionValidation(UserIdSchema)
);

Parse.Cloud.define(
  'createRole',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Role> => {
    const {
      parentRoleNames, roleName, rights, ui,
    } = request.params;
    const newRole = await createRole(roleName, parentRoleNames, rights, ui);

    return newRole;
  })
);

Parse.Cloud.define(
  'updateRole',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Role> => {
    const {
      parentRoleNames, name, rights, ui,
    } = request.params;

    const updatedRole = await updateRole(name, parentRoleNames, rights, ui);

    return updatedRole;
  })
);
