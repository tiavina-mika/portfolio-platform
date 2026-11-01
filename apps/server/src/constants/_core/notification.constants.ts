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
import { NotificationTypeEnum } from '@shared/types';

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
 * How much of a provider's refusal is kept on a recipient entry. The code is what support quotes and
 * the wording is a sentence at most — a provider answering with a whole HTML error page must not be
 * copied into every recipient of a fan-out.
 */
export const NOTIFICATION_CHANNEL_ERROR_MAX_LENGTH = 300;

/** What one SMS costs the platform, in Ariary — what the daily SMS counts are priced with. */
export const SMS_UNIT_COST_AR = 50;

/** How many days of SMS counts the staff can ask for at most, and get when they ask for none. */
export const SMS_DAILY_COUNTS_MAX_DAYS = 90;
export const SMS_DAILY_COUNTS_DEFAULT_DAYS = 30;
