import dayjs from 'dayjs';

import {
  INACTIVE_ACCOUNT_THRESHOLD_DAYS, RECYCLED_NUMBER_RESET_DELAY_HOURS,
} from '@/constants/_core/constants';

/**
 * When the account was last used. `lastLoginAt` is the only reliable signal: `updatedAt` moves on
 * every write — a job, a rating, the very reset request being judged — and a device row is deleted
 * at sign-out. An account that predates `lastLoginAt` has none yet, so its creation date stands in:
 * the worst outcome is a member who signed up long ago and never signed in since this field
 * existed waiting out the reset delay once, and the field fills in at their next sign-in.
 */
export const getLastActivityAt = (account: { lastLoginAt?: Date; createdAt: Date }): Date =>
  account.lastLoginAt ?? account.createdAt;

/** Whether the account has gone without a sign-in for longer than the inactivity threshold. */
export const isAccountInactive = (
  account: { lastLoginAt?: Date; createdAt: Date },
  now: Date = new Date()
): boolean => dayjs(now).diff(getLastActivityAt(account), 'day', true) >= INACTIVE_ACCOUNT_THRESHOLD_DAYS;

/** When an SMS password reset started at `now` on an inactive account may finally take effect. */
export const getResetAvailableAt = (now: Date = new Date()): Date =>
  dayjs(now).add(RECYCLED_NUMBER_RESET_DELAY_HOURS, 'hour').toDate();
