import {
  ACCOUNT_BANNED_STATUS, ACCOUNT_SUSPENDED_STATUS, ACCOUNT_UNBANNED_STATUS, ANNOUNCEMENT_STATUS,
  DRIVER_CANCELLATION_PENALTY_STATUS,
  NEW_DEVICE_LOGIN_STATUS, PASSENGER_CANCELLATION_SUSPENSION_STATUS, RATING_INVITATION_STATUS,
  RATING_REMINDER_STATUS, RATING_REPLY_STATUS, REPORT_RECEIVED_STATUS, REPORT_RESOLVED_STATUS,
  REQUEST_PAYMENT_SUCCEEDED_STATUS, RIDE_AUTO_COMPLETED_DRIVER_STATUS, RIDE_AUTO_COMPLETED_STATUS,
  RIDE_COMPLETION_CHECK_STATUS, RIDE_COMPLETION_REMINDER_STATUS, RIDE_DEPARTURE_REMINDER_STATUS,
  RIDE_UPDATED_STATUS,
  SUPPORT_SESSION_ENDED_STATUS, SUSPENSION_LIFTED_STATUS, TICKET_NEW_REPLY_FROM_AGENT_STATUS,
  TICKET_RESOLVED_STATUS, VEHICLE_DOCUMENT_EXPIRED_STATUS, VEHICLE_DOCUMENT_EXPIRING_SOON_STATUS,
  VEHICLE_DOCUMENT_REJECTED_STATUS, VEHICLE_VERIFIED_STATUS,
} from '@shared/constants';
import { NotificationChannelStatusEnum, NotificationTypeEnum } from '@shared/types';

/**
 * Notification type tags, taken from the enum shared with the app and the back-office so the three
 * label, filter and route on the literal the server actually writes. Each domain still owns and
 * registers its own type (see ride/request/rating/user notification services).
 */
export const REQUEST_NOTIFICATION_TYPE = NotificationTypeEnum.REQUEST;
export const RIDE_NOTIFICATION_TYPE = NotificationTypeEnum.RIDE;
export const RATE_NOTIFICATION_TYPE = NotificationTypeEnum.RATE;
export const ACCOUNT_NOTIFICATION_TYPE = NotificationTypeEnum.ACCOUNT;
export const TICKET_NOTIFICATION_TYPE = NotificationTypeEnum.TICKET;
/** Document review outcome on one of the driver's vehicles. */
export const VEHICLE_NOTIFICATION_TYPE = NotificationTypeEnum.VEHICLE;
/** An announcement an operator wrote in the back-office and sent to a segment of the members. */
export const ANNOUNCEMENT_NOTIFICATION_TYPE = NotificationTypeEnum.ANNOUNCEMENT;

/*
 * statuses shared with the clients (they branch on them to render the line and route the tap),
 * re-exported so the server's own imports keep pointing at this module
 */
export {
  ACCOUNT_BANNED_STATUS, ACCOUNT_SUSPENDED_STATUS, ACCOUNT_UNBANNED_STATUS, ANNOUNCEMENT_STATUS,
  DRIVER_CANCELLATION_PENALTY_STATUS,
  NEW_DEVICE_LOGIN_STATUS, PASSENGER_CANCELLATION_SUSPENSION_STATUS, REPORT_RECEIVED_STATUS,
  REPORT_RESOLVED_STATUS, REQUEST_PAYMENT_SUCCEEDED_STATUS,
  RIDE_AUTO_COMPLETED_DRIVER_STATUS, RIDE_AUTO_COMPLETED_STATUS, RIDE_COMPLETION_CHECK_STATUS,
  RIDE_COMPLETION_REMINDER_STATUS, RIDE_DEPARTURE_REMINDER_STATUS, RIDE_UPDATED_STATUS,
  SUPPORT_SESSION_ENDED_STATUS,
  SUSPENSION_LIFTED_STATUS, TICKET_NEW_REPLY_FROM_AGENT_STATUS, TICKET_RESOLVED_STATUS,
  VEHICLE_DOCUMENT_EXPIRED_STATUS, VEHICLE_DOCUMENT_EXPIRING_SOON_STATUS, VEHICLE_DOCUMENT_REJECTED_STATUS,
  VEHICLE_VERIFIED_STATUS,
};

/**
 * Re-exported from the shared constants so the server and the app read the same literal: the app
 * branches on it to render "rate the people you travelled with" instead of a review someone left.
 * It rides on the `RATE` type, so it follows the recipient's review-notification preference — as do
 * the reminder sent halfway through the review window and the notice of a reply to a review.
 */
export {
  RATING_INVITATION_STATUS, RATING_REMINDER_STATUS, RATING_REPLY_STATUS,
};

/**
 * Grace period after a notification is soft-deleted (expireOldNotificationsJob) before
 * purgeOldNotificationsJob permanently destroys it — long enough to recover from an
 * accidental/erroneous soft-delete, short enough not to retain PII-bearing snapshots.
 */
export const NOTIFICATION_HARD_DELETE_GRACE_DAYS = 90;

/**
 * Expo push receipts (the actual APNs/FCM delivery result, as opposed to the immediate send
 * ticket) only become available roughly 15 minutes after a push is sent — processPushReceiptsJob
 * only looks at PushReceipt rows older than this to avoid querying Expo before they exist.
 */
export const PUSH_RECEIPT_MIN_AGE_MINUTES = 15;

/**
 * How much of a provider's refusal is kept on a recipient entry. The code is what support quotes and
 * the wording is a sentence at most — a provider answering with a whole HTML error page must not be
 * copied into every recipient of a fan-out.
 */
export const NOTIFICATION_CHANNEL_ERROR_MAX_LENGTH = 300;

/**
 * SMS sent as a fallback to one member over a rolling 24 hours, counted on the notifications of the
 * fallback events whose SMS channel reached them. Past it the notification is still written and the
 * push was still attempted — only the paid SMS is not repeated, since each one costs 50 Ar.
 */
export const MAX_FALLBACK_SMS_PER_USER_PER_DAY = 5;

/** What one SMS costs the platform, in Ariary — what the daily SMS counts are priced with. */
export const SMS_UNIT_COST_AR = 50;

/** How many days of SMS counts the staff can ask for at most, and get when they ask for none. */
export const SMS_DAILY_COUNTS_MAX_DAYS = 90;
export const SMS_DAILY_COUNTS_DEFAULT_DAYS = 30;

/**
 * The push outcomes that mean the member may not have been told: no device to push to, or the push
 * provider refused it. Every other outcome either reached them or is a choice they made.
 */
export const SMS_FALLBACK_PUSH_STATUSES: string[] = [
  NotificationChannelStatusEnum.PUSH_NO_DEVICE,
  NotificationChannelStatusEnum.FAILED,
];
