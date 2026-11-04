import crypto from 'node:crypto';

import type { DocsSection } from '@/types/docs.type';

import { DOCS_COOKIE_PREFIX, DOCS_ROUTE_PREFIX, DOCS_SESSION_DURATION_MS } from '@/constants/_core/docs.constants';

const sha256 = (value: string): Buffer => crypto.createHash('sha256').update(value).digest();

/**
 * The signing key mixes the password with a server secret: the cookie stays valid only while the
 * password does (changing it signs everyone out), and a cookie read off a browser cannot be used to
 * guess a weak password offline, since that takes the server secret too.
 */
const getSigningKey = (password: string): Buffer => (
  crypto.createHmac('sha256', process.env.PARSE_MASTER_KEY ?? '').update(password).digest()
);

const sign = (section: DocsSection, password: string, expiresAt: number): string => (
  crypto.createHmac('sha256', getSigningKey(password)).update(`${section}.${expiresAt}`).digest('hex')
);

/**
 * The password of a section, empty when it is not set: a section without a password is closed.
 */
export const getDocsPassword = (section: DocsSection): string => (
  process.env[`DOCS_${section.toUpperCase()}_PASSWORD`] ?? ''
);

export const getDocsCookieName = (section: DocsSection): string => `${DOCS_COOKIE_PREFIX}${section}`;

export const getDocsSectionPath = (section: DocsSection): string => `${DOCS_ROUTE_PREFIX}/${section}`;

/**
 * Compares digests rather than the passwords themselves, so the time taken reveals neither the
 * length nor the first wrong character.
 */
export const isDocsPasswordValid = (candidate: unknown, expected: string): boolean => {
  if (!expected || typeof candidate !== 'string') return false;

  return crypto.timingSafeEqual(sha256(candidate), sha256(expected));
};

export const createDocsSessionToken = (section: DocsSection, password: string, now = Date.now()): string => {
  const expiresAt = now + DOCS_SESSION_DURATION_MS;

  return `${expiresAt}.${sign(section, password, expiresAt)}`;
};

export const isDocsSessionTokenValid = (
  token: string | undefined, section: DocsSection, password: string, now = Date.now()
): boolean => {
  if (!token || !password) return false;

  const [expiresAtText, signature] = token.split('.');
  const expiresAt = Number(expiresAtText);

  if (!signature || !Number.isFinite(expiresAt) || expiresAt <= now) return false;

  const expected = Buffer.from(sign(section, password, expiresAt));
  const received = Buffer.from(signature);

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
};

// a malformed escape in a cookie must read as the raw text, not crash the request
const decodeCookieValue = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const parseCookies = (header: string | undefined): Record<string, string> => (
  Object.fromEntries(
    (header ?? '').split(';').flatMap((pair) => {
      const separatorIndex = pair.indexOf('=');

      if (separatorIndex < 0) return [];

      const name = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();

      return [[name, decodeCookieValue(value)]];
    })
  )
);

/**
 * Where to send the reader after signing in: only an address inside the same section, so the
 * `next` field can never turn the login form into a redirect to another site.
 */
export const getSafeDocsRedirectPath = (section: DocsSection, next: unknown): string => {
  const sectionPath = getDocsSectionPath(section);

  if (typeof next !== 'string' || !next.startsWith(`${sectionPath}/`) || next.includes('//')) {
    return `${sectionPath}/`;
  }

  return next;
};
