import { getNotificationMessageEntry } from '@shared/utils';
import dayjs from 'dayjs';

import type {
  INotificationValues, NotificationChannel, NotificationChannelRecipient, NotificationChannels,
  NotificationChannelSender, NotificationPreferences,
} from '@/types/notification.type';

import { getMongoCollection } from '@/cloud/utils/_core/db.utils.cloud';
import { actingUserContext } from '@/cloud/utils/_core/utils.cloud';
import {
  collections, DEFAULT_QUERY_LIMIT, MAX_BULK_UPDATE_LIMIT, MAX_DESTROY_OBJECTS_LIMIT,
  MAX_MARK_ALL_SEEN_LIMIT, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  ACCOUNT_NOTIFICATION_TYPE, DRIVER_CANCELLATION_PENALTY_STATUS, NOTIFICATION_HARD_DELETE_GRACE_DAYS,
  PASSENGER_CANCELLATION_SUSPENSION_STATUS, SUSPENSION_LIFTED_STATUS,
} from '@/constants/_core/notification.constants';
import { NotificationChannelEnum, NotificationChannelStatusEnum } from '@/types/notification.type';
import { logger } from '@/utils/_core/logger';
import { getAttemptedChannelRecipient } from '@/utils/_core/notification.utils';
import { setValues } from '@/utils/_core/utils';

export const Notification = Parse.Object.extend(collections.Notification);

export const NOTIFICATION_PROPERTIES = [
  'from', 'to', 'type', 'payload', 'seen', 'status', 'message', 'snapshot', 'channels',
  'idempotencyKey', 'broadcastBy',
];

/*
 * what a read-state write has to have loaded: `to` because the trigger recomputes the rate against
 * the people actually addressed, `receiverSeenIds` because the new list is built from the old one,
 * and `receiverSeenDates` because a recipient who opened it earlier keeps the date they did.
 * Selecting less would hand the trigger a send that looks addressed to nobody, or re-date every
 * opening it already recorded.
 */
const NOTIFICATION_READ_STATE_PROPERTIES = ['to', 'receiverSeenIds', 'receiverSeenDates'];

const channelSendersByKey: Record<string, NotificationChannelSender> = {};

/**
 * The localized sentence an event is announced as, taken from the catalogue the app and the
 * back-office read it out of too (`@shared/domain-utils`).
 *
 * It used to be a registry each domain filled with its own copy, which is how the server ended up
 * holding one set of texts and the phone another: a status could be given a push template and no
 * line in the app, or two wordings that drifted apart release after release. There is now one entry
 * per event, and this returns its self-contained half — the one a push is written from, and the one
 * stored on the row so the back-office can search a send by what it said.
 */
export const getNotificationMessageTemplate = (
  type?: string,
  status?: string
): Record<string, string> | undefined => {
  if (!type || !status) return undefined;

  return getNotificationMessageEntry({ type, status })?.push;
};

const getChannelSenderKey = (type: string, channel: NotificationChannel): string => `${type}:${channel}`;

/**
 * Lets each business domain declare how one of its notifications is sent again on a channel whose
 * copy it composes itself — an e-mail or an SMS — without this generic service knowing about rides
 * or requests. The push needs none: its body is the notification's own message. A channel no domain
 * registered for a type cannot be retried, and the back-office does not offer it.
 */
export const registerNotificationChannelSender = (
  type: string,
  channel: NotificationChannel,
  sender: NotificationChannelSender
): void => {
  channelSendersByKey[getChannelSenderKey(type, channel)] = sender;
};

export const getNotificationChannelSender = (
  type: string,
  channel: NotificationChannel
): NotificationChannelSender | undefined => channelSendersByKey[getChannelSenderKey(type, channel)];

/*
 * sanctions a user must know about whatever they switched off: a fine they owe, a suspension that
 * blocks them, and the end of one. ACCOUNT notifications (security alerts, bans) are mandatory as a
 * whole type, see isMandatoryNotification.
 */
const MANDATORY_NOTIFICATION_STATUSES = new Set<string>([
  DRIVER_CANCELLATION_PENALTY_STATUS,
  PASSENGER_CANCELLATION_SUSPENSION_STATUS,
  SUSPENSION_LIFTED_STATUS,
]);

const isMandatoryNotification = (type: string, status?: string): boolean => (
  type === ACCOUNT_NOTIFICATION_TYPE || (!!status && MANDATORY_NOTIFICATION_STATUSES.has(status))
);

const GLOBAL_CHANNEL_PREFERENCE_KEYS: Partial<Record<NotificationChannel, keyof NotificationPreferences>> = {
  [NotificationChannelEnum.PUSH]: 'pushEnabled',
  [NotificationChannelEnum.EMAIL]: 'emailEnabled',
  [NotificationChannelEnum.SMS]: 'smsEnabled',
};

/**
 * Whether a notification of this type and status may go out to someone on this channel, given the
 * preferences they saved. Only push, e-mail and the SMS fallback are gated, and only by their own
 * channel switch: every category (requests, rides, reviews, support) is always sent, and the in-app
 * row is always written. Push and e-mail are on until switched off; the SMS fallback is paid, so it
 * needs the member's explicit consent (`smsEnabled: true`). Verification codes and security alerts
 * are not preferences, they are sent whatever the member chose.
 */
export const isChannelEnabledForPreferences = (
  preferences: NotificationPreferences | undefined,
  type: string,
  status: string | undefined,
  channel: NotificationChannel
): boolean => {
  if (isMandatoryNotification(type, status)) return true;

  if (channel === NotificationChannelEnum.SMS) return (preferences?.smsEnabled) ?? false;

  const globalKey = GLOBAL_CHANNEL_PREFERENCE_KEYS[channel];

  return !globalKey || preferences?.[globalKey] !== false;
};

/**
 * Each user's saved preferences, read by query rather than off the objects callers hold: those are
 * often unfetched pointers (a trigger's `to`, a rating's author), and an unfetched pointer has no
 * preferences to read — which let every notification through whatever the user had chosen.
 */
export const getNotificationPreferencesByUserId = async (
  userIds: string[]
): Promise<Map<string, NotificationPreferences | undefined>> => {
  const uniqueIds = [...new Set(userIds)];

  if (uniqueIds.length === 0) return new Map();

  const users = await new Parse.Query(Parse.User)
    .containedIn('objectId', uniqueIds)
    .select(['notificationPreferences'])
    .limit(uniqueIds.length)
    .find(USE_MASTER_KEY);

  return new Map(users.map((user) => [user.id, user.get('notificationPreferences')]));
};

/** The recipients of a notification who switched its push off, for the push fan-out to skip. */
export const getPushDisabledRecipientIds = async (
  notification: Parse.Object,
  recipientIds: string[]
): Promise<Set<string>> => {
  const type: string = notification.get('type');
  const status: string | undefined = notification.get('status');

  if (isMandatoryNotification(type, status)) return new Set();

  const preferencesById = await getNotificationPreferencesByUserId(recipientIds);

  return new Set(recipientIds.filter((id) => (
    !isChannelEnabledForPreferences(preferencesById.get(id), type, status, NotificationChannelEnum.PUSH)
  )));
};

/** Whether this person accepts this notification by e-mail — see isChannelEnabledForPreferences. */
export const isEmailEnabledForRecipient = async (
  recipient: Parse.User,
  type: string,
  status?: string
): Promise<boolean> => {
  if (isMandatoryNotification(type, status)) return true;

  const preferences: NotificationPreferences | undefined = recipient.has('notificationPreferences')
    ? recipient.get('notificationPreferences')
    : (await getNotificationPreferencesByUserId([recipient.id])).get(recipient.id);

  return isChannelEnabledForPreferences(preferences, type, status, NotificationChannelEnum.EMAIL);
};

/*
 * MongoDB's own code for a rejected duplicate key, and the Parse error it is surfaced as. Both are
 * checked: the SDK maps the driver's error for a class it knows the schema of, and hands the raw
 * code through otherwise.
 */
const MONGO_DUPLICATE_KEY_CODE = 11000;

/** Whether a save was refused because `idempotencyKey` is already on another notification. */
const isDuplicateIdempotencyKeyError = (error: unknown): boolean => {
  const { code, message } = (error ?? {}) as { code?: number; message?: string };

  return code === Parse.Error.DUPLICATE_VALUE ||
    code === MONGO_DUPLICATE_KEY_CODE ||
    !!message?.includes('idempotencyKey');
};

/** The notification an earlier run of the same job already filed for this event. */
const getNotificationByIdempotencyKey = (idempotencyKey: string): Promise<Parse.Object | undefined> => (
  new Parse.Query(Notification)
    .equalTo('idempotencyKey', idempotencyKey)
    .select(NOTIFICATION_PROPERTIES)
    .first(USE_MASTER_KEY)
);

export const createNotification = async (
  values: INotificationValues,
  /*
   * `awaitPush`: hold the returned promise until the push fan-out has run. For a caller that is about
   * to destroy what the push needs (a ban revokes the sessions, which carry the push tokens) — every
   * other caller lets the push run in the background so it never delays the notification
   */
  options: { awaitPush?: boolean } = {}
): Promise<Parse.Object | undefined> => {
  const notification = new Notification();

  // push is attempted for every notification by the afterSave trigger, so it is always targeted
  const channels: NotificationChannels = {
    [NotificationChannelEnum.PUSH]: values.to.map((recipient) => ({
      toId: recipient.id,
      status: NotificationChannelStatusEnum.PENDING,
    })),
    ...values.channels,
  };

  setValues(notification, { ...values, channels }, NOTIFICATION_PROPERTIES);

  try {
    return await notification.save(null, {
      ...USE_MASTER_KEY,
      ...(options.awaitPush && { context: { awaitPush: true } }),
    });
  }
  catch (error) {
    /*
     * a call site that named the event (a scheduled job) already filed this notification on an
     * earlier run: the unique index refused the second one, which is exactly what it is for. The
     * one on file is returned so the caller records its channels on the send that did go out rather
     * than treating the replay as a failure.
     */
    if (values.idempotencyKey && isDuplicateIdempotencyKeyError(error)) {
      logger.info(`createNotification: ${values.idempotencyKey} already sent, skipping the duplicate`);

      return getNotificationByIdempotencyKey(values.idempotencyKey);
    }

    throw error;
  }
};

/**
 * Records per-recipient outcomes of one delivery channel on an already-created notification,
 * replacing whatever that channel held. Never throws — a tracking write must not break the delivery
 * it is only observing.
 *
 * Only this channel's own key is written, never the whole `channels` object: push lands from the
 * afterSave trigger at the same moment the domain records its email or SMS, and rewriting `channels`
 * from a copy read a few milliseconds earlier erases whichever channel the other write had just
 * stored.
 *
 * Written at the storage layer rather than through a Parse save: Parse Server turns a dotted key
 * back into a write of the whole parent object, rebuilt from its own read of the row whenever the
 * class has a beforeSave trigger — which Notification does — so the race survives a `channels.push`
 * save. A Mongo `$set` on the dotted path is applied atomically by the database itself.
 */
export const setNotificationChannelRecipients = async (
  notificationId: string,
  channel: NotificationChannel,
  recipients: NotificationChannelRecipient[]
): Promise<void> => {
  try {
    const attemptedAt = new Date();
    /*
     * a first pass on the channel: every caller records it once, right after creation, and a resend
     * goes through mergeNotificationChannelRecipients instead — so there is no earlier attempt to
     * read, and the creation placeholder would not count as one anyway
     */
    const attemptedRecipients = recipients.map(
      (recipient) => getAttemptedChannelRecipient(recipient, undefined, attemptedAt)
    );
    const notificationCollection = await getMongoCollection(collections.Notification);
    const { matchedCount } = await notificationCollection.updateOne(
      { _id: notificationId },
      { $set: { [`channels.${channel}`]: attemptedRecipients, _updated_at: attemptedAt } }
    );

    if (matchedCount === 0) {
      logger.error(`setNotificationChannelRecipients: notification ${notificationId} not found`);
    }
  }
  catch (error) {
    logger.error(
      `setNotificationChannelRecipients: failed to record ${channel} on ${notificationId}`,
      { error: (error as Error).stack }
    );
  }
};

/**
 * Folds the outcomes of a partial send into what a channel already holds, leaving every recipient
 * the pass did not address untouched.
 *
 * A resend aimed at the three recipients a provider rejected must not erase what the twenty it
 * reached the first time recorded — replacing the channel wholesale would leave the row claiming
 * the send only ever went to three people.
 *
 * The channel still has to be read to be merged, but only its own key is written back, so a write
 * on another channel landing in between is kept. Two merges on the same channel at once can still
 * overlap — only a resend produces a merge, and it targets recipients the previous pass settled.
 */
export const mergeNotificationChannelRecipients = async (
  notificationId: string,
  channel: NotificationChannel,
  recipients: NotificationChannelRecipient[]
): Promise<void> => {
  try {
    const notification = await new Parse.Query(Notification)
      .select(['channels'])
      .get(notificationId, USE_MASTER_KEY);
    const channels: NotificationChannels = notification.get('channels') || {};
    const attemptedAt = new Date();
    const updateByRecipientId = new Map(
      recipients.map((recipient) => [recipient.toId, recipient])
    );
    const previous = channels[channel] || [];
    const merged = previous.map((entry) => {
      const update = updateByRecipientId.get(entry.toId);

      // a recipient this pass did not address keeps its own outcome, count and date untouched
      return update
        ? getAttemptedChannelRecipient(update, entry, attemptedAt)
        : entry;
    });
    // a recipient the channel had no entry for at all (an older row) is appended rather than lost
    const added = recipients
      .filter((recipient) => !previous.some((entry) => entry.toId === recipient.toId))
      .map((recipient) => getAttemptedChannelRecipient(recipient, undefined, attemptedAt));

    // same storage-layer write as setNotificationChannelRecipients, for the same reason
    const notificationCollection = await getMongoCollection(collections.Notification);

    await notificationCollection.updateOne(
      { _id: notificationId },
      { $set: { [`channels.${channel}`]: [...merged, ...added], _updated_at: attemptedAt } }
    );
  }
  catch (error) {
    logger.error(
      `mergeNotificationChannelRecipients: failed to record ${channel} on ${notificationId}`,
      { error: (error as Error).stack }
    );
  }
};

/**
 * Records that one recipient has opened (or re-hidden) a notification in their own app.
 *
 * The recipient is taken from the caller's session rather than from a parameter: read state is a
 * statement about the person making the call, and a recipient who could name someone else's id
 * would be rewriting what another passenger has read. A user who is not addressed by the send
 * changes nothing.
 *
 * The list is rewritten whole rather than through `addUnique`/`remove`, so the beforeSave trigger
 * sees `receiverSeenIds` as dirty and recomputes the stored read state from it.
 */
export const setNotificationSeenForRecipient = async (
  notificationId: string,
  recipient: Parse.User,
  value: boolean
): Promise<Parse.Object | undefined> => {
  const notification = await new Parse.Query(Notification)
    .equalTo('objectId', notificationId)
    .equalTo('to', recipient)
    .select(NOTIFICATION_READ_STATE_PROPERTIES)
    .first(USE_MASTER_KEY);

  if (!notification) return undefined;

  const seenBy: string[] = notification.get('receiverSeenIds') || [];

  // nothing to write when the recipient is already on the side they are asking for
  if (seenBy.includes(recipient.id) === value) return notification;

  notification.set('receiverSeenIds', value
    ? [...seenBy, recipient.id]
    : seenBy.filter((id: string) => id !== recipient.id));

  return notification.save(null, USE_MASTER_KEY);
};

/**
 * Takes a deleted account out of every notification it received: out of the recipients, out of the
 * frozen snapshot (name, photo, e-mail on older rows) and out of the read state. A send left with
 * nobody else is soft-deleted, and the purge job destroys it with the rest. Without this, the rows
 * kept the person's identity for up to a year and a quarter after they asked to be forgotten.
 *
 * The afterSave is skipped: it rebuilds the snapshot and pushes the send to whoever is in `to` when
 * `to` changes, which would have re-alerted every co-recipient of the deleted account.
 * @returns how many notifications were rewritten
 */
export const removeRecipientFromNotifications = async (user: Parse.User): Promise<number> => {
  let rewrittenCount = 0;
  let notifications: Parse.Object[];

  // always from the top: each rewritten row leaves the query, so skipping would miss half of them
  do {
    notifications = await new Parse.Query(Notification)
      .equalTo('to', user)
      .select([...NOTIFICATION_READ_STATE_PROPERTIES, 'snapshot'])
      .limit(MAX_BULK_UPDATE_LIMIT)
      .find(USE_MASTER_KEY);

    notifications.forEach((notification) => {
      const remainingRecipients = (notification.get('to') || [])
        .filter((recipient: Parse.User) => recipient.id !== user.id);
      const snapshot: Record<string, any> = notification.get('snapshot') || {};

      notification.set('to', remainingRecipients);
      notification.set('receiverSeenIds', (notification.get('receiverSeenIds') || [])
        .filter((id: string) => id !== user.id));
      notification.set('snapshot', {
        ...snapshot,
        ...(Array.isArray(snapshot.to) && {
          to: snapshot.to.filter((entry: Record<string, unknown>) => entry?.id !== user.id),
        }),
      });
      if (remainingRecipients.length === 0) notification.set('deleted', true);
    });

    await Parse.Object.saveAll(notifications, { ...USE_MASTER_KEY, context: { disableAfterSave: true } });
    rewrittenCount += notifications.length;
  } while (notifications.length === MAX_BULK_UPDATE_LIMIT);

  return rewrittenCount;
};

/**
 * Marks every notification addressed to this person that they have not opened yet as opened —
 * optionally only the ones `narrowQuery` keeps (the notifications of one ticket, say). Only their
 * own entry is added: the other recipients of a shared send keep their own read state.
 * @returns how many notifications were marked
 */
export const setUnseenNotificationsSeenForRecipient = async (
  recipient: Parse.User,
  narrowQuery?: (query: Parse.Query) => void
): Promise<number> => {
  const query = new Parse.Query(Notification)
    .equalTo('to', recipient)
    .notEqualTo('receiverSeenIds', recipient.id)
    .notEqualTo('deleted', true)
    .select(NOTIFICATION_READ_STATE_PROPERTIES)
    .limit(MAX_MARK_ALL_SEEN_LIMIT);

  narrowQuery?.(query);

  const notifications = await query.find(USE_MASTER_KEY);

  if (notifications.length === 0) return 0;

  notifications.forEach((notification) => {
    notification.set('receiverSeenIds', [...(notification.get('receiverSeenIds') || []), recipient.id]);
  });

  await Parse.Object.saveAll(notifications, USE_MASTER_KEY);

  return notifications.length;
};

/**
 * The back-office's own answer to the same question, for a whole selection at once: `true` marks
 * the send read for every one of its recipients, `false` puts it back to unopened for all of them.
 *
 * It writes the same per-recipient list the app writes, rather than the flag it used to set — an
 * admin tidying a queue and a passenger opening their phone now describe the same fact, so the two
 * cannot disagree about who has read what.
 */
export const setNotificationsSeenForAllRecipients = async (
  ids: string[],
  value: boolean
): Promise<Parse.Object[]> => {
  const notifications = await new Parse.Query(Notification)
    .containedIn('objectId', ids)
    .select(NOTIFICATION_READ_STATE_PROPERTIES)
    .limit(MAX_BULK_UPDATE_LIMIT)
    .find(USE_MASTER_KEY);

  const changed = notifications.filter((notification) => {
    const recipients: Parse.User[] = notification.get('to') || [];
    const seenBy: string[] = notification.get('receiverSeenIds') || [];
    const nextSeenBy = value
      ? recipients.map((user) => user.id)
      : [];

    // a row already on the side the admin is asking for is left alone rather than re-saved
    if (nextSeenBy.length === seenBy.length) return false;

    notification.set('receiverSeenIds', nextSeenBy);

    return true;
  });

  return Parse.Object.saveAll(changed, USE_MASTER_KEY);
};

/**
 * The recipients a channel did not reach because the provider rejected the send — the only
 * non-delivery that is worth trying again. Every other reason (no device registered, no phone
 * number, the recipient turned the channel off) says there was nothing to send in the first place,
 * and re-sending those would either fail identically or override a choice the recipient made.
 */
export const getFailedChannelRecipientIds = (
  notification: Parse.Object,
  channel: NotificationChannel
): string[] => {
  const channels: NotificationChannels = notification.get('channels') || {};

  return (channels[channel] || [])
    .filter((recipient) => recipient.status === NotificationChannelStatusEnum.FAILED)
    .map((recipient) => recipient.toId);
};

/**
 * Destroys the resend history of notifications about to be destroyed themselves. A resend names who a
 * send went to, so it must not outlive the send's own grace period.
 */
const destroyNotificationResends = async (notifications: Parse.Object[]): Promise<void> => {
  while (true) {
    const resends = await new Parse.Query(collections.NotificationResend)
      .containedIn('notification', notifications)
      .select(['objectId'])
      .limit(MAX_BULK_UPDATE_LIMIT)
      .find(USE_MASTER_KEY);

    if (resends.length === 0) return;

    await Parse.Object.destroyAll(resends, USE_MASTER_KEY);

    if (resends.length < MAX_BULK_UPDATE_LIMIT) return;
  }
};

/**
 * Bins the notifications an admin selected in the back-office, or takes them back out of the bin.
 *
 * Both directions go through the trigger's `setBooleanFields`, which is what names the admin behind
 * the decision: `deletedAt`/`deletedBy` on the way in, `undeletedAt`/`undeletedBy` on the way back
 * out. Rows already on the side being asked for are left alone rather than re-saved, so restoring a
 * selection that holds a live send does not rewrite that send's history.
 * @returns the notifications actually rewritten
 */
export const setNotificationsDeleted = async (
  ids: string[],
  deleted: boolean,
  actingUser?: Parse.User
): Promise<Parse.Object[]> => {
  const notifications = await new Parse.Query(Notification)
    .containedIn('objectId', ids)
    .notEqualTo('deleted', deleted)
    .select(['objectId'])
    .limit(MAX_BULK_UPDATE_LIMIT)
    .find(USE_MASTER_KEY);

  notifications.forEach((notification) => notification.set('deleted', deleted));

  return Parse.Object.saveAll(notifications, { ...USE_MASTER_KEY, ...actingUserContext(actingUser) });
};

/**
 * Permanently destroys the binned notifications an admin selected, with the resend history that
 * comes with them — a resend names who a send went to, so it must never outlive the send.
 *
 * Only rows already in the bin are touched: destroying straight from the list would leave an admin
 * one mis-click away from erasing a send nobody has reviewed, and the bin is the review step. The
 * same rule the generic `destroyObjects` applies, kept here because that one knows nothing about
 * the resends to cascade to.
 * @returns how many notifications were destroyed
 */
export const destroyNotificationsByIds = async (ids: string[]): Promise<number> => {
  const notifications = await new Parse.Query(Notification)
    .containedIn('objectId', ids)
    .equalTo('deleted', true)
    .select(['objectId'])
    .limit(MAX_DESTROY_OBJECTS_LIMIT)
    .find(USE_MASTER_KEY);

  if (notifications.length === 0) return 0;

  await destroyNotificationResends(notifications);

  const destroyed = await Parse.Object.destroyAll(notifications, USE_MASTER_KEY) || [];

  return destroyed.length;
};

/**
 * Permanently destroys notifications that were soft-deleted (expireOldNotificationsJob) more
 * than NOTIFICATION_HARD_DELETE_GRACE_DAYS ago, freeing storage of PII-bearing snapshots
 * (sender/recipient name and email) once they are no longer needed.
 */
export const purgeOldNotifications = async (): Promise<void> => {
  const cutoffDate = dayjs().subtract(NOTIFICATION_HARD_DELETE_GRACE_DAYS, 'day').toDate();

  let destroyed = 0;

  while (true) {
    const batch = await new Parse.Query(Notification)
      .equalTo('deleted', true)
      .lessThan('deletedAt', cutoffDate)
      .select(['objectId'])
      .limit(DEFAULT_QUERY_LIMIT)
      .find(USE_MASTER_KEY);

    if (batch.length === 0) break;

    await destroyNotificationResends(batch);
    await Promise.all(batch.map((notification) => notification.destroy(USE_MASTER_KEY)));
    destroyed += batch.length;

    if (batch.length < DEFAULT_QUERY_LIMIT) break;
  }

  logger.info(
    `purgeOldNotificationsJob: destroyed ${destroyed} notifications soft-deleted ` +
    `more than ${NOTIFICATION_HARD_DELETE_GRACE_DAYS} days ago`
  );
};
