export enum SexEnum {
  MALE = 'male',
  FEMALE = 'female'
}

export enum BanReasonEnum {
  FRAUD = 'fraud',
  HARASSMENT = 'harassment',
  NO_SHOW_REPEATED = 'no_show_repeated',
  FAKE_PROFILE = 'fake_profile',
  SAFETY_VIOLATION = 'safety_violation',
  OTHER = 'other',
  /**
   * Not a sanction: support blocks the account for a few hours to protect it (stolen phone or SIM,
   * until the SIM is blocked). Told apart so the member is reassured, not accused, and is not
   * invited to contest a decision taken for them.
   */
  ACCOUNT_PROTECTION = 'account_protection'
}

export enum BanTypeEnum {
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent'
}

/**
 * How a back-office administrator reaches a user directly: their mailbox, or their handset. Which
 * one is available depends on the account — an account with no phone number can only be emailed.
 */
export enum MessageChannelEnum {
  EMAIL = 'email',
  SMS = 'sms'
}

/** Platform a user account/session originates from */
export enum PlatformEnum {
  WEB = 'web',
  BO = 'bo',
  ANDROID = 'android',
  IOS = 'ios'
}

/**
 * Stats related to the user, used for both driver and passenger.
 * Updated in the afterSave trigger of the Rate class.
 */
export type UserStats = {
  /** Average rating, recalculated whenever a new review is added or an existing review is updated. */
  rating: number;
  /** Total number of reviews received by the user, regardless of their rating value. */
  reviewsCount: number;
  lastRatingAt: Date | null;
};

/**
 * Who may read one field of a member's profile. `riders` is neutral in role on purpose: the same
 * account is a driver on one trip and a passenger on the next, and the audience is whoever it is
 * actually travelling with (a confirmed booking either way round).
 */
export enum ProfileVisibilityEnum {
  ALL = 'all',
  RIDERS = 'riders',
  SELF = 'self'
}

/** Profile fields whose audience the member chooses, one visibility value each. */
export enum ProfileFieldEnum {
  PHOTO = 'photo',
  NAME = 'name',
  SEX = 'sex',
  BIRTHDAY = 'birthday',
  PHONE = 'phone',
  EMAIL = 'email',
  ADDRESS = 'address',
  ABOUT_ME = 'aboutMe'
}

/**
 * Stored on the user as `profileVisibility`. Fixed keys (the profile fields), so it stays a schema
 * rather than data; a missing key falls back to `DEFAULT_PROFILE_VISIBILITY`, which is also what
 * every account created before the field existed reads.
 */
export type ProfileVisibility = Partial<Record<`${ProfileFieldEnum}`, `${ProfileVisibilityEnum}`>>;

/** A login identifier a member can replace from their profile, once the new one is confirmed by code. */
export enum ContactChangeTypeEnum {
  EMAIL = 'email',
  PHONE = 'phone'
}

/**
 * Why the sign-up code SMS did not go out, stored on the user as `verificationSmsError`. The text is
 * sent while the account is created, where the app cannot see the outcome: it reads this on the
 * verification screen to tell the member the code is not coming instead of letting them wait.
 */
export enum VerificationSmsErrorEnum {
  /** the SMS provider refused the text or could not be reached */
  FAILED = 'failed',
  /** the number or the connection already used up its daily allowance of verification texts */
  RATE_LIMITED = 'rateLimited'
}

/**
 * What a row of a member's audit trail records. One flat list across every log collection that
 * names the member (sessions, support sessions, roles, MFA, moderation, account deletion), so the
 * back-office reads a single chronology instead of five partial ones.
 */
export enum UserAuditTrailActionEnum {
  DEVICE_SIGNED_OUT = 'device_signed_out',
  ALL_DEVICES_SIGNED_OUT = 'all_devices_signed_out',
  SUPPORT_SESSION_STARTED = 'support_session_started',
  SUPPORT_SESSION_ENDED = 'support_session_ended',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_RESET = 'mfa_reset',
  MFA_LOGIN_FAILED = 'mfa_login_failed',
  MFA_BACKUP_CODE_USED = 'mfa_backup_code_used',
  BANNED = 'banned',
  BAN_LIFTED = 'ban_lifted',
  BAN_EXPIRED = 'ban_expired',
  SUSPENDED_BY_POLICY = 'suspended_by_policy',
  SUSPENSION_CLEARED = 'suspension_cleared',
  PHONE_CODE_RESENT = 'phone_code_resent',
  CONTACT_CHANGED_BY_ADMIN = 'contact_changed_by_admin',
  COUNTRY_CHANGED_BY_ADMIN = 'country_changed_by_admin',
  PASSWORD_RESET_SENT = 'password_reset_sent',
  ACCOUNT_DELETED = 'account_deleted'
}

/**
 * Who started an audited action: the member themselves, someone else (an administrator), or
 * nobody (a job, an automatic policy, an expiry).
 */
export enum UserAuditTrailInitiatorEnum {
  ADMIN = 'admin',
  SYSTEM = 'system',
  USER = 'user'
}

export interface IUserAuditTrailEntry {
  id: string;
  /** the collection the row was read from */
  source: string;
  action: `${UserAuditTrailActionEnum}`;
  initiator: `${UserAuditTrailInitiatorEnum}`;
  performedBy?: { id: string; name: string };
  /** raw free text: device label, support session reason, role names, ban reason code… */
  details?: string;
  banType?: string;
  /** ISO date */
  until?: string;
  /** ISO date */
  createdAt: string;
}

export interface IUserAuditTrailResult {
  results: IUserAuditTrailEntry[];
}
