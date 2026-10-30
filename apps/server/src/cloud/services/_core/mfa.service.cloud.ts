import type { Locale } from '@/types/app.type';
import type { IMfa } from '@/types/auth.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { decrypt, encrypt, compareBackupCode } from '@/utils/_core/encrypt.utils';

import { createMfaAuditLog } from './mfaAuditLog.service.cloud';
import { revokeAllUserSessionsService } from './userSession.service.cloud';
import { isMfaAttemptAllowed } from '../../../middlewares/rateLimit.middleware';
import {
  buildMfaOtpauthUrl, findTotpStep, generateBackupCodes, generateMfaSecret, isMfaLocked,
  normalizeBackupCode, recordMfaFailure, resolveMfaChallengeToken,
} from '../../utils/_core/mfa.utils.cloud';
import { issueParseSession } from '../../utils/_core/session.utils.cloud';
import { markUserSignedIn } from '../../utils/_core/user.utils.cloud';

/**
 * Verifies a TOTP or backup code against the user's already-enabled MFA. On a TOTP match, resets
 * any prior failed-attempt count. On a backup-code match, consumes that code (single use) and
 * resets the failure count. Neither branch saves the user — callers batch this mutation with
 * whatever else they're persisting (session finalization, backup-code regeneration, etc.).
 * On no match, records the failure (which does save) and throws.
 */
const assertMfaCode = async (
  user: Parse.User,
  code: string,
  locale: Locale
): Promise<{ isBackupCodeUsed: boolean }> => {
  const mfa = user.get('mfa') as IMfa | undefined;

  if (!mfa?.enabled) {
    throw new Error(translate('user.mfaNotEnabled', locale));
  }

  if (isMfaLocked(mfa) || !(await isMfaAttemptAllowed(user.id))) {
    throw new Error(translate('user.mfaLocked', locale));
  }

  const decryptedSecret = decrypt(mfa.secret) as string;
  const step = findTotpStep(decryptedSecret, code);

  // a code whose time step was already accepted is a replay, not a match
  if (step !== undefined && step > (mfa.lastUsedStep ?? 0)) {
    const { lockedAt: expiredLock, ...mfaWithoutLock } = mfa;

    user.set('mfa', { ...mfaWithoutLock, failedAttempts: 0, lastUsedStep: step });
    return { isBackupCodeUsed: false };
  }

  const backupCodes = mfa.backupCodes || [];
  const normalizedCode = normalizeBackupCode(code);
  const matchedIndex = backupCodes.findIndex((hash) => compareBackupCode(normalizedCode, hash));

  if (matchedIndex !== -1) {
    const remainingBackupCodes = backupCodes.filter((_, index) => index !== matchedIndex);

    user.set('mfa', { ...mfa, backupCodes: remainingBackupCodes, failedAttempts: 0 });
    return { isBackupCodeUsed: true };
  }

  const isNowLocked = await recordMfaFailure(user);

  throw new Error(translate(isNowLocked ? 'user.mfaLocked' : 'user.mfaIncorrectCode', locale));
};

/**
 * Starts MFA enrollment — generates and stores an encrypted TOTP secret (not yet enabled) and
 * returns the `otpauth://` URI for the BO to render as a QR code. Idempotent while enrollment is
 * pending: re-calling this (e.g. MfaSetupForm remounting under React StrictMode, or the user
 * reopening the setup dialog) reuses the already-stored secret instead of minting a new one —
 * otherwise a code scanned against an earlier QR code would stop matching once a later call
 * silently overwrote it.
 * Refuses to run once MFA is already enabled: overwriting the live secret with a fresh
 * `enabled: false` one would silently turn MFA off and invalidate the authenticator entry the
 * user already scanned — disableMfa (code-gated) is the only legitimate way out of an enabled state.
 */
export const enrollMfaService = async (
  user: Parse.User,
  password: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<{ otpauthUrl: string }> => {
  /*
   * `verifyPassword` rather than `logIn`: it opens no session and does not run `beforeLogin`
   * (which would answer MFA_REQUIRED for an account that already has a second factor)
   */
  try {
    await Parse.User.verifyPassword(user.get('username') as string, password);
  } catch {
    throw new Error(translate('user.wrongPassword', locale));
  }

  const existingMfa = user.get('mfa') as IMfa | undefined;

  if (existingMfa?.enabled) {
    throw new Error(translate('user.mfaAlreadyEnabled', locale));
  }

  if (existingMfa) {
    const otpauthUrl = buildMfaOtpauthUrl(user.get('email'), decrypt(existingMfa.secret) as string);

    return { otpauthUrl };
  }

  const { secret, otpauthUrl } = generateMfaSecret(user.get('email'));

  user.set('mfa', { secret: encrypt(secret) as string, enabled: false } satisfies IMfa);
  await user.save(null, USE_MASTER_KEY);

  return { otpauthUrl };
};

/**
 * Confirms the first TOTP code after enrollment — activates MFA and returns the backup codes in
 * plaintext exactly once (only their hashes are persisted).
 */
export const confirmMfaEnrollmentService = async (
  user: Parse.User,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<{ backupCodes: string[] }> => {
  const mfa = user.get('mfa') as IMfa | undefined;

  if (!mfa) {
    throw new Error(translate('user.mfaEnrollmentNotStarted', locale));
  }

  if (mfa.enabled) {
    throw new Error(translate('user.mfaAlreadyEnabled', locale));
  }

  if (isMfaLocked(mfa) || !(await isMfaAttemptAllowed(user.id))) {
    throw new Error(translate('user.mfaLocked', locale));
  }

  const decryptedSecret = decrypt(mfa.secret) as string;
  const step = findTotpStep(decryptedSecret, code);

  if (step === undefined) {
    const isNowLocked = await recordMfaFailure(user);

    throw new Error(translate(isNowLocked ? 'user.mfaLocked' : 'user.mfaIncorrectCode', locale));
  }

  const { plain, hashed } = generateBackupCodes();

  user.set('mfa', {
    secret: mfa.secret,
    enabled: true,
    enabledAt: new Date(),
    backupCodes: hashed,
    failedAttempts: 0,
    lastUsedStep: step,
  } satisfies IMfa);
  await user.save(null, USE_MASTER_KEY);
  await createMfaAuditLog({ action: 'enabled', userId: user.id });

  return { backupCodes: plain };
};

/**
 * Exchanges a beforeLogin-issued MFA challenge token for a real session, once the second factor
 * is confirmed. Mirrors what beforeLogin itself would have done (isOnline/session finalization)
 * since the trigger threw before reaching that step.
 */
export const verifyMfaLoginService = async (
  mfaChallengeToken: string,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<{ sessionToken: string }> => {
  const userId = resolveMfaChallengeToken(mfaChallengeToken);

  if (!userId) {
    throw new Error(translate('user.mfaChallengeExpired', locale));
  }

  const user = await new Parse.Query(Parse.User)
    .select(['mfa', 'email'])
    .get(userId, USE_MASTER_KEY);

  const { isBackupCodeUsed } = await assertMfaCode(user, code, locale);

  markUserSignedIn(user);
  await user.save(null, USE_MASTER_KEY);

  if (isBackupCodeUsed) {
    await createMfaAuditLog({ action: 'backup_code_used', userId: user.id });
  }

  const sessionToken = await issueParseSession(user.id, { createdWith: { action: 'login' } });

  return { sessionToken };
};

/**
 * Disables MFA — requires a valid TOTP/backup code first so a stolen session alone can't turn it
 * off (see OWNER-only adminResetMfaService for the lost-device support path).
 */
export const disableMfaService = async (
  user: Parse.User,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  await assertMfaCode(user, code, locale);

  user.unset('mfa');
  await user.save(null, USE_MASTER_KEY);
  await createMfaAuditLog({ action: 'disabled', userId: user.id });
};

export const regenerateMfaBackupCodesService = async (
  user: Parse.User,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<{ backupCodes: string[] }> => {
  await assertMfaCode(user, code, locale);

  const mfa = user.get('mfa') as IMfa;
  const { plain, hashed } = generateBackupCodes();

  user.set('mfa', { ...mfa, backupCodes: hashed, failedAttempts: 0 });
  await user.save(null, USE_MASTER_KEY);

  return { backupCodes: plain };
};

/**
 * OWNER-only support path (see checkOwner in the calling Cloud Function) for a user who lost both
 * their authenticator app and their backup codes — clears MFA entirely, forcing re-enrollment on
 * next login.
 */
export const adminResetMfaService = async (
  admin: Parse.User,
  userId: string
): Promise<void> => {
  const targetUser = await new Parse.Query(Parse.User)
    .select(['mfa'])
    .get(userId, USE_MASTER_KEY);

  targetUser.unset('mfa');
  await targetUser.save(null, USE_MASTER_KEY);
  await createMfaAuditLog({ action: 'admin_reset', userId: targetUser.id, performedBy: admin });
  // a reset is asked when the account may be compromised: its open sessions must not survive it
  await revokeAllUserSessionsService(targetUser);
};
