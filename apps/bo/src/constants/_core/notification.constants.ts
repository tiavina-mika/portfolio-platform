import {
  ACCOUNT_BANNED_STATUS, ACCOUNT_SUSPENDED_STATUS, ACCOUNT_UNBANNED_STATUS, LANGUAGE_CODES,
  NEW_DEVICE_LOGIN_STATUS,
  PASSWORD_RESET_DELAYED_STATUS, REPORT_RECEIVED_STATUS, REPORT_RESOLVED_STATUS,
  SUPPORT_SESSION_ENDED_STATUS, SUSPENSION_LIFTED_STATUS, TICKET_NEW_REPLY_FROM_AGENT_STATUS,
  TICKET_RESOLVED_STATUS,
} from '@shared/constants';
import {
  NotificationChannelEnum, NotificationChannelStatusEnum, NotificationReadStateEnum, NotificationTypeEnum,
  type NotificationType,
} from '@shared/types';

import type { StatusDotColor } from '@/components/StatusDot';
import type { DefaultMUIColorType, ISelectOption, OrderType } from '@/types/_core/app.type';

import i18n from '@/config/i18n';
import { BroadcastSegmentEnum } from '@/types/_core/notification.type';

/**
 * The order the channels are read in, everywhere they are shown together: the one every send goes
 * out on first, then the two a domain adds on top of it. Fixed rather than taken from the stored
 * object's key order, so a row missing its SMS entry does not shift the two others under the
 * headings of the row above it.
 */
export const NOTIFICATION_CHANNEL_ORDER = [
  NotificationChannelEnum.PUSH,
  NotificationChannelEnum.EMAIL,
  NotificationChannelEnum.SMS,
] as const;

/**
 * The outcomes of one channel, worst first — the one a channel shared by several recipients is named
 * after. A refusal outranks a send still queued, which outranks a template missing from the
 * configuration: each is something the team can act on. The reasons there was nothing to send (no
 * device, no number, a channel switched off) come after them, being the recipient's own situation
 * rather than an incident.
 */
export const NOTIFICATION_CHANNEL_STATUS_SEVERITY_ORDER = [
  NotificationChannelStatusEnum.FAILED,
  NotificationChannelStatusEnum.PENDING,
  NotificationChannelStatusEnum.PUSH_NO_TEMPLATE,
  NotificationChannelStatusEnum.PUSH_NO_DEVICE,
  NotificationChannelStatusEnum.SMS_RATE_LIMITED,
  NotificationChannelStatusEnum.SMS_NO_PHONE,
  NotificationChannelStatusEnum.EMAIL_NO_ADDRESS,
  NotificationChannelStatusEnum.EMAIL_DISABLED_BY_USER,
  NotificationChannelStatusEnum.SENT,
] as const;

/** The key printed under the per-recipient grid: delivered first, then the outcomes to look at. */
export const NOTIFICATION_CHANNEL_STATUS_LEGEND_ORDER = [
  NotificationChannelStatusEnum.SENT,
  NotificationChannelStatusEnum.PENDING,
  NotificationChannelStatusEnum.FAILED,
  NotificationChannelStatusEnum.PUSH_NO_DEVICE,
  NotificationChannelStatusEnum.PUSH_NO_TEMPLATE,
  NotificationChannelStatusEnum.EMAIL_DISABLED_BY_USER,
  NotificationChannelStatusEnum.EMAIL_NO_ADDRESS,
  NotificationChannelStatusEnum.SMS_NO_PHONE,
  NotificationChannelStatusEnum.SMS_RATE_LIMITED,
] as const;

/*
 * The events a send's history is told from, each read off its `<event>At` date. A send is written
 * once and never edited, so its history is short: when it left, when the last of its recipients
 * opened it, and when it was binned. The resends are not among them — they rewrite the channel
 * attempts rather than leaving a dated trace of who asked for them.
 */
/*
 * `undeleted` sits next to `deleted` rather than replacing it: both stay on the timeline, so a send
 * binned and then put back reads as the two decisions it was, with the account behind each one
 */
export const NOTIFICATION_HISTORY_EVENTS = ['created', 'receiverSeen', 'deleted', 'undeleted'];

// a send is created on behalf of its sender, which is stored as `from` rather than as `createdBy`
export const NOTIFICATION_HISTORY_AUTHOR_FIELDS: Record<string, string> = { created: 'from' };

export const NOTIFICATION_HISTORY_COLORS: Record<string, DefaultMUIColorType> = {
  created: 'primary',
  receiverSeen: 'success',
  deleted: 'error',
  undeleted: 'warning',
};

/** How far a send has got through its recipients — the list's read-rate filter. */
export const notificationReadStateOptions: ISelectOption[] = [
  {
    label: i18n.t('user:notifications.readStates.unread'),
    value: NotificationReadStateEnum.UNREAD,
  },
  {
    label: i18n.t('user:notifications.readStates.partial'),
    value: NotificationReadStateEnum.PARTIAL,
  },
  {
    label: i18n.t('user:notifications.readStates.read'),
    value: NotificationReadStateEnum.READ,
  },
];

/*
 * one recipient, or several. The two read completely differently — a delivery failure on a single
 * send is that person's problem to solve, on a fan-out it is one line of a batch — which is why
 * the list separates them rather than leaving an operator to guess from the recipients column.
 */
export const NOTIFICATION_SEND_TYPE_SINGLE = 'single';
export const NOTIFICATION_SEND_TYPE_MULTIPLE = 'multiple';

export const notificationSendTypeOptions: ISelectOption[] = [
  {
    label: i18n.t('user:notifications.sendTypes.single'),
    value: NOTIFICATION_SEND_TYPE_SINGLE,
  },
  {
    label: i18n.t('user:notifications.sendTypes.multiple'),
    value: NOTIFICATION_SEND_TYPE_MULTIPLE,
  },
];

/*
 * a send the platform raised by itself (a job, a status change) names no author at all, which is
 * what separates it from one an account asked for
 */
export const NOTIFICATION_SENDER_TYPE_SYSTEM = 'system';
export const NOTIFICATION_SENDER_TYPE_USER = 'user';

export const notificationSenderTypeOptions: ISelectOption[] = [
  {
    label: i18n.t('user:notifications.senderTypes.system'),
    value: NOTIFICATION_SENDER_TYPE_SYSTEM,
  },
  {
    label: i18n.t('user:notifications.senderTypes.user'),
    value: NOTIFICATION_SENDER_TYPE_USER,
  },
];

/**
 * How many recipients a row lists before it stops naming them and states a remainder instead. A
 * cell has to stay one line high whether the send went to two people or to forty, and past a
 * handful of faces the stack says "many" just as well as a longer one would.
 */
export const NOTIFICATION_ROW_RECIPIENTS_SHOWN = 3;

/** The same limit inside the panel a row opens onto, which has a column to itself and more room. */
export const NOTIFICATION_DETAIL_RECIPIENTS_SHOWN = 6;

/*
 * The tone each account or ticket notification takes in the list. These announce an event rather
 * than the state of an entity — what happened to the person's own account, an answer on their
 * ticket — so they have no domain colour scale of their own to borrow, and it is stated here. A
 * status not listed reads neutral rather than as an alert: an unknown state is not something to
 * raise, and any domain may add one.
 */
export const CORE_NOTIFICATION_EVENT_STATUS_COLORS: Record<string, StatusDotColor> = {
  [ACCOUNT_BANNED_STATUS]: 'error',
  [ACCOUNT_SUSPENDED_STATUS]: 'warning',
  [ACCOUNT_UNBANNED_STATUS]: 'success',
  [SUSPENSION_LIFTED_STATUS]: 'success',
  [NEW_DEVICE_LOGIN_STATUS]: 'warning',
  [PASSWORD_RESET_DELAYED_STATUS]: 'warning',
  [SUPPORT_SESSION_ENDED_STATUS]: 'info',
  [TICKET_NEW_REPLY_FROM_AGENT_STATUS]: 'info',
  [TICKET_RESOLVED_STATUS]: 'success',
  [REPORT_RECEIVED_STATUS]: 'info',
  [REPORT_RESOLVED_STATUS]: 'success',
};

/*
 * the account and ticket event codes the server writes, each with the type it is filed under — the
 * pair is what names its label, since the same code could one day be reused by another type
 */
export const CORE_NOTIFICATION_EVENT_STATUSES: { type: NotificationType; status: string }[] = [
  { type: NotificationTypeEnum.ACCOUNT, status: ACCOUNT_BANNED_STATUS },
  { type: NotificationTypeEnum.ACCOUNT, status: ACCOUNT_SUSPENDED_STATUS },
  { type: NotificationTypeEnum.ACCOUNT, status: ACCOUNT_UNBANNED_STATUS },
  { type: NotificationTypeEnum.ACCOUNT, status: SUSPENSION_LIFTED_STATUS },
  { type: NotificationTypeEnum.ACCOUNT, status: NEW_DEVICE_LOGIN_STATUS },
  { type: NotificationTypeEnum.ACCOUNT, status: PASSWORD_RESET_DELAYED_STATUS },
  { type: NotificationTypeEnum.ACCOUNT, status: SUPPORT_SESSION_ENDED_STATUS },
  { type: NotificationTypeEnum.TICKET, status: TICKET_NEW_REPLY_FROM_AGENT_STATUS },
  { type: NotificationTypeEnum.TICKET, status: TICKET_RESOLVED_STATUS },
  { type: NotificationTypeEnum.TICKET, status: REPORT_RECEIVED_STATUS },
  { type: NotificationTypeEnum.TICKET, status: REPORT_RESOLVED_STATUS },
];

/*
 * newest send first, by the date it went out: `updatedAt` moves on every channel write, reading or
 * resend, so ordering on it reshuffled the list under the operator and the indexes only cover the
 * creation date
 */
export const NOTIFICATION_LIST_DEFAULT_SORT = { orderBy: 'createdAt', order: 'desc' as OrderType };

/**
 * The languages an announcement has to be written in before it can leave. Named here rather than
 * read off the i18n config: it is the set the server refuses a send without, so the form and the
 * refusal have to agree on it whatever languages the back-office interface itself is offered in.
 */
export const BROADCAST_LOCALES = LANGUAGE_CODES;

/**
 * Upper bound on an announcement's title and body, per language — the same the server enforces. A
 * push is truncated by the operating system well before this and the app's list shows two lines:
 * the limit is what stops a newsletter going out through a channel meant for one sentence.
 */
export const BROADCAST_TITLE_MAX_LENGTH = 80;
export const BROADCAST_BODY_MAX_LENGTH = 500;

/** Who an announcement can be addressed to, in the order the form offers them. */
export const broadcastSegmentOptions: ISelectOption[] = [
  {
    label: i18n.t('user:notifications.broadcast.segments.all'),
    value: BroadcastSegmentEnum.ALL,
  },
  {
    label: i18n.t('user:notifications.broadcast.segments.city'),
    value: BroadcastSegmentEnum.CITY,
  },
];

/**
 * How many days of fallback SMS the notifications list reads: a month, the period the cost of the
 * fallback is judged on before the list of events that may be texted is widened. The server
 * accepts up to 90.
 */
export const NOTIFICATION_SMS_DAILY_COUNTS_DAYS = 30;
