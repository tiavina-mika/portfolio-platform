import { posix } from 'node:path';

import type { NextFunction, Request, Response } from 'express';


import { Ratelimit } from '@upstash/ratelimit';
import express from 'express';


import { getRedis } from '@/config/redis';
import { IS_TEST, JSON_BODY_LIMIT } from '@/constants/_core/constants';
import { DOCS_LOGIN_MAX_ATTEMPTS, DOCS_LOGIN_WINDOW } from '@/constants/_core/docs.constants';

/**
 * Disabled in test env so Jest/integration tests don't get throttled across runs.
 */
const skip = (): boolean => IS_TEST;

export const RATE_LIMIT_MESSAGE_TEXT = 'Too many requests, please try again later.';

const RATE_LIMIT_MESSAGE = { message: RATE_LIMIT_MESSAGE_TEXT };

/**
 * Allowance of the auth limiter, shared with Parse Server's own `rateLimit` option (see index.ts)
 * so a caller gets the same budget whichever of the two it goes through.
 */
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 10;
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Builds a memoized getter for a Ratelimit instance, constructed on first use rather than at
 * module load — mirrors getRedis(), which needs dotenv to have already loaded the Upstash env vars.
 */
const lazyRatelimit = (factory: () => Ratelimit): (() => Ratelimit) => {
  let instance: Ratelimit | undefined;

  return () => {
    instance ??= factory();
    return instance;
  };
};

/**
 * Login, signup, and verification-code endpoints — brute-force / account-enumeration risk.
 */
const getAuthLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(AUTH_RATE_LIMIT_MAX_REQUESTS, '15 m'),
  prefix: 'ratelimit:auth',
}));

/**
 * Second-factor attempts, counted per account (not per address) and atomically in Redis: the
 * failed-code counter stored on the account is read then written, so requests sent in parallel
 * would all read the same value and slip past the lock.
 */
const getMfaAccountLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.fixedWindow(10, '15 m'),
  prefix: 'ratelimit:mfaAccount',
}));

/**
 * Whether the account may still try a second-factor code in the current window.
 */
export const isMfaAttemptAllowed = async (userId: string): Promise<boolean> => {
  if (skip()) return true;

  const { success: isAllowed } = await getMfaAccountLimiter().limit(userId);

  return isAllowed;
};

/**
 * File upload endpoint — limits storage abuse and Cloudinary usage cost.
 */
const getFileUploadLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(30, '15 m'),
  prefix: 'ratelimit:fileUpload',
}));

/**
 * GDPR data export endpoint — legitimate but query-heavy (fans out across every collection
 * holding user data), so it's capped generously rather than tightly like auth endpoints.
 */
const getDataExportLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(3, '24 h'),
  prefix: 'ratelimit:dataExport',
}));

/**
 * Contact form submission (mobile) — mobile has no reCAPTCHA equivalent, so an authenticated
 * per-user cap replaces it as the anti-abuse mechanism. The website's forms have their own limiter.
 */
const getContactLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'ratelimit:contact',
}));

/**
 * Contact and newsletter forms of the website — a safety net behind the per-visitor limit the website
 * applies itself. Sized for the website rather than for one visitor: the forms are submitted by the
 * website's server, so every visitor arrives from its address and shares this one allowance.
 */
const getWebsiteFormLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  prefix: 'ratelimit:websiteForm',
}));

/**
 * Article view and share counters — caps a script calling the function directly to inflate them.
 * Sized for the website rather than for one visitor:
 * the counters are incremented by the website's server, so every visitor arrives from its address.
 */
const getContentCounterLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(600, '1 m'),
  prefix: 'ratelimit:contentCounter',
}));

/**
 * Password form of the documentation sites — the password is shared and chosen by hand, so the only
 * thing between a script and the docs is how fast it may try.
 */
const getDocsLoginLimiter = lazyRatelimit(() => new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(DOCS_LOGIN_MAX_ATTEMPTS, DOCS_LOGIN_WINDOW),
  prefix: 'ratelimit:docsLogin',
}));

/**
 * Shared across Cloud Run instances via Upstash Redis — an in-memory store would let an attacker
 * multiply attempts by the number of active instances.
 */
const getRequestIp = (req: Request): string => req.ip ?? 'unknown';

/**
 * The Parse JS / React Native SDK posts its JSON as `text/plain` (no CORS preflight in a browser),
 * which the app-wide JSON parser skips: at this point the body is still unread, so it is read here.
 * Parse Server's own parser leaves a body that is already read alone.
 */
const parseTextPlainBody = express.json({ type: 'text/plain', limit: JSON_BODY_LIMIT });

const readTextPlainBody = (req: Request, res: Response): Promise<void> => new Promise((resolve) => {
  // a malformed body is Parse Server's to refuse; the limiter only falls back to the address
  parseTextPlainBody(req, res, () => resolve());
});

/**
 * The Parse JS / React Native SDK sends the session token in the request body (`_SessionToken`),
 * not in the `X-Parse-Session-Token` header — reading the header alone made every mobile member
 * fall back to the IP, so members behind one mobile-operator NAT shared a single allowance.
 */
const getSessionKey = async (req: Request, res: Response): Promise<string> => {
  await readTextPlainBody(req, res);

  const body: unknown = req.body;
  const bodyToken = typeof body === 'object' && body !== null
    ? (body as { _SessionToken?: unknown })._SessionToken
    : undefined;
  const headerToken = req.header('X-Parse-Session-Token');
  const token = headerToken ?? (typeof bodyToken === 'string' ? bodyToken : undefined);

  /*
   * Parse Server authenticates with one of the two depending on the app id it finds, so a caller
   * sending two different tokens could be counted on one while running on the other — a fresh,
   * random token per request would then get a fresh allowance. No SDK sends two different tokens.
   */
  if (headerToken && typeof bodyToken === 'string' && bodyToken !== headerToken) return getRequestIp(req);

  return token || getRequestIp(req);
};

type RateLimiterMiddleware = ((req: Request, res: Response, next: NextFunction) => Promise<void>) & {
  isAllowed: (req: Request, res: Response) => Promise<boolean>;
};

const createRateLimiterMiddleware = (
  getLimiter: () => Ratelimit,
  getKey: (req: Request, res: Response) => string | Promise<string> = getRequestIp
): RateLimiterMiddleware => {
  const isAllowed = async (req: Request, res: Response): Promise<boolean> => {
    if (skip()) return true;

    const { success: isLimitNotReached } = await getLimiter().limit(await getKey(req, res));

    return isLimitNotReached;
  };

  const middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!(await isAllowed(req, res))) {
      res.status(429).json(RATE_LIMIT_MESSAGE);
      return;
    }

    next();
  };

  return Object.assign(middleware, { isAllowed });
};

/**
 * One allowance per route: a login and its second factor no longer draw on the same one.
 */
export const authRateLimiter = createRateLimiterMiddleware(
  getAuthLimiter,
  (req) => `${req.path}:${getRequestIp(req)}`
);
export const docsLoginRateLimiter = createRateLimiterMiddleware(getDocsLoginLimiter);
export const fileUploadRateLimiter = createRateLimiterMiddleware(getFileUploadLimiter);
export const dataExportRateLimiter = createRateLimiterMiddleware(getDataExportLimiter);
/**
 * Keyed on the session token rather than the IP — an authenticated endpoint.
 */
export const contactRateLimiter = createRateLimiterMiddleware(
  getContactLimiter,
  getSessionKey
);
/**
 * One allowance per form: a burst of contact messages does not use up the newsletter's allowance.
 */
export const websiteFormRateLimiter = createRateLimiterMiddleware(
  getWebsiteFormLimiter,
  (req) => `${req.path}:${getRequestIp(req)}`
);
/**
 * One allowance per counter: a burst of views does not use up the share counter's allowance.
 */
export const contentCounterRateLimiter = createRateLimiterMiddleware(
  getContentCounterLimiter,
  (req) => `${req.path}:${getRequestIp(req)}`
);
/**
 * The non-credential routes capped per caller, relative to the `/parse` mount. Registered on Express
 * for direct calls, and re-applied by `batchRateLimiter` to the sub-requests of a `POST /parse/batch`.
 * The credential routes are not here: Parse Server's own `rateLimit` option covers them in a batch.
 */
export const RATE_LIMITED_POST_ROUTES: Record<string, RateLimiterMiddleware> = {
  '/functions/exportMyData': dataExportRateLimiter,
  '/functions/createContact': contactRateLimiter,
  '/functions/createPublicContact': websiteFormRateLimiter,
  '/functions/subscribeToNewsletter': websiteFormRateLimiter,
  '/functions/incrementArticleViewCount': contentCounterRateLimiter,
  '/functions/incrementShareCount': contentCounterRateLimiter,
};

const PARSE_MOUNT_PATH = '/parse';

// Parse Server's router ignores the case of a path, so the lookup has to as well
const RATE_LIMITED_POST_ROUTES_BY_LOWER_PATH = new Map(
  Object.entries(RATE_LIMITED_POST_ROUTES).map(([route, limiter]) => [route.toLowerCase(), limiter])
);

/**
 * The route a batch sub-request really runs, resolved the way Parse Server's batch does
 * (`path.posix.join` after the mount): `/parse//functions/x`, `/parse/./functions/x` or a trailing
 * slash all reach `/functions/x`, and an exact match on the raw path let them through uncounted.
 * `undefined` for a path outside the mount, which Parse Server refuses anyway.
 */
const toRoutablePath = (rawPath: string): string | undefined => {
  const pathname = rawPath.split('?')[0] ?? '';

  if (!pathname.startsWith(PARSE_MOUNT_PATH)) return undefined;

  return posix.join('/', pathname.slice(PARSE_MOUNT_PATH.length)).replace(/\/+$/, '');
};

/**
 * `POST /parse/batch` dispatches up to 100 sub-requests internally, so the limiters mounted on a URL
 * never see them. Each sub-request is counted here against the limiter of its own route, as if it had
 * been sent alone; one refusal refuses the whole batch, as Parse Server's own limiter does.
 * A batch runs under the session of the batch itself, which is therefore the key.
 */
export const batchRateLimiter = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  await readTextPlainBody(req, res);

  const body: unknown = req.body;
  const requests: unknown = typeof body === 'object' && body !== null
    ? (body as { requests?: unknown }).requests
    : undefined;

  for (const subRequest of Array.isArray(requests) ? requests : []) {
    const { method, path } = (subRequest ?? {}) as { method?: unknown; path?: unknown };

    // a sub-request with no method is a GET, which no limiter covers
    if (typeof path !== 'string' || typeof method !== 'string' || method.toUpperCase() !== 'POST') continue;

    const routePath = toRoutablePath(path);
    const limiter = routePath
      ? RATE_LIMITED_POST_ROUTES_BY_LOWER_PATH.get(routePath.toLowerCase())
      : undefined;

    if (!routePath || !limiter) continue;

    // limiters keyed on the path need the sub-request's path, not `/parse/batch`
    const subRequestAsReq = Object.create(req) as Request;

    Object.defineProperty(subRequestAsReq, 'path', { value: `${PARSE_MOUNT_PATH}${routePath}` });

    if (!(await limiter.isAllowed(subRequestAsReq, res))) {
      res.status(429).json(RATE_LIMIT_MESSAGE);
      return;
    }
  }

  next();
};
