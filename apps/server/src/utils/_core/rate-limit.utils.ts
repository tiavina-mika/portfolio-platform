import { Ratelimit } from '@upstash/ratelimit';

import { getRedis } from '@/config/redis';
import {
  IS_TEST, REPORT_RATE_LIMIT_PER_USER, REPORT_RATE_LIMIT_PREFIX, REPORT_RATE_LIMIT_WINDOW,
} from '@/constants/_core/constants';
import {
  DEVICE_REGISTRATION_RATE_LIMIT_PER_IP, DEVICE_REGISTRATION_RATE_LIMIT_PER_USER,
  DEVICE_REGISTRATION_RATE_LIMIT_PREFIX, DEVICE_REGISTRATION_RATE_LIMIT_WINDOW,
} from '@/constants/_core/userSession.constants';
import { logger } from '@/utils/_core/logger';

let deviceRegistrationPerUserLimiter: Ratelimit | undefined;
let deviceRegistrationPerIpLimiter: Ratelimit | undefined;

// built on first use, like getRedis(), which needs dotenv to have loaded the Upstash env vars
const getDeviceRegistrationLimiters = (): { perUser: Ratelimit; perIp: Ratelimit } => {
  deviceRegistrationPerUserLimiter ??= new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(
      DEVICE_REGISTRATION_RATE_LIMIT_PER_USER, DEVICE_REGISTRATION_RATE_LIMIT_WINDOW
    ),
    prefix: `${DEVICE_REGISTRATION_RATE_LIMIT_PREFIX}:user`,
  });
  deviceRegistrationPerIpLimiter ??= new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(
      DEVICE_REGISTRATION_RATE_LIMIT_PER_IP, DEVICE_REGISTRATION_RATE_LIMIT_WINDOW
    ),
    prefix: `${DEVICE_REGISTRATION_RATE_LIMIT_PREFIX}:ip`,
  });

  return { perUser: deviceRegistrationPerUserLimiter, perIp: deviceRegistrationPerIpLimiter };
};

/**
 * Spends one unit of the device-registration allowance (`registerSession`, `registerPushToken`) of
 * both the account and the caller's address. Enforced inside the Cloud Functions rather than by an
 * Express middleware because the account is only known there: a limiter keyed on the session token
 * is reset by simply logging in again, which is exactly what a script abusing the "new device"
 * alert does. The address cap covers a script spreading the same abuse over many accounts.
 *
 * Disabled in tests (no Redis there). A Redis outage lets the call through, with an error logged:
 * refusing every login-time registration while Redis is down would break the app for everyone.
 * @returns whether the call may proceed
 */
export const consumeDeviceRegistrationQuota = async (userId: string, ip?: string): Promise<boolean> => {
  if (IS_TEST) return true;

  try {
    const { perUser, perIp } = getDeviceRegistrationLimiters();
    const [userResult, ipResult] = await Promise.all([
      perUser.limit(userId),
      ip ? perIp.limit(ip) : Promise.resolve({ success: true }),
    ]);

    return userResult.success && ipResult.success;
  }
  catch (error) {
    logger.error('consumeDeviceRegistrationQuota: rate limiter unavailable', {
      error: (error as Error).message,
    });
    return true;
  }
};

let reportPerUserLimiter: Ratelimit | undefined;

/**
 * Spends one unit of a member's report allowance (`createReport`). Keyed on the
 * account, not the session token, which a new login would reset. Like the device-registration quota,
 * it is off in tests and lets the call through when Redis is down: a report is a safety feature and
 * must not be refused because of an outage.
 * @returns whether the report may proceed
 */
export const consumeReportQuota = async (userId: string): Promise<boolean> => {
  if (IS_TEST) return true;

  try {
    reportPerUserLimiter ??= new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(REPORT_RATE_LIMIT_PER_USER, REPORT_RATE_LIMIT_WINDOW),
      prefix: REPORT_RATE_LIMIT_PREFIX,
    });

    return (await reportPerUserLimiter.limit(userId)).success;
  }
  catch (error) {
    logger.error('consumeReportQuota: rate limiter unavailable', { error: (error as Error).message });
    return true;
  }
};
