import { BanTypeEnum, PlatformEnum, type NotificationType } from '@shared/types';
import { getDisplayIdentifier, toInternationalPhone } from '@shared/utils';
import { ComponentType, ReactNode } from 'react';

import type { IPreviewSection, ISelectOption, ITableHeadCell } from '@/types/_core/app.type';
import type { IUserAuditLog } from '@/types/_core/auditLog.type';
import type { UserSectionGroup } from '@/types/_core/user.type';
import type { DateType } from '@/types/_core/utils.type';

import { StatusDotColor } from '@/components/StatusDot';
import {
  DELETED_ACCOUNT_EMAIL_DOMAIN, PROFILE_COMPLETENESS_COMPLETE_RATIO, PROFILE_COMPLETENESS_PARTIAL_RATIO,
  userLocalStorageKey, notificationTypeOptions, sexOptions, USER_MESSAGE_TEMPLATE_KEYS, userPlatformOptions,
} from '@/constants/_core/user.constants';
import {
  IBan, IPhone, ISex, IUser, IPlatform, UserMessageTemplateKey,
} from '@/types/_core/user.type';
import { isDateExpired } from '@/utils/_core/date.utils';
import { cutText } from '@/utils/_core/utils';

/*
 * a type the back-office does not know yet reads as its raw code rather than as an empty cell: an
 * operator can still tell two unknown kinds apart, and report the one that needs a label
 */
export const getNotificationTypeLabelByValue = (type: NotificationType): string => {
  const typeOption = notificationTypeOptions.find((option: ISelectOption) => option.value === type);

  return typeOption?.label ?? type;
};

/**
 * Open registry: the ride/request domain (and any future domain producing extra content
 * for the generic user detail page) registers additional UI here instead of `pages/users/User.tsx`
 * hard-importing ride/request stats and penalty rules, so the core user page stays reusable in an
 * app that has no rides at all.
 */
export type UserExtensionSlot = 'headerFact';

export type UserExtensionComponent = ComponentType<{ user: IUser; extra?: Record<string, unknown> }>;

export type UserExtension = {
  key: string;
  slot: UserExtensionSlot;
  Component: UserExtensionComponent;
  order?: number;
};

const userExtensions: UserExtension[] = [];

export const registerUserExtension = (extension: UserExtension): void => {
  userExtensions.push(extension);
};

export const getUserExtensions = (slot: UserExtensionSlot): UserExtension[] =>
  userExtensions
    .filter((extension) => extension.slot === slot)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/**
 * Open registry: whole blocks of the user detail page contributed by a domain (the vehicles an
 * account owns, the rides it drove or booked…), placed among the page's own blocks by `group` and
 * `order`. Each one brings the hook reading what the block needs for the account — called on every
 * render of the page, in registration order, which the registry never changes once the app runs.
 */
export type UserSectionExtension = {
  key: string;
  group: UserSectionGroup;
  // position among the blocks of the group, the page's own blocks included
  order: number;
  useSection: (user: IUser) => Omit<IPreviewSection, 'id' | 'group'>;
};

const userSectionExtensions: UserSectionExtension[] = [];

export const registerUserSection = (extension: UserSectionExtension): void => {
  userSectionExtensions.push(extension);
};

export const getUserSectionExtensions = (): UserSectionExtension[] => [...userSectionExtensions];

/**
 * Open registry: the ways an account can be kept out of the platform besides a ban by the team (a
 * suspension a domain policy puts on it after repeated cancellations). The page states every active
 * one in its banner and its suspension block, and lifting the suspension lifts all of them.
 */
export type UserSuspension = {
  until?: DateType;
  // what put it on the account, in the words of the one reading the page
  cause: string;
};

export type UserSuspensionSource = {
  key: string;
  // the row naming it in the suspension block, whether it is active or not
  label: string;
  getActive: (user: IUser) => UserSuspension | null;
  // the thunk lifting it
  lift: (user: IUser) => any;
};

const userSuspensionSources: UserSuspensionSource[] = [];

export const registerUserSuspensionSource = (source: UserSuspensionSource): void => {
  userSuspensionSources.push(source);
};

export const getUserSuspensionSources = (): UserSuspensionSource[] => [...userSuspensionSources];

/**
 * Open registry: extra columns for the "audit log" (recycle bin) tab of the generic users list —
 * lets a domain (ride/request) contribute columns without `pages/users/Users.tsx` importing
 * domain-specific audit log fields directly.
 */
export type UserAuditLogColumn = {
  headCell: ITableHeadCell<string>;
  render: (log: IUserAuditLog) => ReactNode;
  order?: number;
};

const userAuditLogColumns: UserAuditLogColumn[] = [];

export const registerUserAuditLogColumn = (column: UserAuditLogColumn): void => {
  userAuditLogColumns.push(column);
};

export const getUserAuditLogColumns = (): UserAuditLogColumn[] =>
  [...userAuditLogColumns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/**
 * Open registry: extra columns for the generic users list (`pages/_core/users/Users.tsx`) — lets a
 * domain contribute a per-row fact of its own (the vehicles an account owns) without the core list
 * importing anything domain-specific. The registered columns are inserted as a block between the
 * user's rating and the completeness of their profile.
 */
export type UserListColumn = {
  headCell: ITableHeadCell<string>;
  Component: ComponentType<{ user: IUser }>;
  order?: number;
};

const userListColumns: UserListColumn[] = [];

export const registerUserListColumn = (column: UserListColumn): void => {
  userListColumns.push(column);
};

export const getUserListColumns = (): UserListColumn[] =>
  [...userListColumns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const getSexLabelByValue = (sex: ISex): string => {
  const sexOption = sexOptions.find((option: ISelectOption) => option.value === sex);

  if (!sexOption) return '';

  return sexOption?.label;
};

/**
 * validate phone number (from Madagascar)
 * @param str
 * @returns
 */
export const validatePhoneNumber = (str: string): boolean => {
  /**
   * valid number are
   * 0341865749, 341865749, 034 18 657 49, 034-18-657-49, 0321865749, 0331865749, 0381865749
   */
  const phoneRegex = /^0?(32|33|34|37|38)[- ]?(\d{2})[- ]?(\d{3})[- ]?(\d{2})$/; // malagasy phone number

  if (phoneRegex.exec(str)) {
    return true;
  }

  return false;
};

/**
 * replace first 0, white space, first +0 and - from phone number
 * @param str
 * @returns
 */
export const formatPhoneNumber = (str: string): string => {
  return str.replace(/^0|\s+|-|^\+0?/g, '');
};

/**
 * How a member is named wherever the back-office has no room for more than one string. Their name
 * when they have one; otherwise the phone number, then the email — a member who signed up by phone
 * has no email, and one still signing up has no name yet, so reading only one of them left the cell
 * empty (or printed `undefined`). The fallbacks are the shared `getDisplayIdentifier`, the same ones
 * the server uses for the dashboard and the report queue.
 *
 * A closed account keeps a placeholder address in place of its own: that is not a way to reach anyone
 * and never stands in for a name.
 * @param user the member, possibly a partial snapshot (a payer, a recipient…)
 * @param fallbackLabel what to show when nothing at all identifies them — empty by default, so a
 * caller can still chain its own label (`getUserFullName(user) || t('merchantAccount')`)
 * @returns the name, else the phone number, else the email, else the fallback label
 */
export const getUserFullName = (user?: IUser, fallbackLabel = ''): string => {
  if (!user) return '';

  const isPlaceholderEmail = !!user.email?.endsWith(DELETED_ACCOUNT_EMAIL_DOMAIN);

  return getDisplayIdentifier({ ...user, email: isPlaceholderEmail ? undefined : user.email }, fallbackLabel);
};

/**
 * The two lines a list row names a member by: the last name over the first name, or — for a member
 * with no name yet — the phone number (or email) alone, so the row is never blank.
 * @param user the member
 * @param fallbackLabel what to show when nothing identifies them
 */
export const getUserNameLines = (
  user: IUser,
  fallbackLabel: string
): { primary: string; secondary?: string } => {
  if (!user.lastName && !user.firstName) return { primary: getUserFullName(user, fallbackLabel) };

  return user.lastName
    ? { primary: user.lastName, secondary: user.firstName }
    : { primary: user.firstName ?? '' };
};

/**
 * full name for a partial user snapshot (firstName/lastName only, e.g. a `Payment.snapshot`
 * payer/receiver or a paginated list projection) — unlike `getUserFullName`, does not require a
 * full `IUser`
 * @param user
 * @returns
 */
export const getPartialUserFullName = (
  user?: { firstName?: string; lastName?: string }
): string | undefined => (
  user?.firstName || user?.lastName ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : undefined
);

/**
 * get full name abbreviation
 * ex: John Doe to JD
 * @param user
 * @returns
 */
export const getUserFullNameAbbreviation = (user: IUser): string => {
  if (!user.lastName && !user.firstName) {
    return 'US';
  }
  let abbreviatedName = (user.lastName ?? '').charAt(0);

  if (user.firstName) {
    abbreviatedName += user.firstName.charAt(0);
  }
  return abbreviatedName.toUpperCase();
};

/**
 * clear user into localStorage
 */
export const clearUserIntoLocalStorage = (): void => {
  localStorage.removeItem(userLocalStorageKey);
};

/**
 * update currentUser into localStorage
 * @param user
 */
export const updateUserIntoLocalStorage = (user: IUser): void | null => {
  if (!user) return null;

  const jsonUser = { ...user };

  if ('password' in jsonUser) {
    delete (jsonUser as any).password;
  }
  const userData = JSON.stringify(jsonUser);

  localStorage.setItem(userLocalStorageKey, userData);
};

export const getCuttedFirstName = (user: IUser): string => {
  if (user.firstName) {
    const name = (user.firstName || '').split(' ')[0];

    return cutText(name);
  }
  return cutText(user.lastName);
};

export const getFullPhoneNumber = (phone?: IPhone): string => toInternationalPhone(phone);

/**
 * How to tell a closed account apart in the recycle bin and the audit log, from what the server kept of
 * it: the email and the phone number it had (both masked by the server), or — for a log that kept
 * neither — the identifier it signed in with. The identifier of a phone account is its number, so it
 * only stands in when nothing else is left rather than repeating the phone.
 * @param log the audit log row of the deleted account
 * @returns the contact lines to draw under the name, possibly none
 */
export const getAuditLogContactLines = (log: IUserAuditLog): string[] => {
  const contacts = [log.emailBefore, getFullPhoneNumber(log.phoneBefore)].filter(Boolean) as string[];

  if (contacts.length > 0) return contacts;

  return log.usernameBefore ? [log.usernameBefore] : [];
};

// user created from back office
export const isUserFromBO = (user: IUser): boolean =>
  !!user.platforms?.find(
    (platform: IPlatform) => platform.name === PlatformEnum.BO
  );

// most recent `lastConnectedAt` across all the user's platforms (web, mobile, bo…)
export const getUserLastConnectedAt = (user: IUser): string | Date | undefined =>
  (user.platforms ?? []).reduce<string | Date | undefined>((latest, platform: IPlatform) => {
    if (!platform.lastConnectedAt) return latest;
    if (!latest || new Date(platform.lastConnectedAt) > new Date(latest)) return platform.lastConnectedAt;
    return latest;
  }, undefined);

// the platform of the user's most recent connection, as the filter names it (iOS, Android…)
export const getUserLastPlatformLabel = (user: IUser): string | undefined => {
  const lastPlatform = (user.platforms ?? []).reduce<IPlatform | undefined>(
    (latest, platform: IPlatform) => {
      if (!platform.lastConnectedAt) return latest;
      if (!latest || new Date(platform.lastConnectedAt) > new Date(latest.lastConnectedAt)) return platform;
      return latest;
    },
    undefined
  );

  return userPlatformOptions.find((option) => option.value === lastPlatform?.name)?.label;
};

// when the suspension in force ends — undefined once it has lapsed or when there is none
export const getUserActiveSuspensionUntil = (user: IUser): DateType | undefined => {
  const until = user.suspension?.until;

  return until && !isDateExpired(until) ? until : undefined;
};

export type ProfileCompletenessLevel = 'complete' | 'partial' | 'toComplete';

export interface IUserProfileCompleteness {
  filledCount: number;
  totalCount: number;
  // 0 to 100 — what the bar draws, and what the level below is decided on
  percentage: number;
  level: ProfileCompletenessLevel;
  tone: StatusDotColor;
}

/*
 * The tone says how much the profile stands in the way of using the platform rather than how good
 * the figure is: a finished profile is the one an operator never has to chase (quiet green), a
 * profile that is barely filled in is the one behind most of the trust problems (loud), and
 * everything between is simply an account still filling itself in.
 */
const PROFILE_COMPLETENESS_TONES: Record<ProfileCompletenessLevel, StatusDotColor> = {
  complete: 'success',
  partial: 'warning',
  toComplete: 'error',
};

/*
 * What the list counts as a filled-in profile: everything an account chooses to provide or to
 * confirm after signing up. The name is left out on purpose — it is mandatory at sign-up, so
 * counting it would give every account the same free share of the bar and flatten the column.
 *
 * A contact only counts for an account that has it: a member who signed up by phone has no email, so
 * an email that can never be confirmed must not hold their profile below "complete" for ever.
 */
type ProfileCompletenessCheck = {
  // left out of the account's total when it cannot apply to it
  isApplicable?: (user: IUser) => boolean;
  isFilled: (user: IUser) => boolean;
};

const PROFILE_COMPLETENESS_CHECKS: ProfileCompletenessCheck[] = [
  { isApplicable: (user) => !!user.email, isFilled: (user) => !!user.emailVerified },
  { isApplicable: (user) => !!user.phone?.number, isFilled: (user) => !!user.phoneVerified },
  { isFilled: (user) => !!user.image },
  { isFilled: (user) => !!user.birthday },
  { isFilled: (user) => !!user.sex },
  { isFilled: (user) => !!user.address },
  { isFilled: (user) => !!user.aboutMe },
];

/**
 * How much of a user's profile is filled in: how many of the optional items the account provided
 * or confirmed, as a percentage, and which of the three bands that percentage falls in.
 * @param user
 * @returns the counts, the percentage and the band it falls in, with the tone to draw it in
 */
export const getUserProfileCompleteness = (user: IUser): IUserProfileCompleteness => {
  const applicableChecks = PROFILE_COMPLETENESS_CHECKS.filter((check) => check.isApplicable?.(user) ?? true);
  const totalCount = applicableChecks.length;
  const filledCount = applicableChecks.filter((check) => check.isFilled(user)).length;
  const ratio = filledCount / totalCount;

  const getLevel = (): ProfileCompletenessLevel => {
    if (ratio >= PROFILE_COMPLETENESS_COMPLETE_RATIO) return 'complete';
    if (ratio >= PROFILE_COMPLETENESS_PARTIAL_RATIO) return 'partial';

    return 'toComplete';
  };

  const level = getLevel();

  return {
    filledCount,
    totalCount,
    percentage: Math.round(ratio * 100),
    level,
    tone: PROFILE_COMPLETENESS_TONES[level],
  };
};

/*
 * Whether each ready-made nudge still applies to this account. A template offering to chase an
 * address the account already confirmed is worse than no template at all: the administrator has to
 * read all three to find the one that is not already done. The same goes for chasing a contact the
 * account does not have: a member who signed up by phone is never asked to verify an email.
 */
const USER_MESSAGE_TEMPLATE_CHECKS: Record<UserMessageTemplateKey, (user: IUser) => boolean> = {
  verifyEmail: (user) => !!user.email && !user.emailVerified,
  verifyPhone: (user) => !!user.phone?.number && !user.phoneVerified,
  completeProfile: (user) => getUserProfileCompleteness(user).level !== 'complete',
};

/**
 * The ready-made messages worth offering for this account, in the order the templates are declared.
 * @param user
 * @returns the keys of the templates whose subject still describes something the account has to do
 */
export const getUserMessageTemplateKeys = (user: IUser): UserMessageTemplateKey[] => (
  USER_MESSAGE_TEMPLATE_KEYS.filter((key) => USER_MESSAGE_TEMPLATE_CHECKS[key](user))
);

/*
 * ----------------------------------------------------- //
 * ------------------- bans / suspension --------------- //
 * ----------------------------------------------------- //
 */
export type BanStatus = 'active' | 'lifted' | 'expired';

/**
 * Where one ban of the account stands: still in force, stopped by hand before its end, or run out.
 * An old entry carries no lift at all, so it is read off its end date alone.
 */
export const getBanStatus = (ban: IBan): BanStatus => {
  if (ban.liftedBy) return 'lifted';
  if (ban.liftedAt) return 'expired';
  if (ban.type === BanTypeEnum.PERMANENT) return 'active';

  return ban.until && !isDateExpired(ban.until)
    ? 'active'
    : 'expired';
};

/**
 * The ban the team put on the account that is in force right now — absent when the account is not
 * banned. `banned` is what the platform acts on; the entry is what says how and until when.
 */
export const getActiveTeamBan = (user: IUser): IBan | undefined => {
  if (!user.banned) return undefined;

  return [...(user.bans ?? [])].reverse().find((ban) => getBanStatus(ban) === 'active') ??
    user.bans?.[user.bans.length - 1];
};

/**
 * Whether the member accepts the fallback SMS. It is a paid channel, so a switch never written means
 * "off": only an explicit `true` is the member having consented in their app.
 */
export const isUserSmsFallbackEnabled = (user: IUser): boolean => (
  (user.notificationPreferences?.smsEnabled) ?? false
);
