import { SuspensionSourceEnum } from '@shared/types';

type ApplyUserSuspensionInput = {
  /** End of the suspension. */
  until: Date;
  /** Which trigger applied it. */
  source: SuspensionSourceEnum;
  /** A moderator's own wording, when a human wrote one. */
  reason?: string;
};

/**
 * Suspends an account **without saving it**: the caller decides when, and usually has other fields
 * to write in the same save.
 *
 * `isSuspendedUntil` and `suspension` are set together, here and nowhere else. They are two views
 * of one fact — every query, job and permission check filters on the date, while the member and the
 * back-office read the object — and a site that wrote one without the other would show an account
 * suspended for no stated reason, which is the whole defect this field exists to close.
 * @param user the account being suspended
 * @param suspension when it ends, what applied it, and the moderator's wording if any
 */
export const applyUserSuspension = (
  user: Parse.Object,
  { until, source, reason }: ApplyUserSuspensionInput
): void => {
  user.set('isSuspendedUntil', until);
  user.set('suspension', {
    until,
    source,
    appliedAt: new Date(),
    // left out rather than stored empty: an absent reason is what marks an automatic suspension
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  });
};

/**
 * Lifts the suspension in force on an account **without saving it** — the counterpart of
 * `applyUserSuspension`, clearing the same two fields together.
 *
 * The record of the suspension is not lost: the moderation log keeps every decision with its
 * reason and its author, which is where a contestation is instructed from. What is cleared here is
 * only the state the app reads to decide whether the account can act.
 * @param user the account whose suspension is over
 */
export const unsetUserSuspension = (user: Parse.Object): void => {
  user.set('isSuspendedUntil', null);
  user.unset('suspension');
};
