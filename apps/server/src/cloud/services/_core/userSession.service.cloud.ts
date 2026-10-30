import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy.js';

import type { Locale } from '@/types/app.type';
import type { NotificationChannelRecipient, NotificationChannelSender } from '@/types/notification.type';
import type { AdminUserSession, IUserSession, Platform } from '@/types/userSession.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import {
  collections, DEFAULT_QUERY_LIMIT, DISABLE_TRIGGERS_CONTEXT, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { ACCOUNT_NOTIFICATION_TYPE, NEW_DEVICE_LOGIN_STATUS } from '@/constants/_core/notification.constants';
import { PUSH_SESSIONS_PAGE_SIZE } from '@/constants/_core/push.constants';
import {
  NEW_DEVICE_LOGIN_ALERTS_MAX_PER_DAY, SHARED_PUSH_TOKEN_ROWS_LIMIT,
} from '@/constants/_core/userSession.constants';
import { NotificationChannelEnum, NotificationChannelStatusEnum } from '@/types/notification.type';
import { logger } from '@/utils/_core/logger';
import { getSessionSignInMethod } from '@/utils/_core/session.utils';
import { setValues } from '@/utils/_core/utils';

import {
  createNotification, getNotificationMessageTemplate, registerNotificationChannelSender,
  setNotificationChannelRecipients,
} from './notification.service.cloud';
import { createSessionAuditLog } from './sessionAuditLog.service.cloud';
import { sendNewDeviceLoginEmail } from '../../emails/_core/user.email';
import { sendNewDeviceLoginSms } from '../../sms/_core/user.sms.cloud';
import { assertCanActOnUser } from '../../utils/_core/role.utils.cloud';
import { toUserSnapshot } from '../../utils/_core/user-snapshot.utils.cloud';

export const UserSession = Parse.Object.extend('UserSession');

const USER_SESSION_PROPERTIES = [
  'user', 'sessionToken', 'deviceId', 'deviceName', 'platform', 'appVersion', 'lastActiveAt', 'pushToken',
];

type RegisterSessionInput = {
  deviceId: string;
  deviceName: string;
  platform: Platform;
  appVersion?: string;
};

const findUserSessionForDevice = async (
  user: Parse.User,
  deviceId: string
): Promise<Parse.Object | undefined> => new Parse.Query(collections.UserSession)
  .equalTo('user', user)
  .equalTo('deviceId', deviceId)
  .select(USER_SESSION_PROPERTIES)
  .first(USE_MASTER_KEY);

/**
 * Writes `values` on the UserSession row keyed by (user, deviceId), creating it on the device's
 * first registration — shared by registerSessionService and registerPushTokenService so push
 * permission granted before/after registerSession still lands on the same row.
 *
 * The app fires both calls in parallel at login, so both can find no row and both try to create
 * one. The unique (user, deviceId) index lets only one insert through; the loser gets a duplicate
 * error and applies its values to the row the winner created instead of leaving a second row
 * behind — a second row is how a push token ended up on a row no logout would ever clear.
 * @returns the saved row, and whether registerSession had already named this device before the
 * write — a row only registerPushToken wrote names no device
 */
const upsertUserSessionForDevice = async (
  user: Parse.User,
  deviceId: string,
  values: Record<string, unknown>
): Promise<{ session: Parse.Object; isDeviceKnown: boolean }> => {
  const existing = await findUserSessionForDevice(user, deviceId);
  const session = existing ?? new UserSession();
  const isDeviceKnown = Boolean(existing?.get('deviceName'));

  setValues(session, { ...values, user, deviceId }, USER_SESSION_PROPERTIES);

  try {
    return { session: await session.save(null, USE_MASTER_KEY), isDeviceKnown };
  }
  catch (error) {
    if (existing || (error as Parse.Error).code !== Parse.Error.DUPLICATE_VALUE) throw error;

    const winner = await findUserSessionForDevice(user, deviceId);

    if (!winner) throw error;

    const isWinnerDeviceKnown = Boolean(winner.get('deviceName'));

    setValues(winner, { ...values, user, deviceId }, USER_SESSION_PROPERTIES);

    return { session: await winner.save(null, USE_MASTER_KEY), isDeviceKnown: isWinnerDeviceKnown };
  }
};

/**
 * Removes a push token from every device row holding it, except `exceptSessionId`. A token names
 * one phone, not one account: after an account switch or on a shared phone the previous account's
 * row still carried it, and every push meant for that account landed on the new one.
 */
const clearPushTokenFromSessions = async (pushToken: string, exceptSessionId?: string): Promise<void> => {
  const query = new Parse.Query(collections.UserSession)
    .equalTo('pushToken', pushToken)
    .select(['objectId'])
    .limit(SHARED_PUSH_TOKEN_ROWS_LIMIT);

  if (exceptSessionId) query.notEqualTo('objectId', exceptSessionId);

  const sessions = await query.find(USE_MASTER_KEY);

  await Promise.all(sessions.map(async (session) => {
    session.unset('pushToken');
    await session.save(null, USE_MASTER_KEY);
  }));
};

/**
 * How many "new device" alerts this account was sent over the last 24 hours — soft-deleted ones
 * included, so hiding an alert in the app does not make room for another SMS.
 */
const countRecentNewDeviceLoginAlerts = async (user: Parse.User): Promise<number> => (
  new Parse.Query(collections.Notification)
    .equalTo('to', user)
    .equalTo('type', ACCOUNT_NOTIFICATION_TYPE)
    .equalTo('status', NEW_DEVICE_LOGIN_STATUS)
    .greaterThan('createdAt', dayjs().subtract(1, 'day').toDate())
    .count(USE_MASTER_KEY)
);

/**
 * Alerts the user (push always, plus email or SMS as the second channel) that their account was
 * just used to log in from a device never seen before. Never sent for a user's very first-ever
 * session (that's just their signup, not a suspicious login).
 *
 * SMS is reserved for accounts that have no email on file (phone-only signup) — for everyone
 * else email is free and already reliable, and the phone number may not even be the recipient's
 * own, so it's not worth the per-SMS cost as a second channel on top of email.
 *
 * Awaited (not fire-and-forget) by registerSessionService, but errors are swallowed there —
 * the mobile client already dispatches registerSession itself as a best-effort call it doesn't
 * block its own UI on, so nothing upstream is waiting on this; a notify failure must not fail
 * session registration, which already succeeded by this point.
 *
 * `message`/`snapshot` are set explicitly rather than left to the generic beforeSave/afterSave
 * triggers: this alert has no entry in the type/status message registry the beforeSave reads, and
 * the row should already carry who it is about before the afterSave saves its own copy. The push
 * itself is left to the afterSave — sending it here too would push the same alert twice.
 */
const notifyNewDeviceLogin = async (
  user: Parse.User,
  deviceName: string,
  locale: Locale
): Promise<void> => {
  const userSnapshot = toUserSnapshot(user);
  // one channel or the other, never both — the key set records which one was actually targeted
  const hasEmail = Boolean(user.get('email'));
  const channel = hasEmail ? NotificationChannelEnum.EMAIL : NotificationChannelEnum.SMS;

  const notification = await createNotification({
    type: ACCOUNT_NOTIFICATION_TYPE,
    to: [user],
    from: user,
    status: NEW_DEVICE_LOGIN_STATUS,
    message: getNotificationMessageTemplate(ACCOUNT_NOTIFICATION_TYPE, NEW_DEVICE_LOGIN_STATUS),
    snapshot: { from: userSnapshot, to: [userSnapshot] },
    // the device is all the alert names, and all a resend needs to write it again
    payload: { device: { name: deviceName } },
    channels: { [channel]: [{ toId: user.id, status: NotificationChannelStatusEnum.PENDING }] },
  });

  let recipients: NotificationChannelRecipient[];

  if (hasEmail) {
    recipients = await sendNewDeviceLoginEmail(user, deviceName, locale);
  } else {
    recipients = await sendNewDeviceLoginSms(user, deviceName, locale);
  }

  if (notification) {
    await setNotificationChannelRecipients(notification.id, channel, recipients);
  }
};

/**
 * Writes a new-device alert again on the channel it went out on, in the recipient's own language.
 * Only the alerts raised since the device name is kept on the send can be rebuilt: an older one names
 * no device, and an alert about "a device" would be no alert at all.
 */
const createNewDeviceLoginSender = (
  send: (user: Parse.User, deviceName: string, locale: Locale) => Promise<NotificationChannelRecipient[]>
): NotificationChannelSender => async (notification, recipients) => {
  const deviceName: string | undefined = notification.get('payload')?.device?.name;

  if (notification.get('status') !== NEW_DEVICE_LOGIN_STATUS || !deviceName) return undefined;

  const outcomes = await Promise.all(recipients.map((recipient) => (
    send(recipient, deviceName, (recipient.get('locale') ?? DEFAULT_LANGUAGE) as Locale)
  )));

  return outcomes.flat();
};

registerNotificationChannelSender(
  ACCOUNT_NOTIFICATION_TYPE,
  NotificationChannelEnum.EMAIL,
  createNewDeviceLoginSender(sendNewDeviceLoginEmail)
);
registerNotificationChannelSender(
  ACCOUNT_NOTIFICATION_TYPE, NotificationChannelEnum.SMS, createNewDeviceLoginSender(sendNewDeviceLoginSms)
);

/**
 * Update or insert a UserSession row keyed by (user, deviceId) so re-logging in from the same
 * device updates the existing row instead of creating a duplicate.
 */
export const registerSessionService = async (
  user: Parse.User,
  values: RegisterSessionInput,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<Parse.Object> => {
  /*
   * a row only registerPushToken has written (it names no device) still counts as a new device:
   * the push permission simply won the race against registerSession at login
   */
  const { session: savedSession, isDeviceKnown } = await upsertUserSessionForDevice(
    user,
    values.deviceId,
    { ...values, sessionToken: user.getSessionToken(), lastActiveAt: new Date() }
  );

  if (isDeviceKnown) return savedSession;

  const hadPriorSession = await new Parse.Query(collections.UserSession)
    .equalTo('user', user)
    .notEqualTo('objectId', savedSession.id)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  if (!hadPriorSession) return savedSession;

  /*
   * capped per day: each new device id can cost an SMS (accounts without an e-mail), and the device
   * id is whatever the caller sends — the login itself is never refused, only the repeat alert
   */
  if (await countRecentNewDeviceLoginAlerts(user) >= NEW_DEVICE_LOGIN_ALERTS_MAX_PER_DAY) {
    logger.warn('notifyNewDeviceLogin skipped: daily alert cap reached', { userId: user.id });
    return savedSession;
  }

  await notifyNewDeviceLogin(user, values.deviceName, locale).catch((error) => {
    logger.error('notifyNewDeviceLogin failed', { userId: user.id, error: (error as Error).message });
  });

  return savedSession;
};

/**
 * Stores this device's Expo push token on its UserSession row. Kept per-device (not on
 * Parse.User) so a user logged in on several devices gets pushed on all of them, and so the
 * token is destroyed for free when the session is (afterLogout — see auth.triggers.ts). The
 * session token is written too: a row created here before registerSession ran would otherwise
 * name no session, and the logout cleanup — which finds rows by session token — would miss it.
 */
export const registerPushTokenService = async (
  user: Parse.User,
  deviceId: string,
  pushToken: string
): Promise<Parse.Object> => {
  const { session } = await upsertUserSessionForDevice(user, deviceId, {
    pushToken,
    sessionToken: user.getSessionToken(),
  });

  await clearPushTokenFromSessions(pushToken, session.id);

  return session;
};

/**
 * Forgets this device's push token for the signed-in user — called by the app right before it
 * logs out, so a phone handed over or switched to another account stops receiving this account's
 * pushes even when the logout request itself never reaches the server.
 */
export const unregisterPushTokenService = async (user: Parse.User, deviceId: string): Promise<void> => {
  const session = await findUserSessionForDevice(user, deviceId);

  if (!session?.get('pushToken')) return;

  session.unset('pushToken');
  await session.save(null, USE_MASTER_KEY);
};

/**
 * Every device row of these users that holds a push token. Read page by page: the recipients of
 * one notification can hold more rows than a single query returns, and stopping at the first page
 * silently left the remaining devices without their push.
 */
export const getUserSessionsWithPushTokenService = async (users: Parse.User[]): Promise<Parse.Object[]> => {
  if (users.length === 0) return [];

  const sessions: Parse.Object[] = [];
  let lastId: string | undefined;

  while (true) {
    // keyset pagination on the id: stable even if a row is written while the pages are read
    const query = new Parse.Query(collections.UserSession)
      .containedIn('user', users)
      .exists('pushToken')
      .select(['user', 'pushToken'])
      .include('user')
      .ascending('objectId')
      .limit(PUSH_SESSIONS_PAGE_SIZE);

    if (lastId) query.greaterThan('objectId', lastId);

    const page = await query.find(USE_MASTER_KEY);

    sessions.push(...page);

    if (page.length < PUSH_SESSIONS_PAGE_SIZE) break;
    lastId = page.at(-1)?.id;
  }

  return sessions;
};

/**
 * Clears a stale Expo push token (e.g. after an Expo push receipt reports
 * DeviceNotRegistered) without touching the rest of the UserSession row — the session itself
 * may still be valid, only push delivery to it is broken.
 */
export const clearStalePushTokenService = async (pushToken: string): Promise<void> => {
  await clearPushTokenFromSessions(pushToken);
};

/**
 * Destroys the device rows that hold neither a push token nor a session token: nothing can be
 * pushed to them and no live session names them. They pile up as tokens are cleared
 * (DeviceNotRegistered, account switch, logout from the app) on devices that never log in again.
 * @returns the number of rows destroyed
 */
export const purgeOrphanUserSessionsService = async (): Promise<number> => {
  let purged = 0;

  while (true) {
    // always the first page: every row found is destroyed, so the next ones move up to offset 0
    const batch = await new Parse.Query(collections.UserSession)
      .doesNotExist('pushToken')
      .doesNotExist('sessionToken')
      .select(['objectId'])
      .limit(DEFAULT_QUERY_LIMIT)
      .find(USE_MASTER_KEY);

    if (batch.length === 0) break;

    await Parse.Object.destroyAll(batch, USE_MASTER_KEY);
    purged += batch.length;

    if (batch.length < DEFAULT_QUERY_LIMIT) break;
  }

  return purged;
};

export const getUserSessionsService = async (user: Parse.User): Promise<IUserSession[]> => {
  const sessions = await new Parse.Query(collections.UserSession)
    .equalTo('user', user)
    .select(['deviceId', 'deviceName', 'platform', 'appVersion', 'lastActiveAt', 'sessionToken'])
    .descending('lastActiveAt')
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  return sessions as unknown as IUserSession[];
};

const deleteSessionTokenService = async (sessionToken: string): Promise<void> => {
  const parseSession = await new Parse.Query(Parse.Session)
    .equalTo('sessionToken', sessionToken)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  if (parseSession) {
    await parseSession.destroy(USE_MASTER_KEY);
  }
};

export const revokeSessionService = async (
  user: Parse.User,
  sessionId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  const session = await new Parse.Query(collections.UserSession)
    .equalTo('user', user)
    .get(sessionId, USE_MASTER_KEY)
    .catch(() => undefined);

  if (!session) {
    throw new Error(translate('error.sessionNotFound', locale));
  }

  await deleteSessionTokenService(session.get('sessionToken'));
  await session.destroy(USE_MASTER_KEY);
};

/**
 * Deletes the UserSession row matching a Parse session token.
 * Called from the afterLogout trigger so stale rows don't linger after a normal logout.
 */
export const deleteUserSessionByTokenService = async (sessionToken: string): Promise<void> => {
  const session = await new Parse.Query(collections.UserSession)
    .equalTo('sessionToken', sessionToken)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  if (session) {
    await session.destroy(USE_MASTER_KEY);
  }
};

/**
 * Flags an account that just signed out as offline — unless it is still signed in somewhere else,
 * in which case it really is online. Called from the afterLogout trigger, where the session's
 * `user` is a bare pointer: the flag is written on that pointer, with no triggers, since it is
 * presence bookkeeping and not an edit of the profile.
 */
export const markUserOfflineAfterLogoutService = async (user: Parse.User): Promise<void> => {
  const remainingSessionsCount = await new Parse.Query(Parse.Session)
    .equalTo('user', user)
    .count(USE_MASTER_KEY);

  if (remainingSessionsCount > 0) return;

  user.set('isOnline', false);
  await user.save(null, { ...USE_MASTER_KEY, ...DISABLE_TRIGGERS_CONTEXT });
};

/**
 * Destroys a user's Parse sessions and UserSession rows, optionally sparing the one bound to
 * `exceptSessionToken`. Parse sessions are queried on their own (not only through UserSession
 * rows) so a login that never registered a device row — the back-office, a failed
 * registerSession — is revoked too.
 * @returns the number of UserSession rows destroyed, i.e. the devices the user could see listed
 */
const destroyUserSessions = async (user: Parse.User, exceptSessionToken?: string): Promise<number> => {
  const parseSessionsQuery = new Parse.Query(Parse.Session).equalTo('user', user);
  const userSessionsQuery = new Parse.Query(collections.UserSession).equalTo('user', user);

  if (exceptSessionToken) {
    parseSessionsQuery.notEqualTo('sessionToken', exceptSessionToken);
    userSessionsQuery.notEqualTo('sessionToken', exceptSessionToken);
  }

  const [parseSessions, userSessions] = await Promise.all([
    parseSessionsQuery.select(['objectId']).limit(DEFAULT_QUERY_LIMIT).find(USE_MASTER_KEY),
    userSessionsQuery.select(['objectId']).limit(DEFAULT_QUERY_LIMIT).find(USE_MASTER_KEY),
  ]);

  await Promise.all([
    ...parseSessions.map((session) => session.destroy(USE_MASTER_KEY)),
    ...userSessions.map((session) => session.destroy(USE_MASTER_KEY)),
  ]);

  return userSessions.length;
};

/**
 * Revokes every active Parse session and UserSession row for a user.
 * Called when a user is banned so an already-logged-in device is kicked out immediately,
 * instead of only blocking the next login attempt.
 */
export const revokeAllUserSessionsService = async (user: Parse.User): Promise<void> => {
  await destroyUserSessions(user);
};

/**
 * "Log out all other devices": revokes every session of the user except the one making the call,
 * so the device the user is holding stays signed in.
 * @returns the number of devices logged out
 */
export const revokeOtherSessionsService = async (
  user: Parse.User,
  currentSessionToken: string
): Promise<number> => {
  return destroyUserSessions(user, currentSessionToken);
};

/**
 * The account a back-office agent acts on — only its id is needed, the sessions are read by pointer
 */
const getTargetUserForAdmin = async (userId: string, locale: Locale): Promise<Parse.User> => {
  const user = await new Parse.Query(Parse.User)
    .select(['objectId'])
    .get(userId, USE_MASTER_KEY)
    .catch(() => undefined);

  if (!user) {
    throw new Error(translate('error.userNotFound', locale));
  }

  return user;
};

/**
 * Every session of a user that can still reach the API, as the back-office lists it for support.
 * Read from Parse's own `_Session` rather than from the device rows: a login that never registered
 * a device (the back-office, a support session, a failed registerSession) is still a way into the
 * account, and a device row whose session expired is not one any more. The device row, when there
 * is one, only names the device.
 */
export const getActiveSessionsForAdminService = async (
  userId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<AdminUserSession[]> => {
  const user = await getTargetUserForAdmin(userId, locale);

  const parseSessions = await new Parse.Query(Parse.Session)
    .equalTo('user', user)
    .greaterThan('expiresAt', new Date())
    .select(['sessionToken', 'createdWith', 'createdAt'])
    .descending('createdAt')
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  if (parseSessions.length === 0) return [];

  const devices = await new Parse.Query(collections.UserSession)
    .equalTo('user', user)
    .containedIn('sessionToken', parseSessions.map((session) => session.get('sessionToken')))
    .select(['sessionToken', 'deviceName', 'platform', 'appVersion', 'lastActiveAt'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);
  const deviceByToken = new Map(devices.map((device) => [device.get('sessionToken'), device]));

  const sessions = parseSessions.map((session): AdminUserSession => {
    const device = deviceByToken.get(session.get('sessionToken'));

    return {
      id: session.id,
      deviceName: device?.get('deviceName'),
      platform: device?.get('platform'),
      appVersion: device?.get('appVersion'),
      signedInAt: device?.get('lastActiveAt') ?? session.createdAt,
      signInMethod: getSessionSignInMethod(session.get('createdWith')),
    };
  });

  // a device re-registers on every login, so its own date can be newer than the session's creation
  return orderBy(sessions, (session) => session.signedInAt.getTime(), 'desc');
};

/**
 * Signs a user out of one device from the back-office: destroys the Parse session (the app is
 * signed out on its next request) and the device row that named it, and records who did it.
 * Scoped by `user` so an id belonging to another account is answered as not found.
 */
export const revokeSessionForAdminService = async (
  admin: Parse.User,
  userId: string,
  sessionId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  const user = await getTargetUserForAdmin(userId, locale);

  await assertCanActOnUser(admin, user, locale);

  const parseSession = await new Parse.Query(Parse.Session)
    .equalTo('user', user)
    .select(['sessionToken'])
    .get(sessionId, USE_MASTER_KEY)
    .catch(() => undefined);

  if (!parseSession) {
    throw new Error(translate('error.sessionNotFound', locale));
  }

  const sessionToken: string = parseSession.get('sessionToken');
  const device = await new Parse.Query(collections.UserSession)
    .equalTo('sessionToken', sessionToken)
    .select(['deviceName'])
    .first(USE_MASTER_KEY);

  await parseSession.destroy(USE_MASTER_KEY);
  if (device) await device.destroy(USE_MASTER_KEY);

  await createSessionAuditLog({
    action: 'session_revoked',
    targetUserId: user.id,
    performedBy: admin,
    deviceName: device?.get('deviceName'),
  });
};

/**
 * "Sign out all devices" from the back-office — the stolen-phone case: every session of the user
 * is closed, then the action is recorded against the agent who took it.
 */
export const revokeAllSessionsForAdminService = async (
  admin: Parse.User,
  userId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  const user = await getTargetUserForAdmin(userId, locale);

  await assertCanActOnUser(admin, user, locale);
  await revokeAllUserSessionsService(user);

  await createSessionAuditLog({ action: 'all_sessions_revoked', targetUserId: user.id, performedBy: admin });
};
