
import {
  BanReasonEnum, BanTypeEnum, EmergencyContact, NotificationPreferences, PlatformEnum, SexEnum,
  UserStats, UserSuspension,
} from '@shared/types';
import { z } from 'zod';


import type { IQueriesInput } from '@/types/_core/app.type';
import type { DateType, IUserDefaultRecord } from '@/types/_core/utils.type';

import { USER_MESSAGE_TEMPLATE_KEYS } from '@/constants/_core/user.constants';
import { IFileCloud } from '@/types/_core/file.type';
import { IRole } from '@/types/_core/role.type';
import { sendMessageFormSchema, sendMessageSchema } from '@/validations/_core/email.validations';
import {
  accountHelpReasonFormSchema, banUserFormSchema, changeMemberContactFormSchema,
  changeMemberCountryFormSchema, userFilterSchema, usersRouteSearchParams,
} from '@/validations/_core/user.validations';


export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SendMessageFormInput = z.infer<typeof sendMessageFormSchema>;
export type UserMessageTemplateKey = typeof USER_MESSAGE_TEMPLATE_KEYS[number];
export type UserFiltersInput = z.infer<typeof userFilterSchema>;
export type IUsersRouteSearchParams = z.infer<typeof usersRouteSearchParams>;
export type BanUserInput = z.infer<typeof banUserFormSchema>;
export type AccountHelpReasonInput = z.infer<typeof accountHelpReasonFormSchema>;
export type ChangeMemberContactFormInput = z.infer<typeof changeMemberContactFormSchema>;
export type ChangeMemberCountryFormInput = z.infer<typeof changeMemberCountryFormSchema>;

export type IPlatformType = `${PlatformEnum}`;

/*
 * the pages the user detail page is read by: who the member is, how they reach the account, what
 * they did on the platform, what the team did about them, what was exchanged with them, and who
 * read or acted on the record
 */
export type UserSectionGroup = 'profile' | 'access' | 'activity' | 'moderation' | 'exchanges' | 'history';

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

// who acted on a ban, as they were named when they did — kept on the entry, not read from the account
export interface IBanActor {
  id: string;
  name: string;
}

/*
 * the author and the lift were only recorded from the ban traceability change on: an older entry
 * has neither, and nothing tells a lifted one from one that ran out
 */
export interface IBan {
  bannedBy?: IBanActor;
  bannedAt?: string | Date;
  type: `${BanTypeEnum}`;
  reason: `${BanReasonEnum}`;
  reasonDetails?: string;
  until?: string | Date;
  notifiedAt?: string | Date;
  // set when the ban stops before its end, by hand (with its author) or by the expiry job (without)
  liftedAt?: string | Date;
  liftedBy?: IBanActor;
}
export interface IUserAttributes extends IUserDefaultRecord {
  id: string;
  objectId: string;
  // absent for a member who signed up by phone: such an account has no email at all
  email?: string;
  username?: string;
  firstName?: string;
  // empty while a sign-up is still going: the name is asked after the phone number is confirmed
  lastName: string;
  phone: IPhone;
  banned?: boolean;
  /*
   * The suspension in force: its end date, what applied it, and the moderator's wording if any.
   * Written together with `isSuspendedUntil`, which every query and permission check still reads.
   */
  suspension?: UserSuspension;
  deleted: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  /** ISO 3166-1 alpha-2 code of the country whose rules apply to the account, set by the server at sign-up */
  country?: string;
  isOnline?: boolean;
  // set by the server on every sign-in: absent on an account that predates it and has not signed in since
  lastLoginAt?: DateType;
  // date until which a policy or a report keeps the account suspended, absent on a free account
  isSuspendedUntil?: DateType;
  platforms: IPlatform[];
  image?: IFileCloud;
  bans?: IBan[];
  roles: IRole[];
  aboutMe?: string;
  birthday?: DateType;
  address?: IAddress;
  sex?: ISex;
  rating?: number;
  stats?: UserStats;
  registerStep?: string;
  sexChangeCount?: number;
  lastSexChangeAt?: DateType;
  birthdayChangeCount?: number;
  lastBirthdayChangeAt?: DateType;
  paymentPhones?: IPhone[];
  /** Who support calls if a trip goes wrong — set by the member from the app, read-only here. */
  emergencyContact?: EmergencyContact;
  /**
   * What the member chose to receive, set from their app and read-only here. A missing key means
   * "on", and so does a member who never opened the settings: the field is absent on old accounts.
   */
  notificationPreferences?: NotificationPreferences;
  spokenLanguages?: string[];
  deletionReason?: string;
  mfa?: IMfa;
}

export interface IMfa {
  enabled: boolean;
  enabledAt?: DateType;
  // wrong codes locked the second factor for a while (see getUserDetailsById)
  isLocked?: boolean;
}

export type IUser = IUserAttributes;

export interface IUserState {
  loading: boolean;
  user: IUser | null;
  users: IUser[];
  count: number;
  search: Record<string, any> | null;
  filters: Record<string, string | boolean> | null;
}
export type ProfileUserInfoInput = Pick<IUserAttributes, 'lastName' | 'firstName'>;

export type UserSnapshot = Pick<IUserAttributes, 'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'image' | 'rating'>;
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

interface ILatLng {
  latitude: number;
  longitude: number;
}
export interface IAddress {
  placeId: string;
  name: string;
  district?: string;
  region?: string;
  country: string;
  countryCode: string;
  city?: string;
  location: ILatLng;
}
