import { string, object, array } from 'zod';

export const RoleNamesSchema = object({
  roleNames: array(string().optional()),
});

export const AddOrUpdateRolesToUserSchema = RoleNamesSchema.extend({
  roleNames: array(string().optional()),
});
