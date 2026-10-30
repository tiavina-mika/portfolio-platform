import type { Locale } from '@/types/app.type';
import type { ICode, StepUpRequestResult } from '@/types/auth.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { STEP_UP_VERIFICATION_VALIDITY_MINUTES, USE_MASTER_KEY } from '@/constants/_core/constants';
import { decrypt } from '@/utils/_core/encrypt.utils';
import { getStepUpDestination } from '@/utils/_core/step-up.utils';

import { sendStepUpVerificationEmail } from '../../utils/_core/email.utils.cloud';
import { sendSmsVerification } from '../../utils/_core/sms.utils.cloud';
import {
  checkVerificationRateLimit, generateEncryptedVerificationCode,
  getDecryptedUserCode, recordVerificationFailure, toEmailRecipient,
} from '../../utils/_core/user.utils.cloud';

const STEP_UP_FIELD = 'stepUpVerification';

/**
 * Sends a fresh re-verification code to the currently authenticated user (email if they have one,
 * SMS otherwise — same channel priority as the new-device-login alert), to be confirmed via
 * confirmStepUpVerificationService right before a sensitive action.
 *
 * Answers with the channel and the masked destination as well as whether the code left: the app
 * shows where to look, and words a failure for the channel that actually failed — "SMS not sent" is
 * no help to a member whose code was to arrive by e-mail.
 */
export const requestStepUpVerificationService = async (
  user: Parse.User,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<StepUpRequestResult> => {
  await checkVerificationRateLimit(user, locale, {
    flow: STEP_UP_FIELD,
    phoneNumber: user.get('email') ? undefined : user.get('phone')?.number,
  });

  const verification = generateEncryptedVerificationCode(user.get(STEP_UP_FIELD) as ICode | undefined);

  user.set(STEP_UP_FIELD, verification);

  const newUser = await user.save(null, USE_MASTER_KEY);
  const code = getDecryptedUserCode(newUser, STEP_UP_FIELD) as string;
  const destination = getStepUpDestination({ email: newUser.get('email'), phone: newUser.get('phone') });

  const isSent = destination.channel === 'email'
    ? await sendStepUpVerificationEmail(toEmailRecipient(newUser), code, locale)
    : await sendSmsVerification(newUser.get('phone')?.number, code, locale, newUser.get('phone')?.code);

  return { ...destination, isSent };
};

/**
 * Confirms the code sent by requestStepUpVerificationService. On success, marks the user as
 * step-up-verified for STEP_UP_VERIFICATION_VALIDITY_MINUTES — see assertStepUpVerified.
 */
export const confirmStepUpVerificationService = async (
  user: Parse.User,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  if (!user.has(STEP_UP_FIELD)) {
    throw new Error(translate('user.noVerificationPending', locale));
  }

  const verification = user.get(STEP_UP_FIELD) as ICode;

  if (verification.lockedAt) {
    throw new Error(translate('user.verificationLocked', locale));
  }

  if (new Date(verification.expiredAt).getTime() < Date.now()) {
    throw new Error(translate('user.verificationExpired', locale));
  }

  const decryptedStoredCode = decrypt(verification.code) as string;

  if (decryptedStoredCode !== code.trim()) {
    const isNowLocked = await recordVerificationFailure(user, STEP_UP_FIELD);

    throw new Error(translate(isNowLocked ? 'user.verificationLocked' : 'user.incorrectCode', locale));
  }

  user.unset(STEP_UP_FIELD);
  user.set('stepUpVerifiedAt', new Date());
  await user.save(null, USE_MASTER_KEY);
};

/**
 * Guards a sensitive action (e.g. deleteAccount) behind a recent step-up verification. Throws the
 * same shape as the existing account-deletion blocker (`{ code }` JSON in the error message) so
 * clients parse both identically.
 */
export const assertStepUpVerified = (user: Parse.User): void => {
  const stepUpVerifiedAt: Date | undefined = user.get('stepUpVerifiedAt');
  const isFresh = !!stepUpVerifiedAt &&
    (Date.now() - new Date(stepUpVerifiedAt).getTime()) < STEP_UP_VERIFICATION_VALIDITY_MINUTES * 60 * 1000;

  if (isFresh) return;

  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, JSON.stringify({ code: 'STEP_UP_REQUIRED' }));
};
