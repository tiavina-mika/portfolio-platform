import { getRedis } from '@/config/redis';
import {
  VERIFICATION_SMS_DAILY_LIMIT_GLOBAL, VERIFICATION_SMS_DAILY_LIMIT_PER_IP,
  VERIFICATION_SMS_DAILY_LIMIT_PER_PHONE,
} from '@/constants/_core/constants';

const ONE_DAY_SECONDS = 24 * 60 * 60;

export type SmsQuotaVerdict =
  { isAllowed: true } |
  /** `retryAt` is when the counter that refused the text starts over */
  { isAllowed: false; retryAt: Date };

type DailyCeilingListener = () => void | Promise<void>;

const dailyCeilingListeners: DailyCeilingListener[] = [];

/**
 * Registers what has to happen when the platform-wide daily SMS ceiling refuses a text. This file is
 * Parse-free, so it cannot warn the staff itself: the cloud layer registers the alert here.
 */
export const onSmsDailyCeilingReached = (listener: DailyCeilingListener): void => {
  dailyCeilingListeners.push(listener);
};

/** Never throws: an alert that fails must not turn a refused text into a server error. */
const notifyDailyCeilingReached = async (): Promise<void> => {
  await Promise.allSettled(dailyCeilingListeners.map(async (listener) => listener()));
};

/**
 * Counts one text against `key` over a rolling day (the window opens at the first text).
 * @returns `undefined` while the counter is within `limit`, otherwise when the window closes and the
 *   counter starts over
 */
export const consumeDailyAllowance = async (key: string, limit: number): Promise<Date | undefined> => {
  const redis = getRedis();
  const count = await redis.incr(key);

  if (count === 1) await redis.expire(key, ONE_DAY_SECONDS);

  if (count <= limit) return undefined;

  const secondsLeft = await redis.ttl(key);
  const secondsUntilReset = secondsLeft > 0 ? secondsLeft : ONE_DAY_SECONDS;

  return new Date(Date.now() + (secondsUntilReset * 1000));
};

/**
 * Takes one verification SMS out of the daily allowance of the number it goes to, of the IP
 * address that asked for it and of the whole platform. All are tracked in Redis, so the count holds across server instances
 * and cannot be reset by creating another account.
 *
 * A refused attempt still counts: whoever hammers the endpoint stays blocked until the window ends
 * instead of getting a new allowance each time the counter is read.
 * @param phoneNumber the bare number the text goes to — `undefined` when the code goes out by email
 * @param ip the caller's address, when the request carries one
 */
export const consumeSmsSendQuota = async ({ phoneNumber, ip }: {
  phoneNumber?: string;
  ip?: string;
}): Promise<SmsQuotaVerdict> => {
  if (!phoneNumber) return { isAllowed: true };

  const phoneRetryAt = await consumeDailyAllowance(
    `sms:daily:phone:${phoneNumber}`,
    VERIFICATION_SMS_DAILY_LIMIT_PER_PHONE
  );

  if (phoneRetryAt) return { isAllowed: false, retryAt: phoneRetryAt };

  const ipRetryAt = ip
    ? await consumeDailyAllowance(`sms:daily:ip:${ip}`, VERIFICATION_SMS_DAILY_LIMIT_PER_IP)
    : undefined;

  if (ipRetryAt) return { isAllowed: false, retryAt: ipRetryAt };

  /*
   * the ceiling no single caller can raise: an attacker rotating numbers and addresses stays inside
   * both caps above, and would otherwise be stopped only by the account running out of credit
   */
  const todayKey = new Date().toISOString().slice(0, 10);
  const globalRetryAt = await consumeDailyAllowance(
    `sms:daily:global:${todayKey}`,
    VERIFICATION_SMS_DAILY_LIMIT_GLOBAL
  );

  if (!globalRetryAt) return { isAllowed: true };

  await notifyDailyCeilingReached();

  return { isAllowed: false, retryAt: globalRetryAt };
};
