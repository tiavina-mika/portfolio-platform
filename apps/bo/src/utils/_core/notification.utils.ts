import {
  NotificationChannel, NotificationChannelEnum, NotificationChannelRecipient, NotificationChannelStatus,
  NotificationChannelStatusEnum, NotificationReadStateEnum, NotificationTypeEnum,
  type NotificationType,
} from '@shared/types';
import {
  getNotificationMessageText, NotificationMessageSurfaceEnum, toNotificationMessageLocale,
} from '@shared/utils';
import dayjs from 'dayjs';
import omit from 'lodash/omit';
import { ComponentType } from 'react';


import type { NotificationChannelIconProps } from '@/components/icons/NotificationChannelIcons';
import type { StatusDotColor } from '@/components/StatusDot';
import type { ISelectOption } from '@/types/_core/app.type';
import type { IUser } from '@/types/_core/user.type';

import {
  DeliveryBlockedIcon, DeliveryFailedIcon, DeliveryPendingIcon, DeliverySentIcon,
} from '@/components/icons/NotificationChannelIcons';
import i18n from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import {
  CORE_NOTIFICATION_EVENT_STATUS_COLORS, CORE_NOTIFICATION_EVENT_STATUSES, NOTIFICATION_CHANNEL_ORDER,
  NOTIFICATION_CHANNEL_STATUS_SEVERITY_ORDER,
} from '@/constants/_core/notification.constants';
import { IHistoryEvent } from '@/types/_core/history.type';
import {
  INotification, INotificationResend, NotificationSmsDailyCount, NotificationStatus,
} from '@/types/_core/notification.type';
import { displayDate, getParseDateValue } from '@/utils/_core/date.utils';
import { getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

/**
 * Open registry: a business domain (ride/request/rating) contributes the "related entity" section of
 * the generic notification page (`pages/_core/notifications/Notification.tsx`) instead of that page
 * hard-importing ride/request/rating panels.
 *
 * `matches` claims a notification only when it actually carries the entity: the page hides the
 * section for every notification no renderer claims, rather than drawing an empty card under it.
 */
export type NotificationPreviewRendererProps = {
  notification: INotification;
};

export type NotificationPreviewRenderer = {
  matches: (notification: INotification) => boolean;
  Component: ComponentType<NotificationPreviewRendererProps>;
};

const notificationPreviewRenderers: NotificationPreviewRenderer[] = [];

export const registerNotificationPreviewRenderer = (renderer: NotificationPreviewRenderer): void => {
  notificationPreviewRenderers.push(renderer);
};

export const getNotificationPreviewRenderer = (
  notification: INotification
): NotificationPreviewRenderer['Component'] | undefined =>
  notificationPreviewRenderers.find((renderer) => renderer.matches(notification))?.Component;

/**
 * Open registry: a business domain contributes the statuses of the notifications it sends (a ride
 * state, a booking state, a reminder or penalty code) so the generic notification list can label,
 * colour and filter them without importing a ride or a booking.
 *
 * - `statusOptions`: the states of the entities the domain announces, offered by the status filter
 * - `events` / `eventColors`: the event codes the domain files under a notification type, with the
 *   tone each one takes
 * - `typeResolvers`: the label and tone of a status the domain announces for a type, used when no
 *   translated phrase names the exact type/status pairing
 */
export type NotificationStatusContribution = {
  statusOptions?: ISelectOption[];
  events?: { type: NotificationType; status: string }[];
  eventColors?: Record<string, StatusDotColor>;
  typeResolvers?: Partial<Record<NotificationType, {
    getLabel: (status: NotificationStatus) => string;
    getColor: (status: NotificationStatus) => StatusDotColor;
  }>>;
};

const notificationStatusContributions: NotificationStatusContribution[] = [];

export const registerNotificationStatusContribution = (
  contribution: NotificationStatusContribution
): void => {
  notificationStatusContributions.push(contribution);
};

/**
 * What the notification announced, as one phrase: "Trajet terminé", "Demande acceptée",
 * "Compte suspendu".
 *
 * It names the thing and the state it is in, because a notification list mixes domains — a column
 * of bare states ("Terminé", "Acceptée", "Annulé") leaves the reader to work out from the message
 * beside it whether a ride, a booking or an account is being talked about. The phrases are written
 * out per pairing rather than composed from a type and a state at runtime: in French the state
 * agrees with the noun it qualifies, so "Demande" + "Accepté" is a sentence no concatenation can
 * fix.
 *
 * A pairing with no phrase of its own falls back to the state as the domain labels it, and to the
 * raw code otherwise: a status the server started writing before the back-office learned it must
 * still read as something, never as an empty chip.
 */
export const getNotificationStatusLabelByValue = (
  type: NotificationType,
  status: NotificationStatus
): string => {
  const label = i18n.t(`user:notifications.statusLabels.${type}.${status}`, { defaultValue: '' });

  if (label) return label;

  for (const { typeResolvers } of notificationStatusContributions) {
    const domainLabel = typeResolvers?.[type]?.getLabel(status);

    if (domainLabel) return domainLabel;
  }

  return status;
};

/**
 * The tone the status chip takes, dispatched the same way its label is: a notification carries the
 * status of whatever it announces, so a status is coloured on the scale of the domain that owns it
 * — the list must not invent a scale that disagrees with the one the entity's own page shows for
 * the same word.
 *
 * A notification about a review has no state of its own to be in — the review either happened or
 * the notification would not exist — so it reads as information rather than as a state.
 *
 * An event code (a reminder, a penalty, a document review) is not a state of anything, so it is
 * coloured on its own scale first; a code nobody coloured yet reads neutral rather than as an alert.
 */
export const getNotificationStatusColorByValue = (
  type: NotificationType,
  status: NotificationStatus
): StatusDotColor => {
  const eventColor = CORE_NOTIFICATION_EVENT_STATUS_COLORS[status] ??
    notificationStatusContributions.find(({ eventColors }) => eventColors?.[status])?.eventColors?.[status];

  if (eventColor) return eventColor;

  for (const { typeResolvers } of notificationStatusContributions) {
    const resolver = typeResolvers?.[type];

    if (resolver) return resolver.getColor(status);
  }

  if (type === NotificationTypeEnum.RATE) return 'info';

  return 'default';
};

// every status a notification can carry: the entity states, then the event codes
export const getNotificationStatusOptions = (): ISelectOption[] => [
  ...notificationStatusContributions.flatMap(({ statusOptions }) => statusOptions ?? []),
  ...[
    ...notificationStatusContributions.flatMap(({ events }) => events ?? []),
    ...CORE_NOTIFICATION_EVENT_STATUSES,
  ].map(({ type, status }) => ({
    label: i18n.t(`user:notifications.statusLabels.${type}.${status}`, { defaultValue: status }),
    value: status,
  })),
];

/*
 * ----------------------------------------------------- //
 * -------------------- read state --------------------- //
 * ----------------------------------------------------- //
 */

/**
 * How many of a send's recipients have opened it, out of how many it was addressed to.
 *
 * `toCount` is read rather than `to.length` because the list only loads the recipients it draws;
 * it falls back to the array for a row written before the counter existed.
 */
export const getNotificationReadRate = (
  notification: INotification
): { seen: number; total: number; ratio: number } => {
  const total = notification.toCount ?? notification.to?.length ?? 0;
  const seen = Math.min(notification.receiverSeenIds?.length ?? 0, total);

  return { seen, total, ratio: total > 0 ? seen / total : 0 };
};

/** The read rate as one figure: "3 / 4 · 75 %". */
export const getNotificationReadRatioLabel = (notification: INotification): string => {
  const { seen, total, ratio } = getNotificationReadRate(notification);

  return i18n.t('user:notifications.readRatio', { seen, total, percent: Math.round(ratio * 100) });
};

/**
 * How far a send has got, as the list shows it. Stored on the row, but derived here for the rows
 * written before per-recipient tracking existed — they carry no value at all, and a blank cell in
 * the middle of the column reads as a bug rather than as an old record.
 */
export const getNotificationReadState = (notification: INotification): NotificationReadStateEnum => {
  if (notification.readState) return notification.readState as NotificationReadStateEnum;

  const { seen, total } = getNotificationReadRate(notification);

  if (seen <= 0) return NotificationReadStateEnum.UNREAD;
  if (seen >= total) return NotificationReadStateEnum.READ;

  return NotificationReadStateEnum.PARTIAL;
};

export const getNotificationReadStateLabel = (notification: INotification): string => (
  i18n.t(`user:notifications.readStates.${getNotificationReadState(notification)}`)
);

/**
 * Nobody, some, everybody — read as a traffic light down the column. Red rather than neutral for a
 * send nobody has opened: it is the state an operator is looking for, not the absence of one.
 */
export const getNotificationReadStateColor = (notification: INotification): StatusDotColor => {
  switch (getNotificationReadState(notification)) {
    case NotificationReadStateEnum.READ:
      return 'success';
    case NotificationReadStateEnum.PARTIAL:
      return 'warning';
    default:
      return 'error';
  }
};

export const isNotificationSeenByRecipient = (
  notification: INotification,
  userId?: string
): boolean => !!userId && !!notification.receiverSeenIds?.includes(userId);

/** When one recipient opened the send — absent when it was not opened, or opened before it was kept. */
export const getNotificationRecipientSeenAt = (
  notification: INotification,
  userId: string
): string | undefined => {
  const seenAt = notification.receiverSeenDates?.find((entry) => entry.toId === userId)?.seenAt;

  return seenAt
    ? String(getParseDateValue(seenAt))
    : undefined;
};

/** The id a recipient is known by, whichever side of a pointer they arrived through. */
export const getNotificationRecipientId = (user: IUser): string | undefined => (
  user.id ?? user.objectId
);

/**
 * The recipients who have not opened the send — who a reminder is worth sending to. A push seen on
 * a lock screen and never tapped counts as not opened, which is the point: the question the list
 * answers is who has actually read the message, not whose phone displayed it.
 */
export const getNotificationUnreadRecipientIds = (notification: INotification): string[] => (
  (notification.to ?? [])
    .map(getNotificationRecipientId)
    .filter((id): id is string => !!id && !isNotificationSeenByRecipient(notification, id))
);

/*
 * ----------------------------------------------------- //
 * --------------------- channels ---------------------- //
 * ----------------------------------------------------- //
 */

/**
 * Whether one recipient's outcome on one channel can be sent again from the back-office.
 *
 * `failed` is the only outcome worth retrying: the provider was reached and rejected the send.
 * Every other non-delivery says there was nothing to send in the first place — no device
 * registered, no phone number, the recipient turned the channel off — so offering a retry on one
 * would either fail identically or override a choice the recipient made.
 *
 * And only on a channel the send can be rebuilt on: the push always can, its body is the
 * notification's own message; an e-mail or an SMS only when the domain that raised the event knows
 * how to write it again, which only the send's own page is told — everywhere else the push is the
 * one channel offered.
 */
export const isNotificationChannelRetryable = (
  channel: NotificationChannel,
  status: NotificationChannelStatus,
  resendableChannels: NotificationChannel[] = [NotificationChannelEnum.PUSH]
): boolean => (
  status === NotificationChannelStatusEnum.FAILED && resendableChannels.includes(channel)
);

const ATTEMPTED_CHANNEL_STATUSES: NotificationChannelStatus[] = [
  NotificationChannelStatusEnum.SENT,
  NotificationChannelStatusEnum.PENDING,
  NotificationChannelStatusEnum.FAILED,
];

/**
 * Every outcome that says there was nothing to send in the first place — no device, no number, no
 * template, a channel the recipient turned off — as opposed to the three a delivery attempt ends on.
 * They are drawn with a dashed edge, so they never read as a delivery that was tried and refused.
 */
export const isNotificationChannelStatusBlocked = (status: NotificationChannelStatus): boolean => (
  !ATTEMPTED_CHANNEL_STATUSES.includes(status)
);

type OutcomeIcon = ComponentType<NotificationChannelIconProps>;

const OUTCOME_ICONS: Partial<Record<NotificationChannelStatus, OutcomeIcon>> = {
  [NotificationChannelStatusEnum.SENT]: DeliverySentIcon,
  [NotificationChannelStatusEnum.PENDING]: DeliveryPendingIcon,
  [NotificationChannelStatusEnum.FAILED]: DeliveryFailedIcon,
};

/**
 * The mark an outcome is drawn with. The three a delivery attempt ends on have a shape of their
 * own; every reason there was nothing to send reads as the same bar.
 */
export const getDeliveryOutcomeIcon = (
  status: NotificationChannelStatus
): ComponentType<NotificationChannelIconProps> => OUTCOME_ICONS[status] ?? DeliveryBlockedIcon;

export const getNotificationChannelLabel = (channel: NotificationChannel): string => (
  i18n.t(`user:notifications.channels.${channel}`)
);

export const getNotificationChannelStatusLabel = (status: NotificationChannelStatus): string => (
  i18n.t(`user:notifications.channelStatuses.${status}.label`)
);

/** Why the channel ended up in that state, in the words an operator can act on. */
export const getNotificationChannelStatusDescription = (
  status: NotificationChannelStatus
): string => i18n.t(`user:notifications.channelStatuses.${status}.description`);

type ProviderRefusal = Pick<NotificationChannelRecipient, 'errorCode' | 'errorMessage'>;

/**
 * What the provider answered when it refused, as one phrase: its wording, with the code support
 * quotes back to the provider. Absent when it gave no reason, and on a send recorded before the
 * answer was kept.
 */
export const getNotificationProviderAnswer = ({
  errorCode, errorMessage,
}: ProviderRefusal): string | undefined => {
  if (errorMessage && errorCode) {
    return i18n.t('user:notifications.providerErrorWithCode', { message: errorMessage, code: errorCode });
  }

  return errorMessage ?? errorCode;
};

/**
 * Why one recipient's channel ended as it did: the provider's own answer when it refused and gave
 * one, the general explanation of the outcome otherwise.
 */
export const getNotificationOutcomeExplanation = (
  entry: ProviderRefusal & Pick<NotificationChannelRecipient, 'status'>
): string => {
  const answer = getNotificationProviderAnswer(entry);

  return answer
    ? i18n.t('user:notifications.providerAnswer', { answer })
    : getNotificationChannelStatusDescription(entry.status);
};

export const getNotificationChannelStatusColor = (
  status: NotificationChannelStatus
): StatusDotColor => {
  switch (status) {
    case NotificationChannelStatusEnum.SENT:
      return 'success';
    case NotificationChannelStatusEnum.FAILED:
      return 'error';
    case NotificationChannelStatusEnum.PENDING:
    case NotificationChannelStatusEnum.PUSH_NO_TEMPLATE:
      return 'warning';
    /*
     * the recipient's own settings and the state of their account are not incidents: a missing
     * phone number or a channel they switched off is the system working as asked
     */
    default:
      return 'default';
  }
};

export type NotificationChannelSummary = {
  channel: NotificationChannel;
  sent: number;
  failed: number;
  pending: number;
  total: number;
  /** the recipients the channel reached who have also opened the send */
  seen: number;
  /** how many recipients ended on each outcome */
  statusCounts: Partial<Record<NotificationChannelStatus, number>>;
  /** the outcome the whole channel is named after — the worst one any of its recipients ended on */
  status: NotificationChannelStatus;
  /** when the channel was last evaluated, for whichever of its recipients came last */
  lastAttemptedAt?: NotificationChannelRecipient['attemptedAt'];
  /** what the provider answered for the recipients it refused, each distinct answer once */
  providerAnswers: string[];
  /** the state the whole channel is read as, worst outcome first */
  color: StatusDotColor;
  /** the one outcome a single-recipient send has, which the cell can state in full */
  soloStatus?: NotificationChannelStatus;
};

/**
 * One channel of one send, summed over its recipients. The worst outcome wins: a fan-out where one
 * push out of forty was rejected is a row an operator has to look at, and averaging it into
 * "mostly fine" is what would hide it.
 */
const getNotificationChannelSummary = (
  notification: INotification,
  channel: NotificationChannel
): NotificationChannelSummary | undefined => {
  const recipients = notification.channels?.[channel];

  if (!recipients?.length) return undefined;

  const statusCounts = recipients.reduce<Partial<Record<NotificationChannelStatus, number>>>(
    (counts, recipient) => ({
      ...counts,
      [recipient.status]: (counts[recipient.status] ?? 0) + 1,
    }),
    {}
  );
  const sent = statusCounts[NotificationChannelStatusEnum.SENT] ?? 0;
  const failed = statusCounts[NotificationChannelStatusEnum.FAILED] ?? 0;
  const pending = statusCounts[NotificationChannelStatusEnum.PENDING] ?? 0;

  /*
   * opened by someone the channel actually reached: a recipient who read the send in the app after
   * their SMS was refused did not read it because of the SMS
   */
  const seen = recipients.filter((recipient) => (
    recipient.status === NotificationChannelStatusEnum.SENT &&
    isNotificationSeenByRecipient(notification, recipient.toId)
  )).length;

  /*
   * a date nested in a stored object arrives in Parse's wrapped form, which dayjs cannot read — it is
   * unwrapped before being compared, and handed on unwrapped
   */
  const lastAttemptedAt = recipients.reduce<NotificationChannelRecipient['attemptedAt']>(
    (latest, recipient) => {
      const attemptedAt = recipient.attemptedAt && getParseDateValue(recipient.attemptedAt);

      return attemptedAt && (!latest || dayjs(attemptedAt).isAfter(dayjs(latest)))
        ? attemptedAt
        : latest;
    },
    undefined
  );
  const providerAnswers = [...new Set(recipients
    .filter((recipient) => recipient.status === NotificationChannelStatusEnum.FAILED)
    .map(getNotificationProviderAnswer)
    .filter((answer): answer is string => !!answer))];

  const color: StatusDotColor = failed
    ? 'error'
    : pending
      ? 'warning'
      : sent === recipients.length
        ? 'success'
        : 'default';

  return {
    channel,
    sent,
    failed,
    pending,
    total: recipients.length,
    seen,
    statusCounts,
    status: NOTIFICATION_CHANNEL_STATUS_SEVERITY_ORDER.find((status) => statusCounts[status]) ??
      NotificationChannelStatusEnum.SENT,
    lastAttemptedAt,
    providerAnswers,
    color,
    soloStatus: recipients.length === 1
      ? recipients[0].status
      : undefined,
  };
};

/** Every channel this send was meant to go out on, in the fixed reading order. */
export const getNotificationChannelSummaries = (
  notification: INotification
): NotificationChannelSummary[] => (
  NOTIFICATION_CHANNEL_ORDER
    .map((channel) => getNotificationChannelSummary(notification, channel))
    .filter((summary): summary is NotificationChannelSummary => !!summary)
);

/**
 * What is left to look at on a channel, as one line: "1 en attente · 1 aucun appareil". The
 * delivered recipients are left out — they are the count standing beside it — and the worst
 * outcome is named first.
 */
export const getNotificationChannelOpenOutcomesLabel = (summary: NotificationChannelSummary): string => (
  NOTIFICATION_CHANNEL_STATUS_SEVERITY_ORDER
    .filter((status) => status !== NotificationChannelStatusEnum.SENT && !!summary.statusCounts[status])
    .map((status) => i18n.t('user:notifications.statusCount', {
      count: summary.statusCounts[status],
      label: getNotificationChannelStatusLabel(status).toLocaleLowerCase(i18n.language),
    }))
    .join(' · ')
);

export type NotificationDeliveryMatrixCell = ProviderRefusal & {
  channel: NotificationChannel;
  status: NotificationChannelStatus;
};

export type NotificationDeliveryRow = {
  user: IUser;
  userId: string;
  cells: NotificationDeliveryMatrixCell[];
};

/**
 * The send laid out as recipients down and channels across — what answers "did this reach that
 * person, and on what" without reading a stored object by hand.
 *
 * A recipient with no entry on a channel the send targets still gets a cell, marked pending: the
 * grid has to stay rectangular, or the columns stop lining up with their headings the moment one
 * row is short.
 */
export const getNotificationDeliveryMatrix = (
  notification: INotification
): { channels: NotificationChannel[]; rows: NotificationDeliveryRow[] } => {
  const channels = getNotificationChannelSummaries(notification).map((summary) => summary.channel);

  const rows = (notification.to ?? []).reduce<NotificationDeliveryRow[]>((accumulator, user) => {
    const userId = getNotificationRecipientId(user);

    if (!userId) return accumulator;

    return [...accumulator, {
      user,
      userId,
      cells: channels.map((channel) => {
        const entry = notification.channels?.[channel]?.find((recipient) => recipient.toId === userId);

        return {
          channel,
          status: entry?.status ?? NotificationChannelStatusEnum.PENDING,
          errorCode: entry?.errorCode,
          errorMessage: entry?.errorMessage,
        };
      }),
    }];
  }, []);

  return { channels, rows };
};

/** How many failed sends a row carries, across every channel — what its retry control counts. */
export const getNotificationFailedCount = (notification: INotification): number => (
  NOTIFICATION_CHANNEL_ORDER.reduce((total, channel) => total + (
    (notification.channels?.[channel] ?? [])
      .filter((recipient) => recipient.status === NotificationChannelStatusEnum.FAILED).length
  ), 0)
);

/** The recipients a provider refused on one channel — who a retry of that channel goes to. */
export const getNotificationFailedRecipientIds = (
  notification: INotification,
  channel: NotificationChannel
): string[] => (
  (notification.channels?.[channel] ?? [])
    .filter((recipient) => recipient.status === NotificationChannelStatusEnum.FAILED)
    .map((recipient) => recipient.toId)
);

/**
 * Whether one recipient opened the send, and when: "Lue le 24/08/2026 13:34". An opening recorded
 * before the dates were kept is stated without one, rather than as a send nobody opened.
 */
export const getNotificationRecipientReadLabel = (notification: INotification, userId?: string): string => {
  if (!userId || !isNotificationSeenByRecipient(notification, userId)) {
    return i18n.t('user:notifications.readStates.unread');
  }

  const seenAt = getNotificationRecipientSeenAt(notification, userId);

  return seenAt
    ? i18n.t('user:notifications.readAt', { date: displayDate(seenAt, true) })
    : i18n.t('user:notifications.readStates.read');
};

/** The channels a list row can be retried on — the push alone when the row does not say. */
export const getNotificationResendableChannels = (notification: INotification): NotificationChannel[] => (
  notification.resendableChannels ?? [NotificationChannelEnum.PUSH]
);

/** What the providers answered on a send, channel by channel: "SMS : Unreachable number (code 21614)". */
export const getNotificationProviderAnswersLabel = (notification: INotification): string => (
  getNotificationChannelSummaries(notification)
    .filter((summary) => summary.providerAnswers.length > 0)
    .map((summary) => i18n.t('user:notifications.channelAnswer', {
      channel: getNotificationChannelLabel(summary.channel),
      answer: summary.providerAnswers.join(' · '),
    }))
    .join(' — ')
);

/** How many refusals a send carries on each channel it can go out on again. */
export const getNotificationRetryableFailedCounts = (
  notification: INotification,
  resendableChannels: NotificationChannel[]
): Partial<Record<NotificationChannel, number>> => (
  getNotificationChannelSummaries(notification)
    .filter((summary) => summary.failed > 0 && resendableChannels.includes(summary.channel))
    .reduce((counts, summary) => ({ ...counts, [summary.channel]: summary.failed }), {})
);

/** How many there are across every channel of a per-channel count. */
export const getNotificationChannelCountsTotal = (
  counts: Partial<Record<NotificationChannel, number>>
): number => (
  Object.values(counts).reduce((total, count) => total + (count ?? 0), 0)
);

/**
 * The refusals of a whole selection, channel by channel, each row counted on the channels it can go
 * out on again — what a batch retry is confirmed on.
 */
export const getNotificationsRetryableFailedCounts = (
  notifications: INotification[]
): Partial<Record<NotificationChannel, number>> => notifications
  .reduce<Partial<Record<NotificationChannel, number>>>(
    (totals, notification) => {
      const counts = getNotificationRetryableFailedCounts(
        notification, getNotificationResendableChannels(notification)
      );

      return NOTIFICATION_CHANNEL_ORDER.reduce((accumulator, channel) => ({
        ...accumulator,
        [channel]: (accumulator[channel] ?? 0) + (counts[channel] ?? 0),
      }), totals);
    },
    {}
  );

/** "1 Push · 2 SMS": a count per channel, in the fixed reading order, channels with none left out. */
export const getNotificationChannelCountsLabel = (
  counts: Partial<Record<NotificationChannel, number>>
): string => (
  NOTIFICATION_CHANNEL_ORDER
    .filter((channel) => (counts[channel] ?? 0) > 0)
    .map((channel) => `${counts[channel]} ${getNotificationChannelLabel(channel)}`)
    .join(' · ')
);

/*
 * ----------------------------------------------------- //
 * ---------------------- resends ---------------------- //
 * ----------------------------------------------------- //
 */

/** One resend, named after why it was made, how many it went to and on which channel. */
export const getNotificationResendLabel = (resend: INotificationResend): string => (
  i18n.t(`user:notifications.resendReasons.${resend.reason}`, {
    count: resend.toIds.length,
    channel: getNotificationChannelLabel(resend.channel),
  })
);

/**
 * The resends of a send as events of its history, each dated and signed by the account that asked
 * for it — so the rail tells an operator the send already went out again before they press the
 * button once more.
 */
export const getNotificationResendHistoryEvents = (resends: INotificationResend[]): IHistoryEvent[] => (
  resends.map((resend) => ({
    key: resend.objectId,
    label: getNotificationResendLabel(resend),
    date: resend.createdAt,
    user: resend.resentBy,
    color: 'info',
  }))
);

/**
 * The one event a hand-written announcement adds to its history: who sent it, and when.
 *
 * It is not a date column of the record like the others on the rail — an announcement is sent once,
 * at creation — so it is built here and handed over as an extra event. Empty for every other
 * notification, which nobody sent by hand.
 */
export const getNotificationBroadcastHistoryEvents = (
  notification: INotification
): IHistoryEvent[] => (
  notification.broadcastBy
    ? [{
      key: 'broadcast',
      label: i18n.t('user:notifications.broadcast.sentBy'),
      date: notification.createdAt,
      user: notification.broadcastBy,
      color: 'warning',
    }]
    : []
);

/*
 * ----------------------------------------------------- //
 * ---------------------- content ---------------------- //
 * ----------------------------------------------------- //
 */

/**
 * The message as the recipient read it, in the back-office's own language when the platform writes
 * that language and in its default otherwise — never a blank cell, which would read as a
 * notification that was sent with no text.
 *
 * Written out of the catalogue shared with the server and the app (`@shared/domain-utils`) rather
 * than off the stored `message`: that column holds the template, so the list used to print "Le
 * trajet de {departure} à {destination} le {date} a été annulé" — placeholders and all — at the very
 * moment support needs to quote back to a member what they were actually told. The stored template
 * is still the fallback for the rows written before the catalogue covered their status.
 */
export const getNotificationMessage = (notification: INotification): string => {
  const text = getNotificationMessageText({
    type: notification.type,
    status: notification.status,
    data: { ...omit(notification.snapshot ?? {}, ['from', 'to']), ...(notification.payload ?? {}) },
    senderName: notification.from ? getUserFullName(notification.from) : undefined,
    surface: NotificationMessageSurfaceEnum.PUSH,
    locale: toNotificationMessageLocale(i18n.language),
    formatDate: (value) => displayDate(value, true),
    formatPrice: (value) => formatPriceWithCurrency(value),
  });

  return text ?? notification.message?.[i18n.language] ?? notification.message?.[DEFAULT_LOCALE] ?? '';
};

/**
 * The objects a notification points at, as the references an operator quotes — the ride it
 * announced, the booking it answered.
 *
 * Only the id of each is stated. The payload is domain-owned and its shape is whatever the domain
 * that wrote it chose, so rendering it field by field would make this generic list depend on every
 * domain that can raise a notification; the id is the one key every entry carries and the one
 * thing a support ticket is written around.
 */
export const getNotificationPayloadFacts = (
  notification: INotification
): { key: string; id: string }[] => (
  Object.entries(notification.payload ?? {}).reduce<{ key: string; id: string }[]>(
    (facts, [key, value]) => {
      const id = (value as { id?: unknown })?.id;

      if (typeof id !== 'string' || !id) return facts;

      return [...facts, { key, id }];
    },
    []
  )
);

/**
 * The fallback SMS of several days added up — the figures the card states above its day-by-day list.
 * The cost is the sum of each day's estimate, not a recomputation: the server prices the texts.
 */
export const getNotificationSmsTotals = (
  counts: NotificationSmsDailyCount[]
): Omit<NotificationSmsDailyCount, 'date'> => (
  counts.reduce((totals, day) => ({
    sentCount: totals.sentCount + day.sentCount,
    failedCount: totals.failedCount + day.failedCount,
    rateLimitedCount: totals.rateLimitedCount + day.rateLimitedCount,
    estimatedCostAr: totals.estimatedCostAr + day.estimatedCostAr,
  }), {
    sentCount: 0, failedCount: 0, rateLimitedCount: 0, estimatedCostAr: 0,
  })
);
