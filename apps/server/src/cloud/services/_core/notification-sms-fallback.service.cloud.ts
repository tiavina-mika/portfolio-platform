import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';
import type { NotificationChannelRecipient, NotificationChannels } from '@/types/notification.type';

import { DEFAULT_LANGUAGE } from '@/config/i18n';
import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import {
  MAX_FALLBACK_SMS_PER_USER_PER_DAY, SMS_FALLBACK_PUSH_STATUSES,
} from '@/constants/_core/notification.constants';
import { NotificationChannelEnum, NotificationChannelStatusEnum } from '@/types/notification.type';
import { logger } from '@/utils/_core/logger';
import { getChannelRecipientFromResult } from '@/utils/_core/notification.utils';

import {
  isChannelEnabledForPreferences, mergeNotificationChannelRecipients,
} from './notification.service.cloud';
import { sendSmsToUserWithResult } from '../../utils/_core/sms.utils.cloud';

/** Writes the SMS a notification stands for, or `undefined` when its payload cannot support one. */
export type NotificationSmsComposer = (notification: Parse.Object, locale: Locale) => string | undefined;

const smsComposersByKey: Record<string, NotificationSmsComposer> = {};

const getSmsFallbackKey = (type: string, status: string): string => `${type}:${status}`;

/**
 * Lets each business domain declare which of its events may be texted when the push did not reach a
 * member who has no e-mail, and how the SMS reads — without this generic service knowing about
 * rides or requests. An event nobody registered is never texted: the list is deliberately short,
 * every SMS is paid.
 */
export const registerNotificationSmsFallback = (
  type: string,
  status: string,
  composer: NotificationSmsComposer
): void => {
  smsComposersByKey[getSmsFallbackKey(type, status)] = composer;
};

/** The notification types that have at least one registered SMS fallback event. */
const getSmsFallbackTypes = (): string[] => [
  ...new Set(Object.keys(smsComposersByKey).map((key) => key.split(':')[0]!)),
];

/**
 * How many fallback SMS this member was sent over the last 24 hours. Counted on the notifications
 * themselves, soft-deleted ones included — hiding one in the app does not make room for another
 * SMS — and on the SMS actually sent: a refused or skipped one cost nothing.
 */
const countRecentFallbackSms = async (user: Parse.User): Promise<number> => {
  const notifications = await new Parse.Query(collections.Notification)
    .equalTo('to', user)
    .containedIn('type', getSmsFallbackTypes())
    .exists(`channels.${NotificationChannelEnum.SMS}`)
    .greaterThan('createdAt', dayjs().subtract(1, 'day').toDate())
    .select(['channels'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  return notifications.filter((notification) => {
    const channels: NotificationChannels = notification.get('channels') || {};

    return (channels[NotificationChannelEnum.SMS] || []).some((recipient) => (
      recipient.toId === user.id && recipient.status === NotificationChannelStatusEnum.SENT
    ));
  }).length;
};

/**
 * One recipient's outcome of the fallback, or `undefined` when nothing is to be recorded (the
 * event's payload cannot be worded). A member over their daily allowance is recorded as such, so
 * support can tell them why no SMS came instead of finding an empty channel.
 */
const sendFallbackSmsToRecipient = async (
  notification: Parse.Object,
  user: Parse.User,
  composer: NotificationSmsComposer
): Promise<NotificationChannelRecipient | undefined> => {
  // a number never confirmed may not belong to the member, and the SMS is paid either way
  if (!user.get('phone')?.number || !user.get('phoneVerified')) {
    return { toId: user.id, status: NotificationChannelStatusEnum.SMS_NO_PHONE };
  }

  const isEnabled = isChannelEnabledForPreferences(
    user.get('notificationPreferences'),
    notification.get('type'),
    notification.get('status'),
    NotificationChannelEnum.SMS
  );

  if (!isEnabled) {
    return { toId: user.id, status: NotificationChannelStatusEnum.EMAIL_DISABLED_BY_USER };
  }

  if (await countRecentFallbackSms(user) >= MAX_FALLBACK_SMS_PER_USER_PER_DAY) {
    logger.warn('sendSmsFallback skipped: daily SMS cap reached', { userId: user.id });
    return { toId: user.id, status: NotificationChannelStatusEnum.SMS_RATE_LIMITED };
  }

  const message = composer(notification, (user.get('locale') ?? DEFAULT_LANGUAGE) as Locale);

  if (!message) return undefined;

  return getChannelRecipientFromResult(user.id, await sendSmsToUserWithResult(user, message));
};

/**
 * Texts the members a critical notification did not reach by push and cannot reach by e-mail.
 *
 * Called once the push outcome of every recipient is known. A member is texted only when all of
 * these hold: the event is one a domain registered, their push found no device or was refused, they
 * have no e-mail address (an e-mail already covers the others), they did not switch the SMS off, and
 * they are under their daily allowance. A member whose channel already holds an SMS outcome is left
 * alone — the late-cancellation SMS is declared on the notification at creation, which is what
 * keeps a passenger from being told twice.
 *
 * Only the recipients that reached the SMS stage are written on the channel: the others were never
 * a candidate for one. Never throws — the SMS is a safety net around a delivery that already ran.
 */
export const sendSmsFallbackForNotification = async (
  notification: Parse.Object,
  pushOutcomes: NotificationChannelRecipient[]
): Promise<void> => {
  try {
    const composer = smsComposersByKey[
      getSmsFallbackKey(notification.get('type'), notification.get('status'))
    ];

    if (!composer) return;

    const channels: NotificationChannels = notification.get('channels') || {};
    const alreadyTargetedIds = new Set(
      (channels[NotificationChannelEnum.SMS] || []).map((recipient) => recipient.toId)
    );
    const candidateIds = pushOutcomes
      .filter((outcome) => SMS_FALLBACK_PUSH_STATUSES.includes(outcome.status))
      .map((outcome) => outcome.toId)
      .filter((id) => !alreadyTargetedIds.has(id));

    if (candidateIds.length === 0) return;

    const users = await new Parse.Query(Parse.User)
      .containedIn('objectId', candidateIds)
      .select(['email', 'phone', 'phoneVerified', 'locale', 'notificationPreferences'])
      .limit(candidateIds.length)
      .find(USE_MASTER_KEY);

    // an e-mail address already covers the member: the e-mail channel reaches them for free
    const membersWithoutEmail = users.filter((user) => !user.get('email'));
    const outcomes = (await Promise.all(
      membersWithoutEmail.map((user) => sendFallbackSmsToRecipient(notification, user, composer))
    )).filter((outcome): outcome is NotificationChannelRecipient => !!outcome);

    if (outcomes.length === 0) return;

    await mergeNotificationChannelRecipients(notification.id, NotificationChannelEnum.SMS, outcomes);
  }
  catch (error) {
    logger.error('sendSmsFallbackForNotification error', {
      notificationId: notification.id,
      error: (error as Error).stack,
    });
  }
};
