import { NotificationTypeEnum } from '@shared/types';

/*
 * Android notification channels the mobile app creates at startup. A push naming a channel the
 * device does not know falls back to the app's default one, so both names must match the app's.
 */
export const PUSH_CHANNEL_DEFAULT = 'default';
export const PUSH_CHANNEL_RIDES = 'rides';

/*
 * Notification types about a trip in motion (a booking to answer, a ride cancelled, a departure
 * reminder): they go to the high-importance channel with a high priority, so the phone shows a
 * banner and wakes up even in battery-saving mode.
 */
export const PUSH_HIGH_PRIORITY_NOTIFICATION_TYPES: readonly string[] = [
  NotificationTypeEnum.RIDE,
  NotificationTypeEnum.REQUEST,
];

/*
 * Expo keeps a receipt available for about a day. A ticket whose receipt still has not shown up
 * after that will never get one, so its PushReceipt row is dropped instead of being polled forever.
 */
export const PUSH_RECEIPT_MAX_AGE_HOURS = 24;

/** How many device rows the push fan-out reads per page when looking up the recipients' tokens. */
export const PUSH_SESSIONS_PAGE_SIZE = 100;
