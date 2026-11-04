import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import env from '@/env';

type RateLimitWindow = Parameters<typeof Ratelimit.slidingWindow>[1];

/**
 * The visitor's address, as the host forwards it; undefined when the request carries none.
 */
export const getVisitorIp = (requestHeaders: Headers): string | undefined =>
  requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  requestHeaders.get('x-real-ip') ||
  undefined;

/**
 * Builds a per-visitor check, backed by Redis: the API server only sees the website's own address for
 * every request the website makes, so its limits are shared by all visitors and cannot tell one from
 * another. The limiter is built on first use and is null when Upstash is not configured (local dev).
 * The check fails open — an unreachable Redis must not take the pages down either.
 * @param prefix Redis key prefix, one per limited feature
 * @param requests allowance per visitor in the window
 * @param window sliding window, e.g. `'1 m'`
 * @returns a function telling whether the visitor is over the allowance; true when it must be refused
 */
export const createVisitorRateLimit = (prefix: string, requests: number, window: RateLimitWindow) => {
  let limiter: Ratelimit | null | undefined;

  const getLimiter = (): Ratelimit | null => {
    if (limiter !== undefined) return limiter;

    limiter = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? new Ratelimit({
        redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
        limiter: Ratelimit.slidingWindow(requests, window),
        prefix,
      })
      : null;

    return limiter;
  };

  return async (visitorIp: string): Promise<boolean> => {
    const rateLimiter = getLimiter();

    if (!rateLimiter) return false;

    try {
      const { success } = await rateLimiter.limit(visitorIp);

      return !success;
    }
    catch (error) {
      console.error(`${prefix} rate limit unavailable:`, error);

      return false;
    }
  };
};
