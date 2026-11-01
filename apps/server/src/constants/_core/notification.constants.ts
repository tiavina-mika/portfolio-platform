import {
  ACCOUNT_BANNED_STATUS, ACCOUNT_UNBANNED_STATUS, ANNOUNCEMENT_STATUS,
  NEW_DEVICE_LOGIN_STATUS, SUPPORT_SESSION_ENDED_STATUS, SUSPENSION_LIFTED_STATUS,
} from '@shared/constants';
import { NotificationTypeEnum } from '@shared/types';

/**
 * Notification type tags, taken from the enum shared with the back-office so both label, filter and
 * route on the literal the server actually writes.
 */
export const ACCOUNT_NOTIFICATION_TYPE = NotificationTypeEnum.ACCOUNT;
/** An announcement an operator wrote in the back-office and sent to a segment of the members. */
export const ANNOUNCEMENT_NOTIFICATION_TYPE = NotificationTypeEnum.ANNOUNCEMENT;

/*
 * statuses shared with the clients (they branch on them to render the line), re-exported so the
 * server's own imports keep pointing at this module
 */
export {
  ACCOUNT_BANNED_STATUS, ACCOUNT_UNBANNED_STATUS, ANNOUNCEMENT_STATUS,
  NEW_DEVICE_LOGIN_STATUS, SUPPORT_SESSION_ENDED_STATUS, SUSPENSION_LIFTED_STATUS,
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
