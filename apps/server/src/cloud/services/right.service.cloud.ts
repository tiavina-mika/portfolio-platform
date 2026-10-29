import { DEFAULT_ROLES, HIGHEST_LEVEL_ROLES, USE_MASTER_KEY } from '@/utils/constants';

const allDefaultRoles = [...HIGHEST_LEVEL_ROLES, ...DEFAULT_ROLES];

/**
 * create new role with its rights
 * @param user
 * @param parentNames - parent roles
 * @param rights - rights of the role (for each collection)
 * @param ui - tabs or menus in the BO that the role can access
 * @returns {Promise<Parse.Role>}
 */
export const createRole = async (
  name: string,
  parentNames?: string[],
  rights?: any[],
  ui?: string[]
): Promise<Parse.Role> => {
  /*
   * actually we have only one Administrator
   * ---- checking saved role ----//
   */
  const existingRole = await new Parse.Query(Parse.Role).equalTo('name', name).first(USE_MASTER_KEY);

  if (existingRole) {
    return existingRole;
  }

  const administrators = await new Parse.Query(Parse.Role).containedIn('name', allDefaultRoles).find(USE_MASTER_KEY);

  /*
   * ---------------------------//
   * --------- creation --------//
   * ---------------------------//
   * ---- ACL ----//
   */
  const userRoleACL = new Parse.ACL();

  userRoleACL.setPublicReadAccess(true);

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
      for (const role of allDefaultRoles) {
        userRoleACL.setRoleWriteAccess(role, true);
      }
      break;
  }

  // ---- actual creation ----//
  const newRole = new Parse.Role(name, userRoleACL);

  if (!administrators.find((admin: Parse.Role) => admin.get('name') === name)) {
    newRole.getRoles().add(administrators);
  }

  if (parentNames && Array.isArray(parentNames)) {
    await new Parse.Query(Parse.Role)
      .containedIn('name', parentNames)
      .each((savedParentRole) => {
        newRole.getRoles().add(savedParentRole);
      }, USE_MASTER_KEY);
  }

  if (rights) {
    newRole.set('rights', rights);
  }

  if (ui) {
    newRole.set('ui', ui);
  }

  await newRole.save(null, USE_MASTER_KEY);

  return newRole;
};

/**
 * update a role with its right
 * @param name - name of the role
 * @param parentNames - parent roles
 * @param rights - rights of the role (for each collection)
 * @param ui - tabs or menus in the BO that the role can access
 * @returns {Promise<Role>}
 */
export const updateRole = async (
  name: string,
  parentNames?: string[],
  rights?: any[],
  ui?: string[]
): Promise<Parse.Role> => {
  const role = await new Parse.Query(Parse.Role).equalTo('name', name).first(USE_MASTER_KEY);

  if (!role) {
    throw new Error('Role not found');
  }

  if (parentNames && Array.isArray(parentNames)) {
    await new Parse.Query(Parse.Role)
      .containedIn('name', parentNames)
      .each((savedParentRole: Parse.Role) => {
        role.getRoles().add(savedParentRole);
      }, USE_MASTER_KEY);
  }

  if (rights) {
    role.set('rights', rights);
  }

  if (ui) {
    role.set('ui', ui);
  }

  await role.save(null, USE_MASTER_KEY);

  return role;
};

// TODO: not used anywhere, remove?
export const createDefaultRoles = async (): Promise<Parse.Role[]> => {
  const firstRole = await createRole(HIGHEST_LEVEL_ROLES[0]!);
  const secondRole = await createRole(HIGHEST_LEVEL_ROLES[1]!, [firstRole.get('name')]);
  const allRoles = await Promise.all(DEFAULT_ROLES.map((roleName: string) => createRole(roleName, [secondRole.get('name')])));

  return [firstRole, secondRole, ...allRoles];
};
