import {
  getAnnouncementTitle, getCountry, getNotificationMessageText, NotificationMessageSurfaceEnum,
  toNotificationMessageLocale,
} from '@shared/utils';
import dayjs from 'dayjs';
import { Expo } from 'expo-server-sdk';

import type { NotificationChannelRecipient, NotificationChannelStatus } from '@/types/notification.type';
import type { ExpoPushMessage } from 'expo-server-sdk';


import { DEFAULT_LANGUAGE } from '@/config/i18n';
import {
  APP_NAME, collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { PUSH_RECEIPT_MIN_AGE_MINUTES } from '@/constants/_core/notification.constants';
import {
  PUSH_CHANNEL_DEFAULT, PUSH_CHANNEL_RIDES, PUSH_HIGH_PRIORITY_NOTIFICATION_TYPES, PUSH_RECEIPT_MAX_AGE_HOURS,
} from '@/constants/_core/push.constants';
import { NotificationChannelEnum, NotificationChannelStatusEnum } from '@/types/notification.type';
import { logger } from '@/utils/_core/logger';

import { sendSmsFallbackForNotification } from './notification-sms-fallback.service.cloud';
import {
  getPushDisabledRecipientIds, mergeNotificationChannelRecipients, setNotificationChannelRecipients,
} from './notification.service.cloud';
import { clearStalePushTokenService, getUserSessionsWithPushTokenService } from './userSession.service.cloud';
import {
  formatNotificationDate, formatNotificationPrice, getNotificationMessageData,
} from '../../utils/_core/notification-message.utils.cloud';
import { getUserFullName } from '../../utils/_core/user.utils.cloud';

let expoClient: Expo | null = null;

/*
 * built on first use so the env is loaded by then. With "enhanced push security" turned on in the
 * Expo dashboard, Expo only accepts sends carrying this token — a leaked device token alone is then
 * no longer enough to push to that phone. Left unset, Expo keeps accepting unauthenticated sends.
 */
const getExpoClient = (): Expo => {
  if (!expoClient) {
    expoClient = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN || undefined });
  }
  return expoClient;
};

export const PushReceipt = Parse.Object.extend(collections.PushReceipt);

/**
 * Builds the push body from the catalogue the app and the back-office read the same event out of
 * (`@shared/domain-utils`), in the recipient's own language and from their own position — a support
 * decision means the opposite for each side of a booking, and the push used to send both of them the
 * sentence written for whoever the row happened to name.
 *
 * The stored `message` is only fallen back to for the rows written before the catalogue existed:
 * having the push read its own copy of the text is exactly what let a status be announced on the
 * phone and left blank in the app.
 */
const buildPushBody = (
  notification: Parse.Object,
  locale: string,
  fromName: string,
  recipient: Parse.User
): string | undefined => {
  const country = getCountry(recipient.get('country'));
  const text = getNotificationMessageText({
    type: notification.get('type'),
    status: notification.get('status'),
    data: getNotificationMessageData(notification),
    viewerId: recipient.id,
    senderName: fromName,
    surface: NotificationMessageSurfaceEnum.PUSH,
    locale: toNotificationMessageLocale(locale),
    formatDate: formatNotificationDate,
    formatPrice: (value) => formatNotificationPrice(value, country),
  });

  if (text) return text;

  const templates: Record<string, string> | undefined = notification.get('message');

  return templates?.[locale] ?? templates?.[DEFAULT_LANGUAGE];
};

/**
 * The title a push is shown under: the app's name, except for an announcement, whose own title is
 * what an operator wrote — it is the only notification the platform did not word itself.
 */
const buildPushTitle = (notification: Parse.Object, locale: string): string => (
  getAnnouncementTitle(getNotificationMessageData(notification), toNotificationMessageLocale(locale)) ??
  APP_NAME
);

/**
 * The sender's name as the templates interpolate it (`{driver}`, `{passenger}`, `{from}`). It has
 * to be loaded rather than read off `notification.get('from')`: the afterSave trigger this runs
 * from receives that pointer unfetched, and an unfetched pointer would silently interpolate to an
 * empty string — shipping a body with a hole where the name belongs.
 */
const resolveFromName = async (notification: Parse.Object): Promise<string> => {
  const from: Parse.User | undefined = notification.get('from');

  if (!from) return '';
  if (from.isDataAvailable()) return getUserFullName(from);

  const fetched = await new Parse.Query(Parse.User)
    .select(['firstName', 'lastName'])
    .get(from.id, USE_MASTER_KEY);

  return getUserFullName(fetched);
};

/**
 * Push fan-out for a freshly created Notification: looks up every recipient's registered
 * device(s) — UserSession.pushToken is per-device, so a user logged in on several phones gets
 * pushed on all of them — and sends one push per device via expo-server-sdk.
 * Returns what to record on the notification: `sent` as soon as Expo accepted at least one
 * message, `failed` when every ticket came back in error, and otherwise the reason there was
 * nothing to push to — no recipient, no registered device (the web build registers none, so this
 * is the normal outcome there), or no message template for this type.
 */
const pushToRecipientDevices = async (
  notification: Parse.Object,
  to: Parse.User[]
): Promise<NotificationChannelRecipient[]> => {
  if (to.length === 0) return [];

  /*
   * the in-app row is created for everyone; push is what a recipient's preferences switch off, so
   * those recipients are recorded as such and none of their devices is looked up
   */
  const pushDisabledIds = await getPushDisabledRecipientIds(
    notification,
    to.map((recipient) => recipient.id)
  );
  const pushTargets = to.filter((recipient) => !pushDisabledIds.has(recipient.id));

  /*
   * a recipient is only lifted out of no_device once one of their own devices produces a message:
   * pushToken is per-device, so the same user can have one phone that works and another that was
   * uninstalled, and only the best outcome across their devices describes what they experienced.
   */
  const statusByRecipientId = new Map<string, NotificationChannelStatus>(
    to.map((recipient) => [
      recipient.id,
      pushDisabledIds.has(recipient.id)
        ? NotificationChannelStatusEnum.EMAIL_DISABLED_BY_USER
        : NotificationChannelStatusEnum.PUSH_NO_DEVICE,
    ])
  );

  if (pushTargets.length === 0) {
    return to.map((recipient) => ({ toId: recipient.id, status: statusByRecipientId.get(recipient.id)! }));
  }

  const fromName = await resolveFromName(notification);
  const sessions = await getUserSessionsWithPushTokenService(pushTargets);
  const type: string = notification.get('type');
  const isHighPriority = PUSH_HIGH_PRIORITY_NOTIFICATION_TYPES.includes(type);

  // the provider's own words for a device it refused, kept for the recipient that ends up failed
  const errorByRecipientId = new Map<
    string,
    Pick<NotificationChannelRecipient, 'errorCode' | 'errorMessage'>
  >();

  const messages: ExpoPushMessage[] = [];
  const messageTargets: { pushToken: string; recipientId: string }[] = [];

  for (const session of sessions) {
    const pushToken: string = session.get('pushToken');

    if (!Expo.isExpoPushToken(pushToken)) continue;

    const recipient: Parse.User = session.get('user');
    const locale = (recipient?.get('locale') ?? DEFAULT_LANGUAGE) as string;
    const body = buildPushBody(notification, locale, fromName, recipient);

    // a valid token with no body means the type has no template, not a missing device
    if (!body) {
      statusByRecipientId.set(recipient.id, NotificationChannelStatusEnum.PUSH_NO_TEMPLATE);
      continue;
    }

    messages.push({
      to: pushToken,
      title: buildPushTitle(notification, locale),
      body,
      sound: 'default',
      // Android only: a trip in motion goes to the high-importance channel so it shows a banner
      channelId: isHighPriority ? PUSH_CHANNEL_RIDES : PUSH_CHANNEL_DEFAULT,
      priority: isHighPriority ? 'high' : 'default',
      // `status` tells the app which screen a tap opens, the type alone being shared by many events
      data: { notificationId: notification.id, type, status: notification.get('status') },
    });
    messageTargets.push({ pushToken, recipientId: recipient.id });
  }

  const chunks = getExpoClient().chunkPushNotifications(messages);
  let cursor = 0;

  for (const chunk of chunks) {
    const tickets = await getExpoClient().sendPushNotificationsAsync(chunk);

    await Promise.all(tickets.map(async (ticket, index) => {
      const target = messageTargets[cursor + index];

      if (!target) return;

      if (ticket.status === 'error') {
        if (ticket.details?.error === 'DeviceNotRegistered') {
          await clearStalePushTokenService(target.pushToken);
        }
        logger.error(`sendPushNotificationsForNotification: ${ticket.message}`);
        errorByRecipientId.set(target.recipientId, {
          errorCode: ticket.details?.error,
          errorMessage: ticket.message,
        });

        // one device failing does not undo another of the same user's devices having worked
        if (statusByRecipientId.get(target.recipientId) !== NotificationChannelStatusEnum.SENT) {
          statusByRecipientId.set(target.recipientId, NotificationChannelStatusEnum.FAILED);
        }
        return;
      }

      statusByRecipientId.set(target.recipientId, NotificationChannelStatusEnum.SENT);

      const receipt = new PushReceipt();

      receipt.set('ticketId', ticket.id);
      receipt.set('pushToken', target.pushToken);
      await receipt.save(null, USE_MASTER_KEY);
    }));

    cursor += chunk.length;
  }

  return to.map((recipient) => {
    const status = statusByRecipientId.get(recipient.id) ?? NotificationChannelStatusEnum.PUSH_NO_DEVICE;

    // a device's refusal is not the recipient's outcome once another of their devices took the push
    return status === NotificationChannelStatusEnum.FAILED
      ? { toId: recipient.id, status, ...errorByRecipientId.get(recipient.id) }
      : { toId: recipient.id, status };
  });
};

/**
 * Fire-and-forget entry point, called without awaiting from the Notification afterSave trigger.
 * Never throws — a push failure must never affect notification creation — and always records the
 * outcome on the notification's `channels.push`, so support can tell a delivered push from a
 * device that was never registered without digging through the logs.
 */
export const sendPushNotificationsForNotification = async (
  notification: Parse.Object,
  targets?: Parse.User[]
): Promise<void> => {
  const to: Parse.User[] = targets ?? notification.get('to') ?? [];
  let recipients: NotificationChannelRecipient[] = to.map((recipient) => ({
    toId: recipient.id,
    status: NotificationChannelStatusEnum.FAILED,
  }));

  try {
    recipients = await pushToRecipientDevices(notification, to);
  }
  catch (error) {
    logger.error('sendPushNotificationsForNotification error', { error: (error as Error).stack });
    // the push never reached Expo at all, which is the refusal every recipient is left with
    recipients = recipients.map((recipient) => ({ ...recipient, errorMessage: (error as Error).message }));
  }

  /*
   * a pass aimed at named recipients only describes those recipients, so it is folded into what
   * the channel already holds — replacing it would erase the outcome of everyone the first send
   * reached and leave the row claiming it only ever went to the handful just retried
   */
  if (targets) {
    await mergeNotificationChannelRecipients(
      notification.id, NotificationChannelEnum.PUSH, recipients
    );
    return;
  }

  await setNotificationChannelRecipients(notification.id, NotificationChannelEnum.PUSH, recipients);

  // the push outcome is known and recorded: a member it did not reach may still be told by SMS
  await sendSmsFallbackForNotification(notification, recipients);
};

/**
 * Processes pending Expo push receipts (the delayed APNs/FCM delivery result, available only
 * ~15min after send — see PUSH_RECEIPT_MIN_AGE_MINUTES) and clears any UserSession.pushToken
 * Expo reports as DeviceNotRegistered — otherwise the send failure rate grows silently as users
 * uninstall the app or reinstall on a new device. Designed to run as a scheduled Parse Job.
 */
export const processPushReceipts = async (): Promise<{ processed: number; kept: number }> => {
  const cutoffDate = dayjs().subtract(PUSH_RECEIPT_MIN_AGE_MINUTES, 'minute').toDate();
  const expiryDate = dayjs().subtract(PUSH_RECEIPT_MAX_AGE_HOURS, 'hour').toDate();
  let processed = 0;
  let kept = 0;

  while (true) {
    /*
     * oldest first, past the rows kept for a later pass: those stay at the head of the ordering,
     * so skipping exactly as many as were kept lands on the first row not looked at yet
     */
    const batch = await new Parse.Query(PushReceipt)
      .lessThan('createdAt', cutoffDate)
      .ascending('createdAt')
      .select(['ticketId', 'pushToken', 'createdAt'])
      .skip(kept)
      .limit(DEFAULT_QUERY_LIMIT)
      .find(USE_MASTER_KEY);

    if (batch.length === 0) break;

    const receiptIds = batch.map((record) => record.get('ticketId'));
    const receipts = await getExpoClient().getPushNotificationReceiptsAsync(receiptIds);

    const outcomes = await Promise.all(batch.map(async (record): Promise<'processed' | 'kept'> => {
      const receipt = receipts[record.get('ticketId')];

      /*
       * not delivered yet (APNs/FCM still working on it): the receipt shows up on a later pass,
       * unless the ticket is older than Expo keeps receipts for — then it never will
       */
      if (!receipt && record.createdAt > expiryDate) return 'kept';

      if (receipt?.status === 'error') {
        logger.warn(`processPushReceiptsJob: ${receipt.details?.error ?? 'error'} — ${receipt.message}`);

        if (receipt.details?.error === 'DeviceNotRegistered') {
          await clearStalePushTokenService(record.get('pushToken'));
        }
      }

      await record.destroy(USE_MASTER_KEY);
      return 'processed';
    }));

    const keptInBatch = outcomes.filter((outcome) => outcome === 'kept').length;

    kept += keptInBatch;
    processed += batch.length - keptInBatch;

    if (batch.length < DEFAULT_QUERY_LIMIT) break;
  }

  logger.info(`processPushReceiptsJob: processed ${processed} push receipts, ${kept} kept for a later pass`);

  return { processed, kept };
};
