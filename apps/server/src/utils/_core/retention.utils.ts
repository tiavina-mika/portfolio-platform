import dayjs from 'dayjs';

/**
 * The date before which a row is past its retention period.
 * @param months whole months a row is kept
 * @param now the reference date, injectable for tests
 */
export const getRetentionCutoff = (months: number, now: Date = new Date()): Date =>
  dayjs(now).subtract(months, 'month').toDate();
