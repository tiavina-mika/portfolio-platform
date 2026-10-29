/**
 * set class level permission (CLP) depending on the rights
 * @param {*} roleName
 * @param {*} rights
 */
/*
 * {
 * "find": {
 *      "requiresAuthentication": true,
 *      "role:admin": true
 *  },
 *  "get": {
 *      "requiresAuthentication": true,
 *      "role:admin": true
 *  },
 *  "create": { "role:admin": true },
 *  "update": { "role:admin": true },
 *  "delete": { "role:admin": true }
 * }
 */
export const setCLPFromRights = async (roleName: string, rights: Record<string, any>[]): Promise<void> => {
  for (const right of rights) {
    const clp = {};

    // for each rights operation (ex: read, find, delete, ...)
    for (const operation of Object.keys(right.rights)) {
      const defaultValues: Record<string, any> = {};

      // save only field with true value
      if (right.rights[operation]) {
        defaultValues['role:' + roleName] = right.rights[operation];
      }

      if (['get', 'find'].includes(operation)) {
        defaultValues.requiresAuthentication = true;
      }

      // if the clp is not empty
      if (Object.keys(defaultValues).length > 0) {
        (clp as any)[operation] = defaultValues;
      }
    }

    const schema = new Parse.Schema(right.className);

    schema.setCLP(clp);

    await schema.update();
  }
};
