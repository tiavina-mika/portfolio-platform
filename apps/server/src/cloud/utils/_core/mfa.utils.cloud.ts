import crypto from 'crypto';

import dayjs from 'dayjs';
import { authenticator } from 'otplib';

import type { IMfa } from '@/types/auth.type';

import {
  APP_NAME, MFA_BACKUP_CODES_COUNT, MFA_CHALLENGE_TOKEN_TTL_SECONDS, MFA_LOCK_DURATION_MINUTES,
  MFA_MAX_VERIFICATION_ATTEMPTS, MFA_TOTP_STEP_SECONDS, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { hashBackupCode } from '@/utils/_core/encrypt.utils';

import { createMfaAuditLog } from '../../services/_core/mfaAuditLog.service.cloud';

/*
 * otplib's authenticator defaults to `window: 0` — zero tolerance for clock drift between the
 * server and the authenticator app, unlike Google Authenticator's own ±30s tolerance. `window: 1`
 * accepts the previous/next 30s step too, which is what every mainstream TOTP implementation does
 * to absorb minor clock skew and the time spent scanning/typing the code.
 */
authenticator.options = { window: 1 };

/**
 * Rebuilds the `otpauth://` URI for an already-generated secret — used to re-serve the same
 * pending enrollment (see enrollMfaService) instead of minting a new secret on every call.
 */
export const buildMfaOtpauthUrl = (email: string, secret: string): string => {
  return authenticator.keyuri(email, APP_NAME, secret);
};

/**
 * Generates a fresh TOTP secret plus the `otpauth://` enrollment URI the BO renders as a QR code
 * (via qrcode.react — no server-side QR rendering needed).
 */
export const generateMfaSecret = (email: string): { secret: string; otpauthUrl: string } => {
  const secret = authenticator.generateSecret();
  const otpauthUrl = buildMfaOtpauthUrl(email, secret);

  return { secret, otpauthUrl };
};

/**
 * Returns the 30-second time step the code matched, so the caller can refuse a code already used
 * to log in — undefined when the code does not match (or is malformed).
 */
export const findTotpStep = (secret: string, code: string): number | undefined => {
  try {
    const delta = authenticator.checkDelta(code.trim(), secret);

    if (delta === null) return undefined;

    return Math.floor(Date.now() / (MFA_TOTP_STEP_SECONDS * 1000)) + delta;
  } catch {
    // otplib throws on a malformed token (wrong length/non-numeric) rather than returning false
    return undefined;
  }
};

/*
 * Crockford-ish alphabet (no 0/O, 1/I/L, no vowels beyond that) — avoids visually ambiguous
 * characters in a code the user copies/types by hand.
 */
// eslint-disable-next-line @cspell/spellchecker -- alphabet string, not a word
const BACKUP_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
const BACKUP_CODE_SEGMENT_LENGTH = 5;

/**
 * A single backup code: 10 random characters from a 30-symbol alphabet (~49 bits of entropy,
 * unlike a plain numeric code) stored as a keyed hash, so a copy of the database alone is of no
 * use to test guesses, formatted as XXXXX-XXXXX for readability.
 */
const generateBackupCode = (): string => {
  const randomChars = Array.from(
    crypto.randomBytes(BACKUP_CODE_SEGMENT_LENGTH * 2),
    (byte) => BACKUP_CODE_ALPHABET[byte % BACKUP_CODE_ALPHABET.length]
  ).join('');

  const secondHalf = randomChars.slice(BACKUP_CODE_SEGMENT_LENGTH);

  return `${randomChars.slice(0, BACKUP_CODE_SEGMENT_LENGTH)}-${secondHalf}`;
};

/**
 * Backup codes are hashed in this stripped-down uppercase-alphanumeric form (no hyphen) so a
 * user-submitted code can be normalized the same way before comparison — tolerant of the hyphen
 * being dropped, extra whitespace, or a different case than what was originally displayed.
 */
export const normalizeBackupCode = (code: string): string => code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * Generates MFA_BACKUP_CODES_COUNT single-use backup codes. Returns both the plaintext codes
 * (shown to the user exactly once, right after enrollment, hyphenated for readability) and the
 * hashes of their normalized form (the only form ever persisted — see IMfa.backupCodes).
 */
export const generateBackupCodes = (): { plain: string[]; hashed: string[] } => {
  const plain = Array.from({ length: MFA_BACKUP_CODES_COUNT }, generateBackupCode);
  const hashed = plain.map((code) => hashBackupCode(normalizeBackupCode(code)));

  return { plain, hashed };
};

/**
 * An MFA lock lasts MFA_LOCK_DURATION_MINUTES: a permanent one would let a few typos (or an attacker
 * pushing the account there) lock an admin out until an OWNER resets the account by hand.
 */
export const isMfaLocked = (mfa: IMfa): boolean => (
  !!mfa.lockedAt && dayjs(mfa.lockedAt).add(MFA_LOCK_DURATION_MINUTES, 'minute').isAfter(dayjs())
);

/**
 * Increments the MFA failed-attempt counter and locks it after MFA_MAX_VERIFICATION_ATTEMPTS —
 * same lockout shape as `recordVerificationFailure` in user.utils.cloud.ts, kept separate since
 * it's scoped to `user.mfa` rather than a `VerificationField` slot.
 */
export const recordMfaFailure = async (user: Parse.User): Promise<boolean> => {
  const mfa = user.get('mfa') as IMfa;
  const { lockedAt: previousLockedAt, ...mfaWithoutLock } = mfa;
  // a lock that has run out starts a fresh count instead of locking again on the next typo
  const isPreviousLockOver = !!previousLockedAt && !isMfaLocked(mfa);
  const failedAttempts = (isPreviousLockOver ? 0 : (mfa.failedAttempts || 0)) + 1;
  const isLocked = failedAttempts >= MFA_MAX_VERIFICATION_ATTEMPTS;

  user.set('mfa', {
    ...mfaWithoutLock,
    failedAttempts,
    ...(isLocked ? { lockedAt: new Date() } : {}),
  });

  await user.save(null, USE_MASTER_KEY);

  if (isLocked) await createMfaAuditLog({ action: 'login_failed', userId: user.id });

  return isLocked;
};

type MfaChallengePayload = {
  userId: string;
  expiredAt: number;
};

const CHALLENGE_SIGNING_LABEL = 'mfa-challenge-token';

// a key of its own, derived from the static one, so this signature can never double as another one
const getChallengeSigningKey = (): Buffer => crypto
  .createHmac('sha256', process.env.CRYPTO_FIXED_FULL_KEY!)
  .update(CHALLENGE_SIGNING_LABEL)
  .digest();

const signChallengeBody = (body: string): string => crypto
  .createHmac('sha256', getChallengeSigningKey())
  .update(body)
  .digest('base64url');

/**
 * Self-contained, short-lived token proving the user already passed the password step of
 * `beforeLogin` — the BO exchanges it for a real session via `verifyMfaLogin` once the second
 * factor is confirmed. Signed (HMAC), not encrypted: an unauthenticated cipher lets anyone flip
 * bytes of the user id without the key, which would aim failed-code counting at another account.
 * Self-contained (no server-side store) — it carries no rights of its own (never a Parse session
 * token), and the actual security boundary is the TOTP/backup code check in verifyMfaLoginService.
 */
export const createMfaChallengeToken = (userId: string): string => {
  const payload: MfaChallengePayload = {
    userId,
    expiredAt: Date.now() + (MFA_CHALLENGE_TOKEN_TTL_SECONDS * 1000),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${body}.${signChallengeBody(body)}`;
};

/**
 * Verifies a challenge token's signature and returns the userId it was issued for — undefined if
 * the token is malformed, forged, or expired.
 */
export const resolveMfaChallengeToken = (token: string): string | undefined => {
  const [body, signature, ...extra] = token.split('.');

  if (!body || !signature || extra.length) return undefined;

  const expected = Buffer.from(signChallengeBody(body));
  const received = Buffer.from(signature);

  // a forged token fails here, before anything in it is read
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return undefined;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as MfaChallengePayload;

    return payload.expiredAt < Date.now() ? undefined : payload.userId;
  } catch {
    return undefined;
  }
};
