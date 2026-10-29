import { z } from 'zod';

import {
  BROADCAST_BODY_MAX_LENGTH, BROADCAST_TITLE_MAX_LENGTH, BroadcastSegmentEnum,
} from '@/constants/_core/broadcast.constants';
import { LOCALES } from '@/constants/_core/constants';
import { SMS_DAILY_COUNTS_MAX_DAYS } from '@/constants/_core/notification.constants';
import { NotificationChannelEnum, NotificationResendReasonEnum } from '@/types/notification.type';

import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, objectIdFieldSchema,
} from './util.validations';

const notificationsFiltersSchema = z.object({
  deleted: z.boolean().optional(),
  // the sends one account received — the back-office links here from that account's own page
  toId: objectIdFieldSchema.optional(),
}).optional();

/*
 * the whole set of keys getNotifications knows how to search on — anything else is stripped here
 * rather than matched blindly against a column of the same name
 */
const notificationsSearchSchema = z.object({
  from: z.string().optional(),
  text: z.string().optional(),
  to: z.string().optional(),
  status: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  // how far a send has got through its recipients — see NotificationReadStateEnum
  readState: z.array(z.string()).optional(),
  // one recipient, or several — the two read completely differently in the list
  sendType: z.enum(['single', 'multiple']).optional(),
  // raised by the platform itself, or by an account
  senderType: z.enum(['system', 'user']).optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).optional();

export const getNotificationsSchema = paginationQuerySchema.extend({
  filters: notificationsFiltersSchema,
  search: notificationsSearchSchema,
  include: includeFieldSchema,
});

export const getNotificationSchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});

export const resendNotificationSchema = z.object({
  id: objectIdFieldSchema,
  // the channel to send again — the push when left out
  channel: z.enum(NotificationChannelEnum).optional(),
  /*
   * which recipients to send to again — the ones a provider rejected, the ones who have not opened
   * it, or one person. Left out, the channel goes to every recipient of the send.
   */
  toIds: z.array(objectIdFieldSchema).optional(),
  // what the send's history names the resend after — derived from `toIds` when left out
  reason: z.enum(NotificationResendReasonEnum).optional(),
});

export const resendNotificationFailedDeliveriesSchema = z.object({
  ids: z.array(objectIdFieldSchema).nonempty(),
});

export const getNotificationResendsSchema = z.object({
  id: objectIdFieldSchema,
});

export const setNotificationReceiverSeenSchema = z.object({
  id: objectIdFieldSchema,
  value: z.boolean(),
  // the caller's own language, for the "please sign in" refusal — every client function takes it
  locale: z.string().optional(),
});

export const bulkSetNotificationsReceiverSeenSchema = z.object({
  ids: z.array(objectIdFieldSchema).nonempty(),
  value: z.boolean(),
});

export const bulkSoftDeleteNotificationsSchema = z.object({
  ids: z.array(objectIdFieldSchema).nonempty(),
});

/** Takes binned sends back out of the recycle bin — the same selection shape as binning them. */
export const bulkRestoreNotificationsSchema = z.object({
  ids: z.array(objectIdFieldSchema).nonempty(),
});

/** Destroys binned sends for good, with their resend history. */
export const destroyNotificationsSchema = z.object({
  ids: z.array(objectIdFieldSchema).nonempty(),
});

/*
 * every key a user may switch — anything else is refused rather than stored, since the object is
 * read back by the push fan-out and the e-mail senders on every notification. The four category
 * keys are no longer switches (every category is always sent): they are still accepted so an app
 * release that sends the whole object back keeps saving, and are ignored when a notification goes out.
 */
export const updateNotificationPreferencesSchema = z.object({
  preferences: z.object({
    rideNotifications: z.boolean().optional(),
    requestNotifications: z.boolean().optional(),
    rateNotifications: z.boolean().optional(),
    ticketNotifications: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
  }).strict(),
  locale: z.string().optional(),
});

export const markAllMyNotificationsSeenSchema = z.object({
  locale: z.string().optional(),
});

/*
 * An announcement is the one notification whose words are typed rather than composed from a
 * template, so this is where they are checked: every language the back-office offers must be
 * filled — a send that reaches a Malagasy-speaking member with an empty body is worse than one
 * that was refused — and each is bounded, because a channel meant for one sentence is not a
 * newsletter.
 */
const broadcastTextSchema = (maxLength: number) => z
  .record(
    z.enum([...LOCALES]),
    z.string().trim().min(1).max(maxLength)
  )
  .refine(
    (texts) => LOCALES.every((locale) => !!texts[locale]),
    { message: 'notificationBroadcastMissingLocale' }
  );

const broadcastAudienceSchema = z.object({
  segment: z.enum(BroadcastSegmentEnum),
  /** the city the segment is narrowed to — meaningless on any other segment, required on this one */
  city: z.string().trim().min(1).max(BROADCAST_TITLE_MAX_LENGTH).optional(),
}).refine(
  ({ segment, city }) => segment !== BroadcastSegmentEnum.CITY || !!city,
  { message: 'notificationBroadcastMissingCity', path: ['city'] }
);

export const previewNotificationBroadcastSchema = broadcastAudienceSchema;

export const sendNotificationBroadcastSchema = z.object({
  segment: z.enum(BroadcastSegmentEnum),
  city: z.string().trim().min(1).max(BROADCAST_TITLE_MAX_LENGTH).optional(),
  title: broadcastTextSchema(BROADCAST_TITLE_MAX_LENGTH),
  body: broadcastTextSchema(BROADCAST_BODY_MAX_LENGTH),
  /**
   * What the operator confirmed sending to, as the preview stated it. The send is refused when it
   * no longer matches what the audience actually holds: a broadcast cannot be taken back, and
   * "confirm 200 recipients, send to 40 000" is precisely the accident the confirmation exists to
   * prevent.
   */
  expectedRecipientCount: z.number().int().nonnegative(),
  locale: z.string().optional(),
});

export const getNotificationBroadcastHistorySchema = z.object({
  locale: z.string().optional(),
});

export const getNotificationSmsDailyCountsSchema = z.object({
  days: z.number().int().min(1).max(SMS_DAILY_COUNTS_MAX_DAYS).optional(),
  locale: z.string().optional(),
});
