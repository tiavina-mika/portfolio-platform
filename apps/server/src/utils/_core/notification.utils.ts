import type {
  ChannelSendResult, NotificationChannelRecipient, NotificationReadState, NotificationRecipientSeenDate,
} from '@/types/notification.type';

import { NOTIFICATION_CHANNEL_ERROR_MAX_LENGTH } from '@/constants/_core/notification.constants';
import { NotificationChannelStatusEnum, NotificationReadStateEnum } from '@/types/notification.type';

/**
 * Turns one recipient's send attempt that actually reached the provider into their channel entry. A
 * caller that never got as far as sending records the reason instead (no phone number on file,
 * preference disabled…) — that is not a failure, and telling the two apart is the whole point of
 * storing a status rather than a boolean.
 *
 * A refusal keeps the provider's own code and wording; an accepted send carries neither, so an old
 * refusal cannot linger on an entry once the send went through.
 */
export const getChannelRecipientFromResult = (
  toId: string,
  {
    isSent, skippedStatus, errorCode, errorMessage,
  }: ChannelSendResult
): NotificationChannelRecipient => {
  if (skippedStatus) return { toId, status: skippedStatus };

  if (isSent) return { toId, status: NotificationChannelStatusEnum.SENT };

  return {
    toId,
    status: NotificationChannelStatusEnum.FAILED,
    ...(errorCode && { errorCode }),
    ...(errorMessage && { errorMessage }),
  };
};

const truncateChannelError = (value: string): string => value.slice(0, NOTIFICATION_CHANNEL_ERROR_MAX_LENGTH);

/**
 * How many times a recipient had already been tried on a channel before the pass being recorded.
 * The pending placeholder `createNotification` writes is not an attempt, but an outcome stored
 * before attempts were counted was one — it would otherwise let an old failure be resent as if it
 * had never been tried.
 */
const getPreviousAttempts = (previous?: NotificationChannelRecipient): number => {
  if (!previous) return 0;
  if (typeof previous.attempts === 'number') return previous.attempts;

  return previous.status === NotificationChannelStatusEnum.PENDING
    ? 0
    : 1;
};

/**
 * One recipient's outcome on a channel, dated and counted — what the back-office states as the last
 * attempt, and what caps the manual resends.
 *
 * A pending outcome is not an attempt: it carries forward the last real one, if any, rather than a
 * date at which nothing was tried. Keys with no value are left out instead of set to `undefined`,
 * which the Mongo driver would store as `null`.
 */
export const getAttemptedChannelRecipient = (
  recipient: NotificationChannelRecipient,
  previous: NotificationChannelRecipient | undefined,
  attemptedAt: Date
): NotificationChannelRecipient => {
  const {
    toId, status, errorCode, errorMessage,
  } = recipient;

  if (status === NotificationChannelStatusEnum.PENDING) {
    return {
      toId,
      status,
      ...(typeof previous?.attempts === 'number' && { attempts: previous.attempts }),
      ...(previous?.attemptedAt && { attemptedAt: previous.attemptedAt }),
    };
  }

  /*
   * the refusal belongs to this attempt only: it is never carried over from the previous one, and it
   * is cut to size here, where every channel's write goes through
   */
  const isFailed = status === NotificationChannelStatusEnum.FAILED;

  return {
    toId,
    status,
    attempts: getPreviousAttempts(previous) + 1,
    attemptedAt,
    ...(isFailed && errorCode && { errorCode: truncateChannelError(errorCode) }),
    ...(isFailed && errorMessage && { errorMessage: truncateChannelError(errorMessage) }),
  };
};

/**
 * How far a send has got through the people it was addressed to.
 *
 * Read state is per recipient — `receiverSeenIds` holds the ids of the ones who opened it — but a
 * database cannot compare that array's length against the recipient count, so the answer is
 * computed here and stored on the row for the back-office list to filter on.
 *
 * A send addressed to nobody is `unread` rather than `read`: an empty list is not everyone having
 * opened it, and treating it as fully read would hide a notification that never went anywhere.
 */
export const getNotificationReadState = (
  recipientCount: number,
  seenCount: number
): NotificationReadState => {
  if (seenCount <= 0) return NotificationReadStateEnum.UNREAD;
  if (seenCount >= recipientCount) return NotificationReadStateEnum.READ;

  return NotificationReadStateEnum.PARTIAL;
};

/**
 * The ids stored in `receiverSeenIds`, with anything that is not a recipient of this send dropped
 * and each id kept once. The array is written by the recipients themselves (one entry per person
 * who opens the notification in the app), so it is narrowed against `to` rather than trusted: a
 * stale id left behind by a recipient who was later removed from the send would otherwise count
 * towards the read rate for a person who is no longer addressed.
 */
export const getNotificationSeenRecipientIds = (
  recipientIds: string[],
  seenBy: unknown
): string[] => {
  if (!Array.isArray(seenBy)) return [];

  const addressed = new Set(recipientIds);

  return [...new Set(seenBy.filter((id): id is string => typeof id === 'string' && addressed.has(id)))];
};

const isRecipientSeenDate = (entry: unknown): entry is NotificationRecipientSeenDate => (
  typeof (entry as NotificationRecipientSeenDate)?.toId === 'string' &&
  !!(entry as NotificationRecipientSeenDate)?.seenAt
);

/**
 * The dated companion of `receiverSeenIds`: one entry per recipient who has opened the send, in the
 * same order. A recipient who opened it earlier keeps the date already stored; one opening it now is
 * dated `seenAt`. A recipient no longer in the list — who marked it unread again — loses their date,
 * so opening it again later is dated as the new opening it is.
 */
export const getNotificationSeenDates = (
  seenIds: string[],
  previous: unknown,
  seenAt: Date
): NotificationRecipientSeenDate[] => {
  const previousById = new Map(
    (Array.isArray(previous) ? previous : [])
      .filter(isRecipientSeenDate)
      .map((entry) => [entry.toId, entry])
  );

  return seenIds.map((toId) => previousById.get(toId) ?? { toId, seenAt });
};

/**
 * The name a job gives the one notification it is allowed to raise for an event, so a second run
 * cannot file the same news twice.
 *
 * Every scheduled job already guards itself with a field it writes (`reminder24hSentAt`, a status it
 * moves the row out of), but the guard and the notification are two writes: a crash, a timeout or a
 * Redis outage between them re-notifies everybody on the next tick. The key is stored on the
 * notification under a unique index, so the database — not the ordering of two writes — is what
 * makes the second attempt a no-op.
 *
 * `subject` is what makes the event unique, not merely what it is about: a vehicle document that is
 * renewed expires again, so its key carries the new expiry date and the reminder goes out again.
 * The audience is part of the key because the same event is announced separately to each side of a
 * ride (the driver's payout, the passengers' cancellation), and those are different sends.
 */
export const buildNotificationIdempotencyKey = ({
  type,
  status,
  subject,
  recipientIds,
}: {
  type: string;
  status?: string;
  subject: string;
  recipientIds: string[];
}): string => {
  // sorted so the same audience read in a different order is the same key
  const audience = [...new Set(recipientIds)].sort().join(',');

  return [type, status ?? '', subject, audience].join('|');
};
