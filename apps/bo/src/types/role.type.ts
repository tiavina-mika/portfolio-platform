import { z } from 'zod';

import { roleSchema, rolesForUserSchema } from '@/validations/role.validations';

export type IRoleInput = z.infer<typeof roleSchema>;
export type RolesForUserInput = z.infer<typeof rolesForUserSchema>;

export interface IRights {
  create: boolean;
  find: boolean;
  get: boolean;
  update: boolean;
  delete: boolean;
  destroy: boolean;
}

export interface IHasRights {
  canPreview: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canFind: boolean;
  canEdit: boolean;
  canDestroy: boolean;
}

export type IRoleAction = keyof IRights;

export interface IRightsItem {
  label?: string;
  className: string;
  rights: IRights;
}

export interface IRoleAttributes {
  objectId: string;
  name: string;
  updatedAt?: string;
  createdAt?: string;
  rights: IRightsItem[];
  ui: string[];
  children: IRole;
}

export interface IRole extends Parse.Role<IRoleAttributes> {
  id: string;
}

export interface IRoleState {
  loading: boolean;
  role: IRole | null;
  roles: IRole[];
  userRoles: IRole[];
  currentUserRoles: IRole[];
  isAdmin: boolean;
}

export interface ILoadRolesInput {
  limit: number;
  skip: number;
  withAdminOrBetter: boolean;
  withUsersCount: boolean;
  incrementItems: boolean;
  selects: string[];
}

// add new ui role here
export enum UIRoleEnum {
  MISCELLANEOUS = 'miscellaneous',
  TESTS = 'tests'
}

export type UIRole = `${UIRoleEnum}`;
