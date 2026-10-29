import {
  BanReasonEnum, BanTypeEnum, SuspensionSourceEnum, VerificationSmsErrorEnum,
} from '@shared/types';
import dayjs from 'dayjs';


import type { Locale } from '@/types/app.type';
import type { VerificationChannel } from '@/types/auth.type';
import type { BanReason, BanType, IBan } from '@/types/user.type';


import { moveFileToRecycleBin } from '@/api/_core/cloudinary.api';
import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import {
  collections, DEFAULT_BAN_DURATION_DAYS, DEFAULT_QUERY_LIMIT, DISABLE_TRIGGERS_CONTEXT, IS_LOCAL, IS_TEST,
  SKIP_SIGN_UP_VERIFICATION, UNVERIFIED_PHONE_SIGNUP_RETENTION_HOURS, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  ACCOUNT_BANNED_STATUS, ACCOUNT_NOTIFICATION_TYPE, ACCOUNT_SUSPENDED_STATUS, ACCOUNT_UNBANNED_STATUS,
} from '@/constants/_core/notification.constants';
import {
  USER_DETAILS_FIELDS, USER_DETAILS_POINTER_FIELDS, USER_DETAILS_POINTER_SUBFIELDS,
} from '@/constants/_core/user.constants';
import { NotificationChannelStatusEnum, type NotificationChannelRecipient } from '@/types/notification.type';
import { OwnerAlertEventEnum } from '@/types/ownerAlert.type';
import { RegisterStepEnum, UserModerationActionEnum } from '@/types/user.type';
import { logger } from '@/utils/_core/logger';
import { normalizePhoneNumber } from '@/utils/_core/phone.utils';
import { consumeSmsSendQuota } from '@/utils/_core/sms-quota.utils';
import { applyUserSuspension } from '@/utils/_core/suspension.utils';
import { appendBan, closeBanInForce } from '@/utils/_core/user.utils';
import { escapeText } from '@/utils/_core/utils';

import { createNotification, removeRecipientFromNotifications } from './notification.service.cloud';
import { alertOwners } from './ownerAlert.service.cloud';
import { createUserModerationLog } from './userModerationLog.service.cloud';
import { revokeAllUserSessionsService } from './userSession.service.cloud';
import { sendAccountReactivatedEmail } from '../../emails/_core/user.email';
import { createContactToCloud, sendEmailToUser, sendEmailVerification } from '../../utils/_core/email.utils.cloud';
import { type ParallelJobData, runJob, runParallelJob } from '../../utils/_core/job.utils.cloud';
import { isMfaLocked } from '../../utils/_core/mfa.utils.cloud';
import { scopeToAgentCountries } from '../../utils/_core/parse.utils.cloud';
import { assertCanActOnUser } from '../../utils/_core/role.utils.cloud';
import { sendSmsVerification } from '../../utils/_core/sms.utils.cloud';
import { getUserPhoneSearchQueries } from '../../utils/_core/user-search.utils.cloud';
import {
  getBanMessage, generateEncryptedVerificationCode, getDecryptedUserCode, toActorSnapshot, toEmailRecipient,
} from '../../utils/_core/user.utils.cloud';
import { saveTriggerOptions } from '../../utils/_core/utils.cloud';

/**
 * Business domains declare whether an account should be blocked from self-deletion
 * (e.g. active engagements, pending penalties) — keeps this generic service free
 * of ride/request-specific knowledge. First blocker to return a value wins.
 */
export type AccountDeletionBlocker = Record<string, unknown> & { code: string };
export type AccountDeletionBlockChecker = (user: Parse.User) => Promise<AccountDeletionBlocker | void>;

const accountDeletionBlockCheckers: AccountDeletionBlockChecker[] = [];

export const registerAccountDeletionBlockChecker = (checker: AccountDeletionBlockChecker): void => {
  accountDeletionBlockCheckers.push(checker);
};

export const getAccountDeletionBlocker = async (user: Parse.User): Promise<AccountDeletionBlocker | void> => {
  for (const checker of accountDeletionBlockCheckers) {
    const blocker = await checker(user);

    if (blocker) return blocker;
  }
};

/**
 * Business domains say whether two members are travelling together (a confirmed booking between them)
 * — what releases the contact details a member keeps for fellow travellers, without this generic
 * service knowing what a booking is.
 */
type TravellingTogetherChecker = (userId: string, otherUserId: string) => Promise<boolean>;

const travellingTogetherCheckers: TravellingTogetherChecker[] = [];

export const registerTravellingTogetherChecker = (checker: TravellingTogetherChecker): void => {
  travellingTogetherCheckers.push(checker);
};

export const areTravellingTogether = async (userId: string, otherUserId: string): Promise<boolean> => {
  for (const checker of travellingTogetherCheckers) {
    if (await checker(userId, otherUserId)) return true;
  }

  return false;
};

/**
 * Business domains declare cleanup to run right before an account is deleted
 * (e.g. auto-cancel pending requests) — keeps this generic service free of
 * ride/request-specific knowledge.
 */
type AccountDeletionCleanup = (user: Parse.User) => Promise<void>;

const accountDeletionCleanups: AccountDeletionCleanup[] = [];

export const registerAccountDeletionCleanup = (cleanup: AccountDeletionCleanup): void => {
  accountDeletionCleanups.push(cleanup);
};

export const runAccountDeletionCleanups = async (user: Parse.User): Promise<void> => {
  await Promise.all(accountDeletionCleanups.map((cleanup) => cleanup(user)));
};

export const removeRelationByUser = async (user: Parse.User, className: string): Promise<void> => {
  const objects = await new Parse.Query(className).equalTo('user', user).find();

  for (const object of objects) {
    // remove the user field
    object.unset('user');
    const isUpdatedByExists = await object.exists('updatedBy' as any);

    if (isUpdatedByExists) {
      object.unset('updatedBy');
    }
    const isCreatedBy = await object.exists('createdBy' as any);

    if (isCreatedBy) {
      object.unset('createdBy');
    }
  }

  await Parse.Object.saveAll(objects, {
    ...USE_MASTER_KEY,
    context: { userDeleted: true },
  });
};

/**
 * unset relation fields linked to user after the account deletion
 * @param {*} classNames
 */
export const removeRelationsByUser = async (user: Parse.User, classNames: string[]): Promise<void> => {
  for (const className of classNames) {
    await removeRelationByUser(user, className);
  }
};

/**
 * destroy or delete a user relation
 * @param user user to delete or destroy relation
 * @param className collection name
 * @param field pointer field name
 * @param type destroy or delete
 */
type DeleteOrDestroyUserRelationParams = {
  user: Parse.User;
  className: string;
  field: string;
  type?: 'destroy' | 'delete';
  request?: Parse.Cloud.JobRequest;
};
export const deleteOrDestroyUserRelation = async ({
  user,
  className,
  field,
  type = 'delete',
  request,
}: DeleteOrDestroyUserRelationParams): Promise<ParallelJobData> => {
  const query = new Parse.Query(className)
    .equalTo(field, user);

  const result = await runParallelJob({
    query,
    concurrency: 10,
    request,
    // treat each item
    worker: async (entity: Parse.Object) => {
      if (type === 'destroy') {
        await entity.destroy(USE_MASTER_KEY);
      }
      else if (type === 'delete') {
        entity.set('deleted', true);
        await entity.save(null, USE_MASTER_KEY);
      }
    },
  });

  return result;
};

/**
 * the members whose name, username or phone number matches a text
 * @param text
 */
export const buildUserTextQuery = (text: string): Parse.Query => {
  const formattedText = escapeText(text);

  return Parse.Query.or(
    new Parse.Query(Parse.User).matches('lastName', formattedText),
    new Parse.Query(Parse.User).matches('firstName', formattedText),
    new Parse.Query(Parse.User).matches('username', formattedText),
    ...getUserPhoneSearchQueries(text)
  );
};

/**
 * query a user relation from another query
 * pointer = relation
 * ex: search a user who create a contact by its name, email or phone number
 * @param mainQuery
 * @param text
 * @param field pointer name
 */
export const searchUserPointerQuery = (mainQuery: Parse.Query, text: string, field = 'user'): void => {
  mainQuery.matchesQuery(field, buildUserTextQuery(text));
};

/**
 * delete or destroy user relations (pointer fields)
 * this should be used as underground task
 * using with job (parse server) or long task (gcp, aws, ...)
 */
type DeleteUserRelationItem = {
  className: string;
  field: string;
};

const CORE_USER_RELATION_CLEANUP_TARGETS: DeleteUserRelationItem[] = [
  { className: 'Contact', field: 'user' },
  { className: 'Notification', field: 'from' },
];

const domainUserRelationCleanupTargets: DeleteUserRelationItem[] = [];

/**
 * Business domains declare which of their own pointer fields to a user must be
 * unset/deleted/destroyed when the account is removed — keeps this generic
 * service free of ride/request/vehicle-specific knowledge.
 */
export const registerUserRelationCleanupTarget = (item: DeleteUserRelationItem): void => {
  domainUserRelationCleanupTargets.push(item);
};

export const deleteOrDestroyUserRelations = async (user: Parse.User, type = 'delete', request?: Parse.Cloud.JobRequest) => {
  const items: DeleteUserRelationItem[] = [
    ...CORE_USER_RELATION_CLEANUP_TARGETS,
    ...domainUserRelationCleanupTargets,
  ];

  const result = await runParallelJob<DeleteUserRelationItem>({
    array: items,
    concurrency: 10,
    worker: async (item) => {
      await deleteOrDestroyUserRelation({
        user,
        className: item.className,
        field: item.field,
        type: type as 'delete' | 'destroy',
        request,
      });
    },
  });

  /*
   * the notifications the account received are shared rows (one send, several recipients), so they
   * are rewritten without the account rather than deleted with it like the ones it sent
   */
  const rewrittenNotificationsCount = await removeRecipientFromNotifications(user);

  logger.info(`User ${user.id} removed from ${rewrittenNotificationsCount} received notifications`);

  return result;
};

/** @returns whether the email went out — a member without an address, or a refused send, is not reached */
const sendBanEmail = async (user: Parse.User, locale: Locale): Promise<boolean> => {
  const bans: IBan[] = user.get('bans') || [];
  const isProtection = bans[bans.length - 1]?.reason === BanReasonEnum.ACCOUNT_PROTECTION;

  try {
    return await sendEmailToUser(user, {
      subject: translate(isProtection ? 'email.accountProtectedSubject' : 'email.accountBannedSubject', locale),
      message: getBanMessage(user, locale),
    });
  }
  catch (error) {
    logger.error('Failed to send ban email', { userId: user.id, error: (error as Error).message });
    return false;
  }
};

/**
 * Whether the ban push reached a device. The push fan-out writes its outcome on the notification
 * row after the row is saved, so the row is read again rather than trusting the saved object.
 */
const wasBanPushed = async (notification: Parse.Object | undefined, userId: string): Promise<boolean> => {
  if (!notification) return false;

  try {
    const stored = await new Parse.Query(collections.Notification)
      .select(['channels'])
      .get(notification.id, USE_MASTER_KEY);
    const push: NotificationChannelRecipient[] = stored.get('channels')?.push ?? [];

    return push.some((recipient) => (
      recipient.toId === userId && recipient.status === NotificationChannelStatusEnum.SENT
    ));
  }
  catch (error) {
    logger.error('Could not read the ban push outcome', { userId, error: (error as Error).message });
    return false;
  }
};

/**
 * Stamps the entry of the ban just applied as "member notified". Done once a channel really
 * delivered: a ban against a member with no address and no reachable device used to claim they had
 * been told, which is the one thing support relies on when they say they were never warned.
 */
export const markBanNotified = (bans: IBan[], bannedAt: Date): IBan[] => bans.map((ban) => (
  dayjs(ban.bannedAt).valueOf() === dayjs(bannedAt).valueOf() && !ban.notifiedAt
    ? { ...ban, notifiedAt: dayjs().toDate() }
    : ban
));

/**
 * Bans a user: records the ban in the history, blocks access (`banned` flag), revokes every
 * active session so an already-logged-in device is kicked out immediately, and notifies the
 * user by email and in-app notification.
 */
export const banUser = async (
  user: Parse.User,
  currentUser: Parse.User | undefined,
  options: { reason?: BanReason; type?: BanType; reasonDetails?: string; until?: Date; locale?: Locale } = {}
): Promise<Parse.User> => {
  const {
    reason = BanReasonEnum.OTHER,
    type = BanTypeEnum.TEMPORARY,
    reasonDetails,
    until,
    locale = DEFAULT_LANGUAGE,
  } = options;

  const prevBans: IBan[] = user.get('bans') || [];
  const ban: IBan = {
    bannedAt: dayjs().toDate(),
    ...(currentUser ? { bannedBy: toActorSnapshot(currentUser) } : {}),
    type,
    reason,
    reasonDetails,
    until: type === BanTypeEnum.TEMPORARY
      ? (until ?? dayjs().add(DEFAULT_BAN_DURATION_DAYS, 'day').toDate())
      : undefined,
  };

  user.set('bans', appendBan(prevBans, ban));
  user.set('banned', true);

  const updatedUser = await user.save(null, saveTriggerOptions);

  await createUserModerationLog({
    targetUser: updatedUser,
    action: UserModerationActionEnum.BANNED,
    performedBy: currentUser,
    reason,
    details: reasonDetails,
    until: ban.until,
    banType: type,
  });

  /*
   * sent, and waited for, before the sessions are revoked: the push goes to the devices those
   * sessions hold, and it is fired in the background by default — so the revocation destroyed the
   * device rows while it was still looking for them, and a member without an e-mail was told nothing.
   * The e-mail (or the login refusal message) stays the channel the ban is really read through.
   */
  const notification = await createNotification({
    type: ACCOUNT_NOTIFICATION_TYPE,
    to: [updatedUser],
    status: ACCOUNT_BANNED_STATUS,
  }, { awaitPush: true });
  const isPushed = await wasBanPushed(notification, updatedUser.id);

  await revokeAllUserSessionsService(updatedUser);

  // the ban is already effective: a failing email never fails it, it only leaves `notifiedAt` unset
  const isEmailed = await sendBanEmail(updatedUser, locale);

  if (!isPushed && !isEmailed) return updatedUser;

  const bans: IBan[] = updatedUser.get('bans') || [];

  updatedUser.set('bans', markBanNotified(bans, ban.bannedAt));

  return updatedUser.save(null, { ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });
};

/**
 * Blocks a user's account for a number of days and tells them why. Shared by every moderation
 * path that ends in a temporary block — the automatic report threshold, the manual decision an
 * operator makes from a report file, and the same decision made from a review — so a suspension
 * looks the same to the person receiving it whichever of them reached it.
 * @param userId the account to suspend
 * @param days how long the suspension lasts
 * @param trace who decided it and what from. `source` is **required** and stored on the account, so
 * the member can be told why they are suspended; `performedBy` is absent on an automatic threshold,
 * which nobody decided.
 * @param locale language of the notification email
 * @returns the suspended user
 */
export const suspendUserForDays = async (
  userId: string,
  days: number,
  trace: { performedBy?: Parse.User; source: SuspensionSourceEnum; reason?: string },
  locale: Locale = DEFAULT_LANGUAGE
): Promise<Parse.User> => {
  const user = await new Parse.Query(Parse.User).get(userId, USE_MASTER_KEY);
  const suspensionEnd = dayjs().add(days, 'day').toDate();
  // the person's own language: the caller's locale is the moderator's, not theirs
  const recipientLocale = (user.get('locale') ?? locale) as Locale;

  applyUserSuspension(user, {
    until: suspensionEnd,
    source: trace.source,
    reason: trace.reason,
  });
  await user.save(null, USE_MASTER_KEY);

  await createUserModerationLog({
    targetUser: user,
    action: UserModerationActionEnum.SUSPENDED_BY_POLICY,
    performedBy: trace.performedBy,
    // the log's reason is the moderator's wording when there is one, the trigger otherwise
    reason: trace.reason ?? trace.source,
    until: suspensionEnd,
  });

  // the e-mail never reached an account signed up by phone number: the app says it as well
  await createNotification({
    type: ACCOUNT_NOTIFICATION_TYPE,
    to: [user],
    status: ACCOUNT_SUSPENDED_STATUS,
    payload: { suspension: { until: suspensionEnd, source: trace.source } },
  });

  await sendEmailToUser(user, {
    subject: translate('email.preventiveSuspensionSubject', recipientLocale),
    message: translate('email.preventiveSuspensionMessage', recipientLocale, { days: String(days) }),
    locale: recipientLocale,
  });

  return user;
};

/**
 * Manually lifts a ban for a user, regardless of the ban type or expiration date.
 */
export const liftUserBan = async (
  user: Parse.User,
  locale: Locale = DEFAULT_LANGUAGE,
  liftedBy?: Parse.User
): Promise<Parse.User> => {
  const bans: IBan[] = user.get('bans') || [];

  user.set('banned', false);
  user.set('bans', closeBanInForce(bans, liftedBy ? toActorSnapshot(liftedBy) : undefined));

  const updatedUser = await user.save(null, saveTriggerOptions);

  await createUserModerationLog({
    targetUser: updatedUser,
    action: UserModerationActionEnum.BAN_LIFTED,
    performedBy: liftedBy,
    reason: bans[bans.length - 1]?.reason,
  });

  // the same in-app line as a ban that expired on its own — lifted early or served, the user is back
  await createNotification({
    type: ACCOUNT_NOTIFICATION_TYPE,
    to: [updatedUser],
    status: ACCOUNT_UNBANNED_STATUS,
  });

  // fire-and-forget — the unban is already effective; the email must not add Brevo's latency to this response
  sendAccountReactivatedEmail(updatedUser, updatedUser.get('locale') ?? locale).catch((error) => {
    logger.error('sendAccountReactivatedEmail failed', { userId: updatedUser.id, error: (error as Error).message });
  });

  return updatedUser;
};

/**
 * Clears the `banned` flag for every user whose latest ban is temporary and has expired.
 * Permanent bans are never auto-lifted. Called from a daily cron job.
 */
export const liftExpiredBans = async (): Promise<void> => {
  const now = dayjs();

  await new Parse.Query(Parse.User)
    .equalTo('banned', true)
    .select(['bans', 'email', 'firstName', 'lastName', 'locale'])
    .each(async (user: Parse.User) => {
      try {
        const bans: IBan[] = user.get('bans') || [];
        const latestBan = bans[bans.length - 1];

        if (latestBan?.type !== BanTypeEnum.TEMPORARY) return;
        if (!latestBan.until || dayjs(latestBan.until).isAfter(now)) return;

        user.set('banned', false);
        // no author: the ban ran its course, nobody lifted it
        user.set('bans', closeBanInForce(bans));
        const updatedUser = await user.save(null, saveTriggerOptions);

        await createUserModerationLog({
          targetUser: updatedUser,
          action: UserModerationActionEnum.BAN_EXPIRED,
          reason: latestBan.reason,
          until: latestBan.until,
          banType: latestBan.type,
        });

        await createNotification({
          type: ACCOUNT_NOTIFICATION_TYPE,
          to: [user],
          status: ACCOUNT_UNBANNED_STATUS,
        });

        await sendAccountReactivatedEmail(updatedUser, updatedUser.get('locale') ?? DEFAULT_LANGUAGE);

        logger.info(`Ban lifted for user ${user.id}`);
      }
      catch (error) {
        logger.error(`Error lifting ban for user ${user.id}`, {
          error: (error as Error)?.message,
          stack: (error as Error)?.stack,
        });
      }
    }, USE_MASTER_KEY);
};

export const deleteUser = async (
  user: Parse.User,
  currentUser: Parse.User,
  shouldSave = true
): Promise<void | Parse.User> => {
  user.set('deletedAt', dayjs().toDate());
  user.set('deletedBy', currentUser);

  // move image to recycle bin
  if (user.has('image')) {
    const file = await moveFileToRecycleBin(user.get('image').publicId);

    // update the database object
    user.set('image', file);
  }

  if (!shouldSave) return;
  const updatedUser = await user.save(null, USE_MASTER_KEY);

  // a deleted account must not keep a way in: every device is signed out, not only the one that asked
  await revokeAllUserSessionsService(user);

  // background jobs — do not block the HTTP response (Parse Jobs only accept JSON params, not Parse Objects)
  await runJob('deleteOrDestroyUserRelationsJob', { userId: user.id, type: 'delete' });
  await runJob('createUserAuditLogJob', { userId: user.id });

  return updatedUser;
};

/**
 * Erases for good the given accounts already moved to the bin, and tells the owners. Every account
 * is checked before the first is erased: an owner's or super-administrator's account in the batch,
 * refused halfway, would otherwise leave the accounts before it gone and the owners never told.
 * @param actor the back-office account erasing them
 * @param ids the accounts to erase — one not in the bin, or outside the actor's countries, is skipped
 * @returns how many accounts were erased
 */
export const destroyBinnedUsers = async (
  actor: Parse.User,
  ids: string[],
  locale: Locale = DEFAULT_LANGUAGE
): Promise<number> => {
  const users = await scopeToAgentCountries(new Parse.Query(Parse.User))
    .containedIn('objectId', ids)
    .equalTo('deleted', true)
    .limit(ids.length)
    .find(USE_MASTER_KEY);

  for (const user of users) {
    await assertCanActOnUser(actor, user, locale);
  }

  let destroyedCount = 0;

  try {
    for (const user of users) {
      await user.destroy(USE_MASTER_KEY);
      destroyedCount += 1;
    }
  }
  finally {
    // a failure partway still leaves accounts erased: the owners hear of those
    if (destroyedCount) {
      await alertOwners(OwnerAlertEventEnum.USERS_DESTROYED, actor, { count: String(destroyedCount) });
    }
  }

  return destroyedCount;
};

/*
 * `resetPasswordVerification` is selected alongside `verification`: password reset stores its code
 * in its own slot so requesting a reset in the middle of a sign-up no longer overwrites the
 * sign-up code (and vice versa).
 */
const VERIFICATION_SELECTED_FIELDS = [
  'email', 'verification', 'resetPasswordVerification', 'emailVerified', 'phoneVerified', 'phone',
  // what an SMS reset reads to tell an unused account from a live one (see passwordResetDelay service)
  'lastLoginAt', 'passwordResetDelay', 'locale',
  // what verifyAccount reads to move a confirmed sign-up on, and to tell a back-office account apart
  'registerStep', 'lastName', 'platform',
];

export const findUserByEmailWithVerification = async (email: string): Promise<Parse.User | undefined> => {
  return new Parse.Query(Parse.User)
    .equalTo('email', email)
    .select(VERIFICATION_SELECTED_FIELDS)
    .first(USE_MASTER_KEY);
};

/**
 * The account an email is a confirmed login identifier of — the lookup behind `loginWithEmail`.
 * Both conditions matter: an unconfirmed email proves nothing about who typed it, and a
 * soft-deleted account no longer signs in. Only the `username` is read, since that is what the real
 * `Parse.User.logIn` needs to check the password.
 * @param email already trimmed and lower-cased, the way emails are stored
 */
export const findUserByVerifiedEmail = async (email: string): Promise<Parse.User | undefined> => {
  return new Parse.Query(Parse.User)
    .equalTo('email', email)
    .equalTo('emailVerified', true)
    .notEqualTo('deleted', true)
    .select(['username'])
    .first(USE_MASTER_KEY);
};

/**
 * @param requireVerified restricts the match to accounts that confirmed the number by OTP. Callers
 * that hand out control of the account (a password reset) must set it: an email account types its
 * number at sign-up without ever confirming it, so an unverified number proves nothing about who
 * is holding the phone. The sign-up OTP check itself is the one caller that cannot — the number it
 * confirms is unverified by definition until it succeeds.
 * @param forUserId restricts the match to that account. An unverified number is not unique — two
 * sign-ups can be holding the same one at the same time — so resolving it by number alone would
 * pick one of them at random and could confirm the number on the wrong account. Every signed-in
 * caller (both sign-up OTP steps) passes its own id and gets an unambiguous answer.
 */
export const findUserByPhoneWithVerification = async (
  phoneNumber: string,
  {
    requireVerified = false,
    forUserId,
  }: { requireVerified?: boolean; forUserId?: string } = {}
): Promise<Parse.User | undefined> => {
  const query = new Parse.Query(Parse.User)
    .equalTo('phone.number', normalizePhoneNumber(phoneNumber))
    .select(VERIFICATION_SELECTED_FIELDS);

  if (requireVerified) query.equalTo('phoneVerified', true);
  if (forUserId) query.equalTo('objectId', forUserId);

  return query.first(USE_MASTER_KEY);
};

export const saveUserVerificationCode = async (
  user: Parse.User,
  channel: VerificationChannel
): Promise<Parse.User> => {
  // generate verification code, bound to the contact it is sent to
  const verification = generateEncryptedVerificationCode(undefined, channel);

  user.set('verification', verification);

  // save user with verification code
  const updatedUser = await user.save(null, USE_MASTER_KEY);

  return updatedUser;
};

export const sendVerificationCodeToEmail = async (user: Parse.User, locale: Locale): Promise<void> => {
  try {
    const decryptedCode = getDecryptedUserCode(user) as string;

    // send email and create the contact in parallel — independent operations
    await Promise.all([
      sendEmailVerification(toEmailRecipient(user), decryptedCode, locale),
      /*
       * this will shallow an error if the contact already exists in the email service
       * so no need to worry about it
       */
      createContactToCloud(user),
    ]);
  }
  catch (error) {
    logger.error('Error sending verification code to email', { error: (error as Error).stack });
    throw new Error(translate('error.sendingVerificationCode', locale));
  }
};

/**
 * Sends the code already stored on the account to its email — fire-and-forget so the email
 * provider's latency does not add to the afterSave trigger response. A sign-up account is created
 * with its code (see the User beforeSave), so there is nothing left to save.
 */
export const sendStoredCodeToEmail = (user: Parse.User, locale: Locale): void => {
  sendVerificationCodeToEmail(user, locale).catch((error) => {
    logger.error('sendVerificationCodeToEmail failed', { userId: user.id, error: (error as Error).message });
  });
};

/**
 * generate verification code and send it to the user email
 * it's called in the _User afterSave trigger when the user is created
 * @param user
 * @param locale
 */
export const saveUserAndSendCodeToEmail = async (user: Parse.User, locale: Locale): Promise<Parse.User> => {
  // 1. generate and save verification code — must complete so the code exists in DB before the trigger responds
  const updatedUser = await saveUserVerificationCode(user, 'email');

  sendStoredCodeToEmail(updatedUser, locale);

  return updatedUser;
};

/**
 * Test and local environments confirm a sign-up on the spot; production never does. The one place
 * the sign-up triggers read that bypass, so a sign-up's real path has no test branch of its own.
 * @param field the contact flag the sign-up would otherwise wait on a code to raise
 * @param isBackOffice a back-office account is also confirmed on the spot in local development
 * @returns whether the account was confirmed here (and saved)
 */
export const autoConfirmSignUpIfAllowed = async (
  user: Parse.User,
  field: 'emailVerified' | 'phoneVerified',
  isBackOffice = false
): Promise<boolean> => {
  const isAllowed = isBackOffice ? IS_LOCAL || IS_TEST : SKIP_SIGN_UP_VERIFICATION;

  if (!isAllowed) return false;

  user.set(field, true);
  await user.save(null, { ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });

  return true;
};

/**
 * Texts the sign-up code to the phone number on the account.
 * @returns whether the SMS provider accepted the text; `false` is a refusal (no credit left, a
 *   number it cannot reach), which the caller must surface: nobody else knows the code is not coming
 */
export const sendVerificationCodeToPhone = async (user: Parse.User, locale: Locale): Promise<boolean> => {
  try {
    const decryptedCode = getDecryptedUserCode(user) as string;
    const { number: phoneNumber, code: dialCode } = user.get('phone') ?? {};

    return await sendSmsVerification(phoneNumber, decryptedCode, locale, dialCode);
  }
  catch (error) {
    logger.error('Error sending verification code to phone', { error: (error as Error).stack });
    throw new Error(translate('error.sendingVerificationCode', locale));
  }
};

/**
 * Every sign-up that never confirmed the contact it was created with, and has been sitting there
 * longer than the grace period. Such an account can do nothing at all:
 * - a phone sign-up cannot sign in (`loginWithPhone` requires `phoneVerified`) and has no email to
 *   fall back on;
 * - an email sign-up cannot sign in either (the login refuses a non-confirmed account), yet it keeps
 *   holding the address, which then reads "already used" for its real owner.
 */
const getStaleUnverifiedSignupsQuery = (before: Date): Parse.Query<Parse.User> => {
  const phoneSignUps = new Parse.Query(Parse.User)
    .equalTo('registerStep', RegisterStepEnum.VERIFY_PHONE)
    .notEqualTo('phoneVerified', true)
    // an email account waiting at the phone step can still sign in with its email: never abandoned
    .doesNotExist('email')
    .lessThan('createdAt', before);
  // never confirmed: `emailVerified` true means the member can sign in, so it is never purged
  const emailSignUps = new Parse.Query(Parse.User)
    .equalTo('registerStep', RegisterStepEnum.VERIFY_EMAIL)
    .notEqualTo('emailVerified', true)
    .lessThan('createdAt', before);

  return Parse.Query.or(phoneSignUps, emailSignUps);
};

/**
 * Frees a phone number held by an abandoned, never-confirmed sign-up so a new one can take it.
 *
 * Parse enforces `username` uniqueness, and a phone sign-up claims `+<code><number>` as its
 * username the moment it is created — before the OTP. Whoever typed a number that wasn't theirs,
 * or simply closed the app, therefore locked that number out of the platform for good: its real
 * owner got "this username already exists", and the abandoner could not resume either, having no
 * email to sign in with.
 *
 * Destroying the pending account gives up nothing: it was never verified, so nobody has proven
 * they own it, and the sign-up replacing it still has to pass the same OTP on the real handset
 * before it becomes usable.
 */
export const releaseUnverifiedPhoneSignup = async (phoneNumber?: string): Promise<void> => {
  if (!phoneNumber) return;

  const pendingSignUps = await new Parse.Query(Parse.User)
    .equalTo('phone.number', phoneNumber)
    .notEqualTo('phoneVerified', true)
    .equalTo('registerStep', RegisterStepEnum.VERIFY_PHONE)
    // an email account at the phone step typed this number without proving it: it keeps its account
    .doesNotExist('email')
    .select(['objectId'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  if (!pendingSignUps.length) return;

  await Parse.Object.destroyAll(pendingSignUps, { ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });
  logger.info('Released phone numbers held by unverified sign-ups', { count: pendingSignUps.length });
};

/**
 * Frees an email address held by a never-confirmed email sign-up so a new one can take it — the
 * same rule as for a phone number (`releaseUnverifiedPhoneSignup`): an address only typed proves
 * nothing, and the sign-up replacing it still has to read the code sent to that address.
 */
export const releaseUnverifiedEmailSignup = async (email?: string): Promise<void> => {
  if (!email) return;

  const pendingSignUps = await new Parse.Query(Parse.User)
    .equalTo('email', email)
    .equalTo('registerStep', RegisterStepEnum.VERIFY_EMAIL)
    .notEqualTo('emailVerified', true)
    .select(['objectId'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  if (!pendingSignUps.length) return;

  await Parse.Object.destroyAll(pendingSignUps, { ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });
  logger.info('Released emails held by unverified sign-ups', { count: pendingSignUps.length });
};

/**
 * Destroys the sign-ups that never confirmed their phone number and are past the retention window
 * — the sweep behind `UNVERIFIED_PHONE_SIGNUP_RETENTION_HOURS`. Called from a daily cron job.
 */
export const purgeUnverifiedPhoneSignups = async (): Promise<number> => {
  const before = dayjs().subtract(UNVERIFIED_PHONE_SIGNUP_RETENTION_HOURS, 'hour').toDate();

  let purgedCount = 0;

  await getStaleUnverifiedSignupsQuery(before)
    .select(['objectId'])
    .each(async (user: Parse.User) => {
      try {
        await user.destroy({ ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });
        purgedCount += 1;
      }
      catch (error) {
        logger.error('Failed to purge unverified account', { userId: user.id, error: (error as Error).message });
      }
    }, USE_MASTER_KEY);

  logger.info(`purgeUnverifiedPhoneSignups: ${purgedCount} unverified sign-up(s) destroyed`);

  return purgedCount;
};

/**
 * Texts the sign-up code unless the number or the connection already used up its daily allowance.
 * Never throws: whatever goes wrong is answered with the reason to record.
 * @returns why the text did not go out, `undefined` when the provider accepted it
 */
const sendSignUpCodeSms = async (
  user: Parse.User,
  locale: Locale,
  ip?: string
): Promise<VerificationSmsErrorEnum | undefined> => {
  try {
    const quota = await consumeSmsSendQuota({ phoneNumber: user.get('phone')?.number, ip });

    if (!quota.isAllowed) {
      logger.warn('Sign-up verification SMS skipped: daily cap reached', { userId: user.id });
      return VerificationSmsErrorEnum.RATE_LIMITED;
    }

    if (await sendVerificationCodeToPhone(user, locale)) return undefined;

    logger.error('Sign-up verification SMS was not sent: the provider refused it', { userId: user.id });
    return VerificationSmsErrorEnum.FAILED;
  }
  catch (error) {
    logger.error('Sign-up verification SMS failed', { userId: user.id, error: (error as Error).message });
    return VerificationSmsErrorEnum.FAILED;
  }
};

/**
 * Writes the outcome of the sign-up SMS on the account — the only way the app can learn it, since
 * the text is sent while the account is created. A success erases a failure left by an earlier try.
 * Saved without triggers: this is bookkeeping, not a profile edit.
 */
const writeVerificationSmsOutcome = async (
  user: Parse.User,
  smsError: VerificationSmsErrorEnum | undefined
): Promise<void> => {
  if (smsError) user.set('verificationSmsError', smsError);
  else if (user.has('verificationSmsError')) user.unset('verificationSmsError');
  else return;

  await user.save(null, { ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });
};

/**
 * Erases the "code not sent" flag once a resend went through, so the verification screen stops
 * telling the member the code is not coming.
 */
export const clearVerificationSmsError = (user: Parse.User): Promise<void> => (
  writeVerificationSmsOutcome(user, undefined)
);

/**
 * Texts the code already stored on the account and records the outcome on it. A sign-up account is
 * created with its code (see the User beforeSave), so only the sending is left to do.
 */
export const sendStoredCodeToPhone = async (
  user: Parse.User,
  locale: Locale,
  ip?: string
): Promise<void> => {
  await writeVerificationSmsOutcome(user, await sendSignUpCodeSms(user, locale, ip));
};

/**
 * generate verification code and send it to the user phone
 * it's called in the _User afterSave trigger when the user is created via phone sign-up
 *
 * The text is awaited, not fired and forgotten: its outcome is written on the account
 * (`verificationSmsError`), and the app reads it as soon as the verification screen opens. A refusal
 * from the SMS provider used to be swallowed here, leaving the member waiting for a code that never
 * came.
 * @param user
 * @param locale
 * @param ip the address the sign-up came from, counted against the daily SMS cap of that address
 */
export const saveUserAndSendCodeToPhone = async (
  user: Parse.User,
  locale: Locale,
  ip?: string
): Promise<Parse.User> => {
  // 1. generate and save verification code — must complete so the code exists in DB before the trigger responds
  const updatedUser = await saveUserVerificationCode(user, 'phone');

  // 2. send verification code to phone and keep the outcome where the app can read it
  await sendStoredCodeToPhone(updatedUser, locale, ip);

  return updatedUser;
};

/**
 * One account for the back-office user page: only the page's columns (see `USER_DETAILS_FIELDS`),
 * and, of the requested pointers to other accounts, only their name, email and photo.
 * @param id the account
 * @param include the pointers the page asks for — any outside `USER_DETAILS_POINTER_FIELDS` is ignored
 * @returns the account, or undefined when it does not exist
 */
export const getUserDetailsById = async (
  id: string,
  include: string[] = []
): Promise<Parse.User | undefined> => {
  const pointerFields = include.filter((field) => USER_DETAILS_POINTER_FIELDS.includes(field));
  const pointerKeys = pointerFields.flatMap((field) => [
    field,
    ...USER_DETAILS_POINTER_SUBFIELDS.map((subField) => `${field}.${subField}`),
  ]);

  return new Parse.Query(Parse.User)
    .equalTo('objectId', id)
    .select([...USER_DETAILS_FIELDS, ...pointerKeys])
    .include(pointerFields)
    .first(USE_MASTER_KEY);
};

/**
 * Cuts `mfa` down to whether it is on and since when, on an account about to be sent to the
 * back-office: the encrypted secret and the backup codes never leave the server. Only on the copy
 * being answered with — it must run after any save of that object, or the save would write the
 * cut-down value back over the real secret. A clean copy is built rather than the value `set` on
 * the object: an object with a pending change is not sent back whole by Cloud Code.
 * @param user the account read by `getUserDetailsById`
 * @returns a copy of the account, redacted
 */
export const redactUserDetailsSecrets = (user: Parse.User): Parse.User => {
  const mfa = user.get('mfa');

  if (!mfa) return user;

  return Parse.User.fromJSON({
    ...user.toJSON(),
    className: '_User',
    mfa: { enabled: !!mfa.enabled, enabledAt: mfa.enabledAt, isLocked: isMfaLocked(mfa) },
  });
};
