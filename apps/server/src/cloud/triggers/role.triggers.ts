import type { User } from 'parse';

import { DEFAULT_ROLES, HIGHEST_LEVEL_ROLES } from '@/utils/constants';

import { createRole } from '../services/right.service.cloud';
import { getUserRoles, isAdministrator } from '../utils/role.utils.cloud';
import { parseFunction } from '../utils/utils.cloud';

/**
 * After the first creation of the highest level role (Owner),
 * create the other default roles and set their parent roles
 * 1st (highest level) Owner
 * 2nd Administrator
 * 3rd Manager
 */
Parse.Cloud.afterSave(Parse.Role,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const role = request.object;

    // ---- Creation ---- //
    if (!role.existed()) {
      if (HIGHEST_LEVEL_ROLES[0] === (role as Parse.Role).getName()) {
        const secondRole = await createRole(HIGHEST_LEVEL_ROLES[1]!, [role.get('name')]);

        await Promise.all(DEFAULT_ROLES.map((roleName: string) => createRole(roleName, [secondRole.get('name')])));
      }
    }
  })
);

Parse.Cloud.beforeDelete(Parse.Role,
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest): Promise<void | undefined> => {
    const role = request.object;
    const { user } = request;

    if (!user || !role) return;
    // get roles for current user
    const roles = await getUserRoles(user);
    // check if the current user is an admin
    const isAdmin = await isAdministrator(user);
    const currentUserRole = roles?.find((currentRole: any) =>
      currentRole.getName() === (role as Parse.Role).getName()
    );

    // only admin can delete roles
    if (!isAdmin && !currentUserRole) {
      throw new Error('user:role.roleCannotBeDeleted');
    }

    // or if the current user has the right to delete roles
    if (currentUserRole) {
      const rights = currentUserRole.get('rights') || [];
      const classNameObj = rights.find((right: any) => right.className === '_Role');

      // has right to delete roles
      if (!classNameObj.rights.delete) {
        throw new Error('user:role.roleCannotBeDeleted');
      }
    }
  })
);

Parse.Cloud.afterDelete(Parse.Role,
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest): Promise<void> => {
    const role = request.object;

    if (role) {
      await (role as Parse.Role)
        .getUsers()
        .query()
        .each((user: User) => {
          // remove this role from the corresponding user
          (role as Parse.Role).getUsers().remove(user);
        });
    }
  })
);
