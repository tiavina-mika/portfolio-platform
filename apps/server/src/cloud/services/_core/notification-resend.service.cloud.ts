import type {
  NotificationChannel, NotificationChannelRecipient, NotificationChannels, NotificationResendReason,
} from '@/types/notification.type';

import { getMongoCollection } from '@/cloud/utils/_core/db.utils.cloud';
import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { NotificationChannelEnum } from '@/types/notification.type';
import { logger } from '@/utils/_core/logger';

import {
  getNotificationChannelSender, mergeNotificationChannelRecipients,
} from './notification.service.cloud';
import { sendPushNotificationsForNotification } from './push.service.cloud';
import { withComputedFields } from '../../utils/_core/parse.utils.cloud';

export const NotificationResend = Parse.Object.extend(collections.NotificationResend);

// what a resend states in the send's history, with the name and face of the account behind it
const NOTIFICATION_RESEND_FIELDS = [
  'channel', 'reason', 'toIds', 'resentBy.firstName', 'resentBy.lastName', 'resentBy.image',
];

/**
 * The targets a channel actually addressed. A resend only ever goes to them: a channel entry is the
 * proof the domain meant this person to be reached that way — the driver of a cancelled ride is a
 * recipient of the push, not of the passengers' cancellation e-mail.
 */
const getChannelTargets = (
  notification: Parse.Object,
  channel: NotificationChannel,
  targets: Parse.User[]
): Parse.User[] => {
  const channels: NotificationChannels = notification.get('channels') || {};
  const addressedIds = new Set((channels[channel] || []).map((entry) => entry.toId));

  return targets.filter((target) => addressedIds.has(target.id));
};

/**
 * Whether a send can go out again on a channel: the push always can, since its body is the
 * notification's own message; an e-mail or an SMS only when the domain that raised it registered how
 * to write it again.
 */
export const isNotificationChannelResendable = (
  notification: Parse.Object,
  channel: NotificationChannel
): boolean => (
  channel === NotificationChannelEnum.PUSH ||
  !!getNotificationChannelSender(notification.get('type'), channel)
);

/**
 * Sends one channel of a notification again to some of its recipients, folds how it ended into what
 * the channel already holds, and returns the ids it went to — none when the channel cannot be rebuilt
 * for this send, or when none of the targets was addressed on it.
 *
 * The notification has to be loaded with its recipients (`to` included), its `channels`, and whatever
 * the channel is rebuilt from: `message`/`payload`/`from` for the push, `type`/`status`/`payload`
 * for a domain sender.
 */
export const resendNotificationChannel = async (
  notification: Parse.Object,
  channel: NotificationChannel,
  targets: Parse.User[]
): Promise<string[]> => {
  const recipients = getChannelTargets(notification, channel, targets);

  if (recipients.length === 0) return [];

  if (channel === NotificationChannelEnum.PUSH) {
    // records its own outcome over the channel, the way every push does
    await sendPushNotificationsForNotification(notification, recipients);

    return recipients.map((recipient) => recipient.id);
  }

  const sender = getNotificationChannelSender(notification.get('type'), channel);

  if (!sender) return [];

  let outcomes: NotificationChannelRecipient[] | undefined;

  try {
    outcomes = await sender(notification, recipients);
  }
  catch (error) {
    logger.error(`resendNotificationChannel: could not rebuild ${channel} for ${notification.id}`, {
      error: (error as Error).stack,
    });

    return [];
  }

  if (!outcomes?.length) return [];

  await mergeNotificationChannelRecipients(notification.id, channel, outcomes);

  return outcomes.map((outcome) => outcome.toId);
};

type LogNotificationResendInput = {
  notification: Parse.Object;
  channel: NotificationChannel;
  reason: NotificationResendReason;
  toIds: string[];
  resentBy?: Parse.User;
};

/**
 * Writes one resend into the send's history: which channel, why, to whom, and the account that asked.
 * A resend that went to nobody is not written — nothing happened to the send.
 *
 * Never throws: the resend itself already went out, and failing to note it must not report it as
 * failed to the operator who triggered it.
 */
export const logNotificationResend = async ({
  notification, channel, reason, toIds, resentBy,
}: LogNotificationResendInput): Promise<void> => {
  if (toIds.length === 0) return;

  try {
    const resend = new NotificationResend();

    resend.set('notification', notification);
    resend.set('channel', channel);
    resend.set('reason', reason);
    resend.set('toIds', toIds);

    if (resentBy) {
      resend.set('resentBy', resentBy);
    }

    await resend.save(null, USE_MASTER_KEY);
  }
  catch (error) {
    logger.error(`logNotificationResend: failed to record a ${channel} resend on ${notification.id}`, {
      error: (error as Error).stack,
    });
  }
};

type NotificationResendSummary = {
  _id: string;
  resendsCount: number;
  lastResentAt: Date;
};

// how a notification pointer is stored in Mongo, which is what a raw aggregate matches on
const getNotificationPointerKey = (notificationId: string): string => (
  `${collections.Notification}$${notificationId}`
);

/**
 * Gives each row of the back-office list what it states about resends without opening the send: the
 * channels it can go out on again, how many times it already did and when it last did. The counts
 * come from one aggregate over the page's rows — a query per row would be a round trip per line.
 *
 * Attached as server data rather than set on the fetched objects: a Cloud Function result holding
 * unsaved changes is serialised as a bare pointer, and every column of the row would be lost.
 */
export const attachNotificationResendSummaries = async (
  notifications: Parse.Object[]
): Promise<Parse.Object[]> => {
  if (notifications.length === 0) return notifications;

  const pointerKeys = notifications.map((notification) => getNotificationPointerKey(notification.id));
  const resendCollection = await getMongoCollection(collections.NotificationResend);
  const summaries: NotificationResendSummary[] = await resendCollection.aggregate([
    { $match: { _p_notification: { $in: pointerKeys } } },
    {
      $group: { _id: '$_p_notification', resendsCount: { $sum: 1 }, lastResentAt: { $max: '$_created_at' } },
    },
  ]).toArray();
  const summaryByPointer = new Map(summaries.map((summary) => [summary._id, summary]));

  return notifications.map((notification) => {
    const summary = summaryByPointer.get(getNotificationPointerKey(notification.id));

    return withComputedFields(notification, {
      resendableChannels: Object.values(NotificationChannelEnum)
        .filter((channel) => isNotificationChannelResendable(notification, channel)),
      resendsCount: summary?.resendsCount ?? 0,
      ...(summary && { lastResentAt: summary.lastResentAt.toISOString() }),
    });
  });
};

/** The resends of one send, newest first, each with the account behind it. */
export const getNotificationResends = async (notification: Parse.Object): Promise<Parse.Object[]> => (
  new Parse.Query(NotificationResend)
    .equalTo('notification', notification)
    .include(['resentBy'])
    .select(NOTIFICATION_RESEND_FIELDS)
    .descending('createdAt')
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY)
);
