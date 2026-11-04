import { BanReasonEnum, BanTypeEnum } from '@shared/types';

export enum RegisterStepEnum {
  AUTH = 'AUTH',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  VERIFY_PHONE = 'VERIFY_PHONE',
  INFOS = 'INFOS',
  PROFILE = 'PROFILE'
}

export type Phone = {
  code: string;
  number: string;
};

export type BanReason = `${BanReasonEnum}`;

export type BanType = `${BanTypeEnum}`;

/**
 * Who acted on an account, snapshotted at the time of the action: the name stays readable in the
 * ban history even once that administrator's account is renamed or deleted.
 */
export type ActorSnapshot = {
  id: string;
  name: string;
};

/**
 * One entry of `_User.bans`. Entries written before the ban history was traced carry neither
 * `liftedAt` nor `liftedBy` (and `bannedBy` as a bare user pointer); they are not backfilled.
 */
export interface IBan {
  bannedAt: Date;
  bannedBy?: ActorSnapshot;
  type: BanType;
  reason: BanReason;
  reasonDetails?: string;
  until?: Date;
  notifiedAt?: Date;
  /** set when the ban stops: by an administrator (`liftedBy` set) or by its own expiry (no `liftedBy`) */
  liftedAt?: Date;
  liftedBy?: ActorSnapshot;
}

/** What a `UserModerationLog` row records — one moderation decision on an account. */
export enum UserModerationActionEnum {
  BANNED = 'banned',
  BAN_LIFTED = 'ban_lifted',
  BAN_EXPIRED = 'ban_expired',
  SUSPENDED_BY_POLICY = 'suspended_by_policy',
  SUSPENSION_CLEARED = 'suspension_cleared',
  // what an administrator did to help a member back into their account, with the reason they gave
  PHONE_CODE_RESENT = 'phone_code_resent',
  CONTACT_CHANGED_BY_ADMIN = 'contact_changed_by_admin',
  COUNTRY_CHANGED_BY_ADMIN = 'country_changed_by_admin',
  PASSWORD_RESET_SENT = 'password_reset_sent'
}

export type UserModerationAction = `${UserModerationActionEnum}`;

/**
 * What the signed-in account may do with the posts of another account, asked before the "add posts"
 * dialog is drawn: `lock` says why the posts cannot be changed at all, `undelegableRoleNames` which of
 * the posts listed cannot be given.
 */
export interface IRolesDelegation {
  lock?: 'ownAccount' | 'highestRoleAccount' | 'staffAccount';
  undelegableRoleNames: string[];
}

/**
 * One account holding OWNER or SUPER_ADMIN, as the owners review them in the back-office: who holds
 * the highest powers, whether their second factor is on, and when they last signed in — an account
 * that should be dormant and is not, or one no longer used at all, is what the review is for.
 */
export interface IHighestRoleAccount {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  isMfaEnabled: boolean;
  /** ISO date, absent for an account that has not signed in since the date started being recorded */
  lastLoginAt?: string;
}
