

import { z } from 'zod';

import type { IListTabCounts } from '@/types/_core/app.type';
import type { IUser } from '@/types/_core/user.type';
import type { DateType, IUserDefaultRecord } from '@/types/_core/utils.type';
import type { RequestStatusEnum, RideStatusEnum } from '@shared/domain-types';
import type {
  NotificationChannel, NotificationChannels, NotificationReadState, NotificationRecipientSeenDate,
  NotificationResendReason, NotificationSnapshot, NotificationTypeEnum,
} from '@shared/types';

import { notificationFilterSchema } from '@/validations/_core/user.validations';

/*
 * a ride or booking state, or one of the event codes the server writes for what is not a state
 * change (a reminder, a penalty, a ticket reply, a vehicle review). The event codes are left open
 * rather than listed: the server adds them as features ship, and a row carrying a code the
 * back-office does not know yet must still be typed, labelled with its raw code, and filterable.
 */
export type NotificationStatus = `${RequestStatusEnum}` | `${RideStatusEnum}` |
  (string & Record<never, never>);

/*
 * the domain-owned data of a notification travels in `payload`, so this generic core type does not
 * need to import anything of a business domain
 */
export interface INotificationAttributes extends IUserDefaultRecord {
  objectId: string;
  /** absent on a send the platform raised by itself rather than on behalf of an account */
  from?: IUser;
  to: IUser[];
  // domain-owned data set by the server when the notification is created
  payload?: Record<string, unknown>;
  seen: boolean;
  /**
   * Whether EVERY recipient has opened it. Derived from `receiverSeenIds` by the server rather
   * than written directly — it used to be the only record of reading, which meant the first of
   * four passengers to open a send marked it read for the other three as well.
   */
  receiverSeen?: boolean;
  receiverSeenAt?: DateType;
  /** The ids of the recipients who have opened it, one entry per person. */
  receiverSeenIds?: string[];
  /** When each of them opened it — absent for the openings recorded before it was kept. */
  receiverSeenDates?: NotificationRecipientSeenDate[];
  /*
   * attached to the rows of the list only: the channels the send can go out on again, how many times
   * it already did, and when last — the send's own page reads its full resend history instead
   */
  resendableChannels?: NotificationChannel[];
  resendsCount?: number;
  lastResentAt?: DateType;
  /** How many people the send was addressed to, stored so the list can filter on it. */
  toCount?: number;
  /** How far the send has got through its recipients — what the read-rate filter matches on. */
  readState?: NotificationReadState;
  /**
   * Per-recipient delivery outcome, one key per channel the send was meant to go out on. Absent
   * on notifications created before delivery was tracked at all.
   */
  channels?: NotificationChannels;
  userUnseenAt?: DateType;
  status: NotificationStatus;
  // for search
  snapshot?: NotificationSnapshot;
  type: NotificationTypeEnum;
  // localized message, one entry per supported locale (fr/en/mg)
  message?: Record<string, string>;
  /**
   * The back-office account that sent this announcement by hand — set on nothing else, since every
   * other notification is raised by an event rather than written by someone. Deliberately not
   * `from`, which the app draws as the sender's name on the recipient's phone.
   */
  broadcastBy?: IUser;
}
export type INotification = INotificationAttributes & { id: string };

export interface INotificationState {
  loading: boolean;
  notification: INotification | null;
  notifications: INotification[];
  count: number;
  /** how many sends each tab holds — the size of each scope, not of the current search */
  tabCounts: IListTabCounts;
  typeCounts: Record<string, number>;
  failedSendsCount: number;
  /** the fallback SMS of each recent day, newest first — read once when the list is opened */
  smsDailyCounts: NotificationSmsDailyCount[];
  /** true while those counts are on their way, so the card holds its place instead of saying "none" */
  smsDailyCountsLoading: boolean;
  /** the resends of the send the page is about, newest first */
  resends: INotificationResend[];
  /** the channels that send can go out on again — the push always, the others when rebuildable */
  resendableChannels: NotificationChannel[];
  /**
   * How many members the announcement being written would reach, as the server counted it. Kept in
   * the store rather than in the form: it is what the confirmation states and what the send hands
   * back to the server, so it has to survive the form re-rendering — and be cleared the moment the
   * audience is edited, since a stale count is a confirmation of the wrong send.
   */
  broadcastAudienceCount: number | null;
  /** the announcements sent most recently, newest first — read when the broadcast page opens */
  broadcastHistory: BroadcastHistoryEntry[];
}

/** Who a back-office announcement is addressed to. Mirrors the server's `BroadcastSegmentEnum`. */
export enum BroadcastSegmentEnum {
  ALL = 'all',
  CITY = 'city'
}

export type BroadcastSegment = `${BroadcastSegmentEnum}`;

/** One past announcement, stated once whatever number of rows the server wrote it as. */
export type BroadcastHistoryEntry = {
  id: string;
  title: Record<string, string>;
  segment: BroadcastSegment;
  /** only set for the `city` segment */
  city?: string;
  recipientCount: number;
  sentAt: DateType;
  /** the operator's name — empty when their account no longer exists */
  sentBy: string;
};

/** One announcement as it is sent: the audience, and the words in each language. */
export type BroadcastInput = {
  segment: BroadcastSegment;
  /** only read for the `city` segment, where it is required */
  city?: string;
  title: Record<string, string>;
  body: Record<string, string>;
};

/**
 * The announcement as the form holds it, which is the same thing plus the counted audience: the
 * count is a field rather than a flag beside the form, so an uncounted audience is simply a form
 * that cannot be submitted. It is `undefined` until the audience has been checked, and again as
 * soon as the segment or the city is edited.
 */
export type BroadcastFormInput = BroadcastInput & { expectedRecipientCount?: number };

export type NotificationFiltersInput = z.infer<typeof notificationFilterSchema>;

/**
 * The figures the list states outside its rows: how many sends each tab holds, how many each
 * category holds, and how many a provider rejected on at least one channel. None can be derived
 * from the page of rows on screen.
 */
export type NotificationListCounts = {
  typeCounts: Record<string, number>;
  failedSendsCount: number;
};

/**
 * What the fallback SMS did on one day, read off the SMS channel of the notifications. The day is on
 * the members' clock (`YYYY-MM-DD`); the cost is an estimate of what the accepted texts were billed.
 */
export type NotificationSmsDailyCount = {
  date: string;
  /** texts the provider accepted — the ones that were paid */
  sentCount: number;
  /** texts the provider refused */
  failedCount: number;
  /** texts held back because the member had reached the daily allowance */
  rateLimitedCount: number;
  /** what the day's accepted texts cost, in Ariary */
  estimatedCostAr: number;
};

/** One time an operator sent a notification again, as the send's history states it. */
export interface INotificationResend {
  objectId: string;
  channel: NotificationChannel;
  reason: NotificationResendReason;
  /** who it went to — the recipients actually addressed on the channel, not the ones first named */
  toIds: string[];
  /** the account behind it, absent when that account no longer exists */
  resentBy?: IUser;
  createdAt: DateType;
}

export type NotificationResends = Pick<INotificationState, 'resends' | 'resendableChannels'>;

/** What one resend asks for: the channel, the recipients to narrow it to, and why it is made. */
export type ResendNotificationOptions = {
  channel?: NotificationChannel;
  toIds?: string[];
  reason: NotificationResendReason;
};
