import { BanReasonEnum, BanTypeEnum, PlatformEnum } from '@shared/types';
import dayjs from 'dayjs';


import type { Locale, Phone } from '@/types/app.type';
import type { ICode, IPlatform, VerificationChannel } from '@/types/auth.type';
import type { EmailRecipient } from '@/types/email.type';
import type { ActorSnapshot, IBan } from '@/types/user.type';

import { translate } from '@/config/i18n';
import { getRedis } from '@/config/redis';
import {
  MAX_VERIFICATION_ATTEMPTS,
  USE_MASTER_KEY,
  VERIFICATION_CODE_COOLDOWN_SECONDS, VERIFICATION_CODE_DAILY_LIMIT,
  collections,
} from '@/constants/_core/constants';
import { SERVER_MANAGED_USER_FIELDS } from '@/constants/_core/user.constants';
import { formatDateInAppTimezone } from '@/utils/_core/date.utils';
import { decrypt, encrypt } from '@/utils/_core/encrypt.utils';
import { consumeSmsSendQuota } from '@/utils/_core/sms-quota.utils';
import { formatFullName } from '@/utils/_core/user.utils';
import { generateNumber } from '@/utils/_core/utils';

/*
 * defined locally rather than imported from `triggers/_core/newsletter.triggers` — that trigger
 * file imports `utils.cloud.ts` (this file's neighbor) too, and this module sits on
 * `utils.cloud.ts`'s own import chain (via `role.utils.cloud.ts` -> `userRole.service.cloud.ts`),
 * so importing the class from there closes a circular require that crashes with
 * "Cannot access 'parseFunction' before initialization" depending on load order.
 * `Parse.Object.extend` is idempotent — calling it here returns the same cached subclass.
 */
const Newsletter = Parse.Object.extend(collections.Newsletter);

/**
 * generate 6 digits number the encrypt it to save to db
 * so it should be a random characters
 * @returns
 */
export const generateEncryptedVerificationCode = (
  prevVerification?: ICode,
  channel?: VerificationChannel
): ICode => {
  const code = generateNumber(6);
  const encryptedCode = encrypt(code);
  const todayStr = new Date().toISOString().slice(0, 10);

  const isSameDay = prevVerification?.dailySentDate === todayStr;
  const dailySentCount = (isSameDay ? (prevVerification?.dailySentCount ?? 0) : 0) + 1;

  return {
    code: encryptedCode as string,
    ...(channel ? { channel } : {}),
    expiredAt: dayjs().add(1, 'hour').toDate(),
    failedAttempts: 0,
    sentAt: new Date(),
    dailySentCount,
    dailySentDate: todayStr,
  };
};

/**
 * Drops, from a pending `_User` save, every change to a column the server owns.
 *
 * `_User` is self-managed: the ACL Parse writes at sign-up gives the account write access to its
 * own row, and the CLP has to stay open enough for profile edits. That leaves every column
 * writable by its owner, including the ones the platform runs on — trip counters, the monthly ride
 * count the commission tier is read from, verification and moderation state. A single
 * `PUT /parse/users/me` was enough to erase a cancellation history or land in the cheapest
 * commission bracket.
 *
 * Reverting rather than throwing is deliberate: a legitimate profile save that happens to echo an
 * untouched field back must still go through, with only the forbidden half dropped.
 *
 * @returns the fields that were reverted, so the caller can log them
 */
export const revertServerManagedUserFields = (user: Parse.User, dirtyKeys: string[]): string[] => {
  const forbiddenKeys = dirtyKeys.filter((key) => SERVER_MANAGED_USER_FIELDS.includes(key));

  if (forbiddenKeys.length > 0) user.revert(...forbiddenKeys);

  return forbiddenKeys;
};

export type VerificationField =
  | 'verification' |
  'stepUpVerification' |
  'resetPasswordVerification' |
  'contactChangeVerification' |
  'payoutPhoneVerification';

/**
 * decrypt the user code
 * @param user
 * @param field which verification code slot to read — 'verification' (sign-up),
 *   'resetPasswordVerification' (forgotten password) or 'stepUpVerification' (re-auth before a
 *   sensitive action) or 'contactChangeVerification' (new email/phone being confirmed), kept separate
 *   so one doesn't clobber the other if two are pending at once
 * @returns
 */
export const getDecryptedUserCode = (
  user: Parse.User,
  field: VerificationField = 'verification'
): string | undefined | void => {
  if (!user.has(field)) return;
  const verification = user.get(field);
  const { code } = verification;
  const decryptedCode = decrypt(code);

  return decryptedCode;
};

/**
 * Increments failed attempt counter on a pending verification.
 * Locks the verification when MAX_VERIFICATION_ATTEMPTS is reached.
 * Returns true when the verification is now locked.
 */
export const recordVerificationFailure = async (
  user: Parse.User,
  field: VerificationField = 'verification'
): Promise<boolean> => {
  const verification = user.get(field) as ICode;
  const failedAttempts = (verification.failedAttempts || 0) + 1;
  const isLocked = failedAttempts >= MAX_VERIFICATION_ATTEMPTS;

  user.set(field, {
    ...verification,
    failedAttempts,
    ...(isLocked ? { lockedAt: new Date() } : {}),
  });

  await user.save(null, USE_MASTER_KEY);
  return isLocked;
};

export type VerificationRateLimitOptions = {
  /**
   * The code slot being sent. Each one has its own pause and daily allowance, so a member who used
   * up the sign-up codes can still reset a password or confirm a new number.
   */
  flow?: VerificationField;
  /** The bare number the code is texted to — leave out when it goes out by email. */
  phoneNumber?: string;
  /** The caller's IP address, counted against the daily SMS cap of that address. */
  ip?: string;
};

/**
 * Throws if the user has requested too many codes too quickly.
 * Enforces, per flow, a cooldown between two codes and a daily cap; and, for a code sent by SMS, a
 * daily cap on the destination number and on the caller's IP address — the only limits a
 * throw-away account cannot reset. All of it is tracked in Redis so the check is atomic across
 * concurrent requests and self-expiring — no manual daily reset logic needed. A refusal names the
 * time the limit is lifted rather than a vague "tomorrow".
 */
export const checkVerificationRateLimit = async (
  user: Parse.User,
  locale: Locale,
  { flow = 'verification', phoneNumber, ip }: VerificationRateLimitOptions = {}
): Promise<void> => {
  const redis = getRedis();
  const cooldownKey = `verification:cooldown:${user.id}:${flow}`;
  const isInCooldown = await redis.get(cooldownKey);

  if (isInCooldown) {
    throw new Error(
      translate('user.verificationCodeCooldown', locale, { seconds: String(VERIFICATION_CODE_COOLDOWN_SECONDS) })
    );
  }

  const dailyCountKey = `verification:daily:${user.id}:${flow}`;
  const dailySentCount = await redis.incr(dailyCountKey);

  if (dailySentCount === 1) {
    await redis.expire(dailyCountKey, 24 * 60 * 60);
  }

  if (dailySentCount > VERIFICATION_CODE_DAILY_LIMIT) {
    const secondsLeft = await redis.ttl(dailyCountKey);
    const secondsUntilRetry = secondsLeft > 0 ? secondsLeft : 24 * 60 * 60;
    const retryAt = new Date(Date.now() + (secondsUntilRetry * 1000));

    throw new Error(translate('user.verificationCodeDailyLimit', locale, {
      time: formatDateInAppTimezone(retryAt, 'HH:mm'),
    }));
  }

  const smsQuota = await consumeSmsSendQuota({ phoneNumber, ip });

  if (!smsQuota.isAllowed) {
    throw new Error(translate('user.verificationSmsLimit', locale, {
      time: formatDateInAppTimezone(smsQuota.retryAt, 'HH:mm'),
    }));
  }

  await redis.set(cooldownKey, 1, { ex: VERIFICATION_CODE_COOLDOWN_SECONDS });
};

/**
 * get user full name
 * @param person
 * @returns
 */
export const getUserFullName = (person: Parse.User): string => {
  if (!person) return '';

  return formatFullName(person.get('firstName'), person.get('lastName'));
};

/**
 * who acted on an account, as stored next to the action: the name is copied rather than pointed
 * at, so the record still reads "banned by <name>" once that account is renamed or deleted
 * @param person the account that acted
 * @returns its id and full name (email when it has no name)
 */
export const toActorSnapshot = (person: Parse.User): ActorSnapshot => ({
  id: person.id,
  name: getUserFullName(person) || person.get('email') || '',
});

/**
 * adapt a Parse.User to the plain shape email-sending functions expect —
 * keeps those functions testable without a real Parse.User/DB row
 * @param user
 * @returns
 */
export const toEmailRecipient = (user: Parse.User): EmailRecipient => ({
  email: user.get('email'),
  firstName: user.get('firstName'),
  lastName: user.get('lastName'),
});

/**
 * Writes what a completed sign-in changes on the account, for the caller to save: it is online, it
 * was just used (`lastLoginAt` is what tells an abandoned account from a live one), and any
 * password reset held back on it is cancelled — only someone who knows the password can get here,
 * so a reset started by someone else on a recycled number no longer stands.
 */
export const markUserSignedIn = (user: Parse.User): void => {
  user.set('isOnline', true);
  user.set('lastLoginAt', new Date());
  user.unset('passwordResetToken');
  user.unset('passwordResetDelay');
};

// user created from back office
export const isUserFromBO =(user: Parse.User): boolean => {
  return !!(user.get('platforms') ?? []).find((platform: IPlatform) => platform.name === PlatformEnum.BO);
};

/**
 * The platforms list after a save: the platform the account signs in from gets its counter and
 * last connection bumped — or is appended when this is the first sign-in from it, otherwise an
 * account created on the web would never show its first Android sign-in at all.
 * Appending is limited to a save that actually sends `platform`: the column is stored, so every
 * other save of the row reads back the value it was created with.
 */
export const getUserPlatforms = (prevUser: Parse.User, user: Parse.User): IPlatform[] => {
  const prevPlatforms: IPlatform[] = prevUser?.get('platforms') || [];
  const currentPlatform: IPlatform['name'] | undefined = user.get('platform');

  if (!currentPlatform) return prevPlatforms;

  const isKnownPlatform = prevPlatforms.some(
    (platform: IPlatform): boolean => platform.name === currentPlatform
  );

  if (!isKnownPlatform) {
    if (!user.dirty('platform')) return prevPlatforms;

    return [...prevPlatforms, { name: currentPlatform, count: 1, lastConnectedAt: dayjs().toDate() }];
  }

  return prevPlatforms.map((platform: IPlatform): IPlatform => {
    if (platform.name !== currentPlatform) return platform;

    return {
      ...platform,
      count: platform.count + 1,
      lastConnectedAt: dayjs().toDate(),
    };
  });
};

export const createNewsletter = async (email: string, locale: string): Promise<Parse.Object | undefined> => {
  const existingNewsletter = await new Parse.Query('Newsletter').equalTo('email', email).first();

  if (existingNewsletter) return;
  const newsLetter = new Newsletter();

  newsLetter.set('email', email);
  newsLetter.set('language', locale);

  const savedNewsletter = await newsLetter.save(null, USE_MASTER_KEY);

  return savedNewsletter;
};

/**
 * get the payment phone number
 * if the payment phone number is not set, it will return the contact phone number
 * @param parseObj
 * @returns
 */
export const getPaymentPhone = (
  parseObj: Parse.Object,
  userType: 'driver' | 'passenger' = 'driver',
  defaultPhoneNumber?: Phone
): Phone => {
  if (defaultPhoneNumber) return defaultPhoneNumber;
  // related user
  const user = parseObj.get(userType);
  const currentPaymentPhone = parseObj.get('paymentPhone');

  if (currentPaymentPhone) {
    return currentPaymentPhone;
  }

  const userPaymentPhones = user?.get('paymentPhones') || [];
  const userPaymentPhone = userPaymentPhones ? userPaymentPhones[0] : null;

  return (
    parseObj.get('paymentPhone') ||
    parseObj.get('phone') ||
    userPaymentPhone
  );
};

/**
 * Whether a payment number is one the user has saved on their profile. A booking is debited from
 * the number it names, so a number that is not the passenger own must never reach the gateway.
 */
export const isPhoneOfUser = (user: Parse.User, phone?: Phone | null): boolean => !!phone &&
  (user.get('paymentPhones') || []).some(
    (savedPhone: Phone) => savedPhone.code === phone.code && savedPhone.number === phone.number
  );

/**
 * Whether the user is currently blocked from accessing the platform.
 * A permanent ban always blocks; a temporary ban only blocks while `until` is in the future.
 * Used at login time so an expired temporary ban (not yet cleared by the cron job) does not
 * wrongly block access.
 */
export const isUserCurrentlyBanned = (user: Parse.User): boolean => {
  if (!user.get('banned')) return false;

  const bans: IBan[] = user.get('bans') || [];
  const latestBan = bans[bans.length - 1];

  if (!latestBan) return true;
  if (latestBan.type === BanTypeEnum.PERMANENT) return true;

  return !!latestBan.until && dayjs(latestBan.until).isAfter(dayjs());
};

/**
 * Translated message explaining why the user is banned, including the reason and either the
 * lift date (temporary) or the permanent nature of the ban. Reuses the same translation keys
 * as the ban email so the wording stays consistent across login rejection and email.
 */
export const getBanMessage = (user: Parse.User, locale: Locale): string => {
  const bans: IBan[] = user.get('bans') || [];
  const latestBan = bans[bans.length - 1];

  if (!latestBan) return translate('error.accountBanned', locale);

  // a protective block is not a sanction: no "reason", no word of suspension
  if (latestBan.reason === BanReasonEnum.ACCOUNT_PROTECTION) {
    return translate('email.accountProtected', locale, {
      until: formatDateInAppTimezone(latestBan.until),
    });
  }

  const reasonLabel = translate(`email.banReasons.${latestBan.reason}`, locale);

  return latestBan.type === BanTypeEnum.PERMANENT
    ? translate('email.accountBannedPermanent', locale, { reason: reasonLabel })
    : translate('email.accountBannedTemporary', locale, {
      reason: reasonLabel,
      until: formatDateInAppTimezone(latestBan.until),
    });
};

export const logoutUserOtherDevices = async (
  user: Parse.User, currentSessionToken: string
): Promise<void> => {
  const sessionQuery = new Parse.Query('_Session');

  sessionQuery.equalTo('user', user);
  const allSessions = await sessionQuery.find(USE_MASTER_KEY);

  const sessionsToDelete = allSessions.filter(session => session.get('sessionToken') !== currentSessionToken);

  if (sessionsToDelete.length === 0) return;

  await Parse.Object.destroyAll(sessionsToDelete, USE_MASTER_KEY);
};
