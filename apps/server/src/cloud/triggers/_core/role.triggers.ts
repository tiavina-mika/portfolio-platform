import type { Role, User } from 'parse';

import { DEFAULT_ROLES, HIGHEST_LEVEL_ROLES, USE_MASTER_KEY } from '@/constants/_core/constants';
import { DEFAULT_ROLE_TRANSLATED_LABELS } from '@/constants/_core/role.constants';

import { createDefaultRole, createRole } from '../../services/_core/right.service.cloud';
import { createRoleAuditLog } from '../../services/_core/roleAuditLog.service.cloud';
import { rebuildCLPForClasses } from '../../services/_core/security.service.cloud';
import { getUserRoles, isHighestRole } from '../../utils/_core/role.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

/**
 * After the first creation of the highest level role (Owner),
 * create the other default roles and set their parent roles
 * 1st (highest level) OWNER
 * 2nd SUPER_ADMIN
 * 3rd+ DEFAULT_ROLES (MANAGER, SUPPORT_VIEWER, TEAM_LEAD), each a child of SUPER_ADMIN
 */
Parse.Cloud.afterSave(Parse.Role,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const role = request.object;

    // ---- Creation ---- //
    if (!role.existed()) {
      if (HIGHEST_LEVEL_ROLES[0] === (role as Parse.Role).getName()) {
        await createRole({
          name: HIGHEST_LEVEL_ROLES[1]!,
          childNames: [role.get('name')],
          translated: DEFAULT_ROLE_TRANSLATED_LABELS[HIGHEST_LEVEL_ROLES[1]!],
        });

        await Promise.all(DEFAULT_ROLES.map((roleName: string) => createDefaultRole(roleName)));
      }
    }
  })
);

/**
 * a role is only ever written by the cloud functions and services (master key): membership,
 * hierarchy, rights and menus decide who can do what, so no session may write one — whatever the
 * role's ACL says. The guards on who may grant or revoke a role live in those services.
 */
Parse.Cloud.beforeSave(Parse.Role,
  parseFunction((request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    if (request.master) return Promise.resolve();

    return Promise.reject(new Error('user:role.rolesAreManagedByTheServer'));
  })
);

Parse.Cloud.beforeDelete(Parse.Role,
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest): Promise<void | undefined> => {
    const role = request.object;
    const { user } = request;

    if (!role) return;

    /*
     * the OWNER role object is the structural root of the hierarchy (SUPER_ADMIN/MANAGER are
     * bootstrapped as its descendants) and represents platform ownership, not an operational
     * account — deleting it would silently strip OWNER from every user holding it in one shot,
     * bypassing the per-user "last owner" guard in updateRoleForUser/removeRolesForUser.
     * Checked unconditionally (even for a master-key-only call with no `user`, unlike the
     * checks below) since a trusted-caller bypass is exactly the accidental-deletion scenario
     * this guards against.
     */
    if ((role as Parse.Role).getName() === HIGHEST_LEVEL_ROLES[0]) {
      throw new Error('user:role.ownerRoleCannotBeDeleted');
    }

    if (!user) return;

    const roleName = (role as Parse.Role).getName();

    /*
     * structural roles are never removable from a session: deleting SUPER_ADMIN would strip every
     * super administrator at once, bypassing the OWNER-only revocation rule
     */
    if (HIGHEST_LEVEL_ROLES.includes(roleName) || DEFAULT_ROLES.includes(roleName)) {
      throw new Error('user:role.roleCannotBeDeleted');
    }

    // get roles for current user
    const roles = await getUserRoles(user);
    // check if the current user is an admin
    const isAdmin = await isHighestRole(user);
    // any role of the caller may carry the delete right on roles, not only the role being deleted
    const hasDeleteRight = !!roles?.some((currentRole: Role) =>
      (currentRole.get('rights') ?? []).some(
        (right: { className: string; rights?: { delete?: boolean } }) =>
          right.className === '_Role' && right.rights?.delete
      ));

    // only admin, or a role with the right to delete roles, can delete roles
    if (!isAdmin && !hasDeleteRight) {
      throw new Error('user:role.roleCannotBeDeleted');
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
        }, USE_MASTER_KEY);

      /*
       * without this, rights granted by the deleted role stay active in the CLP layer (raw SDK
       * client calls) until the next server restart — role.get('rights') is still populated on
       * a beforeDelete/afterDelete object, only the class-level permissions computed from it go
       * stale
       */
      const rights = (role as Parse.Role).get('rights') || [];
      const classNames = rights
        .map((right: { className?: string }) => right.className)
        .filter(Boolean) as string[];

      if (classNames.length) {
        await rebuildCLPForClasses(classNames);
      }

      await createRoleAuditLog({
        action: 'role_deleted',
        roleName: (role as Parse.Role).getName(),
        performedBy: request.user,
      });
    }
  })
);
