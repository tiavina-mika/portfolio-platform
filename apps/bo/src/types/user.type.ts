import { z } from 'zod';

import { sendEmailSchema } from '@/validations/email.validation';
import { userFilterSchema, usersRouteSearchParams } from '@/validations/user.validation';

import { IQueriesInput } from './app.type';
import { IFileCloud } from './file.type';
import { IRole } from './role.type';

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type UserFiltersInput = z.infer<typeof userFilterSchema>;
export type IUsersRouteSearchParams = z.infer<typeof usersRouteSearchParams>;

export enum SexEnum {

  MALE = 'male',

  FEMALE = 'female'
}

export enum PlatformEnum {

  WEB = 'web',

  BO = 'bo',

  ANDROID = 'android',

  IOS = 'ios'
}
export type IPlatformType = `${PlatformEnum}`;

export interface IPlatform {
  name: PlatformEnum.WEB | PlatformEnum.BO | PlatformEnum.ANDROID | PlatformEnum.IOS;
  count: number;
  lastConnectedAt: string;
}

export type ISex = SexEnum.FEMALE | SexEnum.MALE;

export interface IPhone {
  code: string;
  number: string;
}

export interface IBan {

  bannedBy: IUser;
  bannedAt: string | Date;
  reason?: string;
  until: string | Date;
}
export interface IUserAttributes {
  objectId: string;
  email: string;
  username?: string;
  updatedAt: string;
  createdAt: string;
  deletedAt?: string;
  firstName?: string;
  lastName: string;
  banned?: boolean;
  deleted: boolean;
  verified?: boolean;
  isOnline?: boolean;
  platforms: IPlatform[];
  image?: IFileCloud;
  bans?: IBan[];
  seen?: boolean;
  roles: IRole[];
}

export interface IUser extends Parse.User<IUserAttributes> {
  id: string;
}

export interface IUserState {
  loading: boolean;
  user: IUser | null;
  users: IUser[];
  count: number;
  search: Record<string, any> | null;
  filters: Record<string, string | boolean> | null;
}
export type ProfileUserInfoInput = Pick<IUserAttributes, 'lastName' | 'firstName'>;

export interface IStoredCurrentUser extends Pick<
  IUserAttributes,
  'objectId' | 'firstName' | 'lastName' | 'image'
> {
  email?: string;
}

export interface IUserQueriesInput extends IQueriesInput {
  roles?: string[];
}

export interface IUserCloudInput extends Omit<IUserQueriesInput, 'roles'> {
  ids?: string[];
  fromBO?: boolean;
}

export interface ISendEmailDefaultValues {
  email: string;
}
