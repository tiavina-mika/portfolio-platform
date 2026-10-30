import type { Locale } from '@/types/app.type';
import type { ICode } from '@/types/auth.type';
import type { Phone } from '@/types/user.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { MAX_VERIFIED_PAYOUT_PHONES } from '@/constants/_core/user.constants';
import { decrypt } from '@/utils/_core/encrypt.utils';
import { logger } from '@/utils/_core/logger';
import { isSamePhone, normalizePhone } from '@/utils/_core/phone.utils';

import { sendEmailToRecipient } from '../../utils/_core/email.utils.cloud';
import { sendSmsVerification } from '../../utils/_core/sms.utils.cloud';
import {
  checkVerificationRateLimit, generateEncryptedVerificationCode, getDecryptedUserCode,
  recordVerificationFailure, toEmailRecipient, type VerificationField,
} from '../../utils/_core/user.utils.cloud';

const PAYOUT_PHONE_FIELD: VerificationField = 'payoutPhoneVerification';

type PendingPayoutPhone = ICode & { phone: Phone };

/** Whether this number is one the driver proved to control — what a payout is allowed to go to */
export const isVerifiedPayoutPhone = (driver: Parse.User, phone: Phone): boolean => (
  ((driver.get('verifiedPayoutPhones') ?? []) as Phone[]).some((verified) => isSamePhone(verified, phone))
);

/**
 * Texts a code to a number the driver wants to be paid on. The number only joins the list a payout
 * may go to once the code comes back: receiving the text is the proof that the number is theirs, so
 * a stolen session alone cannot redirect the payouts to a number of its own.
 * @param ip the caller's address, counted against the daily SMS cap
 */
export const requestPayoutPhoneVerificationService = async (
  user: Parse.User,
  phone: Phone,
  locale: Locale = DEFAULT_LANGUAGE,
  ip?: string
): Promise<boolean> => {
  const normalized = normalizePhone(phone);

  if (isVerifiedPayoutPhone(user, normalized)) {
    throw new Error(translate('user.payoutPhoneAlreadyVerified', locale));
  }

  if (((user.get('verifiedPayoutPhones') ?? []) as Phone[]).length >= MAX_VERIFIED_PAYOUT_PHONES) {
    throw new Error(translate('user.payoutPhoneLimitReached', locale));
  }

  await checkVerificationRateLimit(user, locale, {
    flow: PAYOUT_PHONE_FIELD, phoneNumber: normalized.number, ip,
  });

  const pending: PendingPayoutPhone = {
    ...generateEncryptedVerificationCode(user.get(PAYOUT_PHONE_FIELD) as ICode | undefined),
    phone: normalized,
  };

  user.set(PAYOUT_PHONE_FIELD, pending);

  const savedUser = await user.save(null, USE_MASTER_KEY);
  const code = getDecryptedUserCode(savedUser, PAYOUT_PHONE_FIELD) as string;

  return sendSmsVerification(normalized.number, code, locale, normalized.code);
};

/**
 * Tells the driver, by email, that a payout number was added: a number they did not add must show.
 * Never throws — the number is already verified, and a mail that cannot be sent must not undo it.
 */
const notifyPayoutPhoneAdded = async (user: Parse.User, phone: Phone, locale: Locale): Promise<void> => {
  if (!user.get('email')) return;

  try {
    await sendEmailToRecipient(toEmailRecipient(user), {
      subject: translate('email.payoutPhoneAddedSubject', locale),
      message: translate('email.payoutPhoneAddedMessage', locale, { number: `+${phone.code} ${phone.number}` }),
      locale,
    });
  }
  catch (error) {
    logger.error('Payout number notice failed', { userId: user.id, error: (error as Error).message });
  }
};

/**
 * Confirms the code sent by `requestPayoutPhoneVerificationService` and adds the number to the ones
 * the driver can be paid on.
 * @returns every number the driver can now be paid on
 */
export const confirmPayoutPhoneVerificationService = async (
  user: Parse.User,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<Phone[]> => {
  if (!user.has(PAYOUT_PHONE_FIELD)) {
    throw new Error(translate('user.noVerificationPending', locale));
  }

  const pending = user.get(PAYOUT_PHONE_FIELD) as PendingPayoutPhone;

  if (pending.lockedAt) {
    throw new Error(translate('user.verificationLocked', locale));
  }

  if (new Date(pending.expiredAt).getTime() < Date.now()) {
    throw new Error(translate('user.verificationExpired', locale));
  }

  if (decrypt(pending.code) !== code.trim()) {
    const isNowLocked = await recordVerificationFailure(user, PAYOUT_PHONE_FIELD);

    throw new Error(translate(isNowLocked ? 'user.verificationLocked' : 'user.incorrectCode', locale));
  }

  const verifiedPhones = (user.get('verifiedPayoutPhones') ?? []) as Phone[];
  const updatedPhones = verifiedPhones.some((phone) => isSamePhone(phone, pending.phone))
    ? verifiedPhones
    : [...verifiedPhones, pending.phone];

  user.set('verifiedPayoutPhones', updatedPhones);
  user.unset(PAYOUT_PHONE_FIELD);
  await user.save(null, USE_MASTER_KEY);

  await notifyPayoutPhoneAdded(user, pending.phone, locale);

  return updatedPhones;
};
