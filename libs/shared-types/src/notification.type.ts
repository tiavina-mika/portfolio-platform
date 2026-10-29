import type { DateType } from './date.type';

export type NotificationSnapshot = {
  from: {
    firstName: string;
    lastName: string;
    // absent when the sender signed up by phone and never added an email
    email?: string;
    id: string;
    image: string;
  };
  /** no `email`: every recipient reads the row, and an address is not theirs to see (older rows have it) */
  to: {
    firstName: string;
    lastName: string;
    email?: string;
    id: string;
    image: string;
  }[];
  ride?: {
    id: string;
    date: DateType;
    driverId?: string;
    departure?: string;
    destination?: string;
  };
  rating?: { id: string; userId: string; fromUserId: string; value?: number };
  request?: {
    id: string;
    passengerId: string;
    driverId: string;
    date: DateType;
    createdAt: DateType;
    rideId: string;
    departure?: string;
    destination?: string;
    /** where the driver picks this passenger up — the ride departure unless they board at a stop */
    pickup?: string;
    /** where the driver drops this passenger off — the ride destination unless they alight at a stop */
    dropoff?: string;
  };
  ticket?: { id: string; status?: string };
  /** carried by the document-review notifications; brand/model is what names the car in the copy */
  vehicle?: { id: string; brand?: string; model?: string };
  /** carried by a driver's cancellation penalty: what they owe and until when they are suspended */
  penalty?: { amount?: number; suspensionEnd?: DateType };
  /**
   * carried by the notice that a refund has actually reached the passenger. The amount is the one
   * thing the notice is for: the booking's own notice ("expired", "refused", "cancelled") is sent
   * when the booking closes, which with a mobile money operator is well before the money arrives
   * and before anybody knows how much of it a cancellation tier left.
   */
  refund?: { amount?: number };
  /** carried by a passenger's cancellation suspension: when they can book again */
  suspension?: { until?: DateType };
  /**
   * carried by `RIDE_UPDATED`: what the driver moved on a ride that was already booked, and until
   * when the passenger may walk away from it for free. `fields` names the parts that changed so the
   * copy can say "the time" rather than "something"; the new values themselves are in `ride`.
   */
  rideChange?: {
    fields: string[];
    /** end of the free-cancellation window opened by the change */
    freeCancellationUntil?: DateType;
    /** the departure the passenger had booked, before the change */
    previousDate?: DateType;
    previousDeparture?: string;
    previousDestination?: string;
  };
  /**
   * carried by `ANNOUNCEMENT`: the words an operator typed, one entry per language, rendered as
   * they are. The only notification whose text is data rather than a shared template.
   */
  announcement?: {
    title: Record<string, string>;
    body: Record<string, string>;
    /** who the back-office addressed it to, kept so the send can be read back for what it was */
    segment?: string;
    /** the city the segment was narrowed to, when it was */
    city?: string;
  };
};

/**
 * Every notification type the server raises, shared so the app and the back-office label, filter
 * and route on the same literals the server writes.
 */
export enum NotificationTypeEnum {
  REQUEST = 'REQUEST',
  RIDE = 'RIDE',
  RATE = 'RATE',
  ACCOUNT = 'ACCOUNT',
  TICKET = 'TICKET',
  VEHICLE = 'VEHICLE',
  /** written by an operator in the back-office and sent to a segment of the members */
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}

export type NotificationType = `${NotificationTypeEnum}`;

export enum NotificationChannelEnum {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms'
}

export type NotificationChannel = `${NotificationChannelEnum}`;

/**
 * `failed` means the provider was reached and rejected the send; every other non-delivery value
 * is a reason there was nothing to send in the first place, which is not an incident and must
 * never be retried blindly — re-sending a `disabled_by_user` channel would override the choice
 * the recipient made. The channel each reason belongs to is carried by the `channels` key, so
 * the stored value stays short.
 */
export enum NotificationChannelStatusEnum {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  PUSH_NO_DEVICE = 'no_device',
  PUSH_NO_TEMPLATE = 'no_template',
  EMAIL_DISABLED_BY_USER = 'disabled_by_user',
  /** the recipient has no e-mail address on file (phone-only sign-up) — nothing to send to */
  EMAIL_NO_ADDRESS = 'no_email',
  SMS_NO_PHONE = 'no_phone',
  /** the recipient already received the daily allowance of fallback SMS — the text was held back */
  SMS_RATE_LIMITED = 'rate_limited'
}

export type NotificationChannelStatus = `${NotificationChannelStatusEnum}`;

/**
 * One recipient's outcome on one channel. `to` is a list, and the same send can reach one
 * passenger and fail on the next, so the outcome is stored per recipient rather than aggregated
 * into a single value that would hide the half that failed.
 */
export type NotificationChannelRecipient = {
  toId: string;
  status: NotificationChannelStatus;
  /**
   * When the send to this recipient was last evaluated — sent, refused, or found to have nothing to
   * send on. Absent while the channel has never been tried, and on rows recorded before it existed.
   */
  attemptedAt?: DateType;
  /** How many times that evaluation happened — what caps the manual resends. */
  attempts?: number;
  /**
   * What the provider answered when it refused the send — its own code and its own wording, so an
   * operator can tell an unreachable number from an exhausted quota. Present on a `failed` outcome
   * only, and dropped by the next attempt that records anything else.
   */
  errorCode?: string;
  errorMessage?: string;
};

/**
 * A key is present only for a channel this notification is meant to go out on, so the key set
 * answers "which channels were targeted" while the entries answer "who did it reach". Channel
 * names are a fixed set, hence object keys; recipient ids are data, hence an array of objects —
 * queryable with `$elemMatch` and indexable on `channels.<channel>.status`.
 */
export type NotificationChannels = Partial<Record<NotificationChannel, NotificationChannelRecipient[]>>;

/**
 * How far a notification has got through the people it was addressed to, stored rather than
 * derived: the back-office filters its list on it ("show me what nobody has opened"), and
 * comparing a read count against a recipient count is not something a database query can express.
 * A send with no recipient at all counts as `unread` — nothing has opened it.
 */
export enum NotificationReadStateEnum {
  UNREAD = 'unread',
  PARTIAL = 'partial',
  READ = 'read'
}

export type NotificationReadState = `${NotificationReadStateEnum}`;

/**
 * When one recipient opened the send. `receiverSeenIds` stays the list the app and the list filters
 * query; this is its dated companion, read by id on the back-office page only. Absent for the
 * openings recorded before it existed.
 */
export type NotificationRecipientSeenDate = {
  toId: string;
  seenAt: DateType;
};

/** Why an operator sent a notification again — what the send's history names the resend after. */
export enum NotificationResendReasonEnum {
  /** the whole send, to every recipient */
  ALL = 'all',
  /** a reminder to the recipients who had not opened it */
  UNREAD = 'unread',
  /** the recipients a provider refused */
  FAILED = 'failed',
  /** one person, picked from the per-recipient grid */
  RECIPIENT = 'recipient'
}

export type NotificationResendReason = `${NotificationResendReasonEnum}`;

/**
 * What a user chose to receive, stored on `_User.notificationPreferences`. A missing push or e-mail
 * key means "on": every row written before a key existed keeps receiving everything.
 *
 * The in-app notification list always holds every notification — these switches only decide through
 * which channel (push, e-mail, paid SMS fallback) the member is also told; every category is always
 * sent. Hiding a booking request from the
 * inbox because its push was turned off left drivers with no trace of who wanted to ride with
 * them. Security alerts and sanctions (new device, ban, suspension, penalty) ignore every switch.
 */
export type NotificationPreferences = {
  /** push for every category (absent = enabled) */
  pushEnabled?: boolean;
  /** e-mail for every category (absent = enabled) */
  emailEnabled?: boolean;
  /** paid SMS fallback for critical events: sent only on an explicit `true` (absent = disabled) */
  smsEnabled?: boolean;
};

export type NotificationPreferenceKey = keyof NotificationPreferences;
