import type {
  NotificationChannelRecipient, NotificationChannels, NotificationChannelStatus,
} from '@shared/types';

export type NotificationStatus = string;

/*
 * the channel/read-state vocabulary is shared with the back-office and the mobile app — both read
 * the same stored values back, so it lives in `@shared/types` and is re-exported here to keep the
 * server's own imports pointing at one notification type module
 */
export {
  NotificationChannelEnum, NotificationChannelStatusEnum, NotificationReadStateEnum,
  NotificationResendReasonEnum,
} from '@shared/types';
export type {
  NotificationChannel, NotificationChannelRecipient, NotificationChannels,
  NotificationChannelStatus, NotificationReadState, NotificationRecipientSeenDate,
  NotificationResendReason,
} from '@shared/types';

export interface INotificationValues {
  type: string;
  to: Parse.User[];
  from?: Parse.User;
  status?: NotificationStatus;
  payload?: Record<string, unknown>;
  /**
   * Explicit override for the localized message template, for call sites that create a
   * Notification outside the acting-user's session (master-key-only save) — the generic
   * beforeSave trigger only derives `message` from `getNotificationMessageTemplate` when
   * `request.user` is present, which a master-key-only save never carries.
   */
  message?: Record<string, string>;
  /**
   * Explicit override for the denormalized `from`/`to` snapshot, for the same reason as
   * `message` above — the generic afterSave trigger only denormalizes it when `request.user`
   * is present, which a master-key-only save never carries.
   */
  snapshot?: Record<string, unknown>;
  /**
   * Channels this notification is expected to go out on, beyond push (always attempted from the
   * afterSave trigger). A domain that also sends an email/SMS for the same event declares it here
   * so the record shows the channel was targeted even if the send later fails.
   */
  channels?: NotificationChannels;
  /**
   * Names the one notification this event may produce, for the call sites a scheduled job can
   * replay — see `buildNotificationIdempotencyKey`. A second creation carrying a key already stored
   * is refused by the database and resolves to the notification already on file instead.
   */
  idempotencyKey?: string;
  /**
   * The back-office account that sent this notification by hand, on the only send there is one for:
   * an announcement broadcast. Deliberately not `from`, which the app draws as the sender's name —
   * an announcement is the platform speaking, and a support agent's name has no business on every
   * phone in the country. It is what makes the notification list a log of who announced what.
   */
  broadcastBy?: Parse.User;
}

export type { NotificationPreferences } from '@shared/types';

/**
 * The outcome of one e-mail or SMS handed to its provider: whether it was accepted and, when it was
 * not, the provider's own code and wording for why.
 */
export type ChannelSendResult = {
  isSent: boolean;
  /**
   * Set when the provider was never called because there was nothing to send to (no e-mail address
   * on file): a reason to skip, not a refusal, so it is recorded as such rather than as a failure.
   */
  skippedStatus?: NotificationChannelStatus;
  errorCode?: string;
  errorMessage?: string;
};

/**
 * Rebuilds one channel of an existing notification and sends it to the recipients named — what lets
 * the back-office retry an e-mail or an SMS, whose copy only the domain that raised the event knows
 * how to write. Resolves to `undefined` when the send cannot be rebuilt: a status the domain never
 * sends on that channel, or an entity that no longer exists.
 */
export type NotificationChannelSender = (
  notification: Parse.Object,
  recipients: Parse.User[]
) => Promise<NotificationChannelRecipient[] | undefined>;
