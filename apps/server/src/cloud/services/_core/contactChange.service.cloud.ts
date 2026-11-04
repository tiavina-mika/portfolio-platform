import { ContactChangeTypeEnum } from '@shared/types';

import type { Locale } from '@/types/app.type';
import type { IContactChangeCode } from '@/types/auth.type';
import type { Phone } from '@/types/user.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { decrypt } from '@/utils/_core/encrypt.utils';
import { logger } from '@/utils/_core/logger';
import { normalizePhone, toPhoneUsername } from '@/utils/_core/phone.utils';

import { assertStepUpVerified } from './stepUpVerification.service.cloud';
import { releaseUnverifiedPhoneSignup } from './user.service.cloud';
import { revokeOtherSessionsService } from './userSession.service.cloud';
import {
  sendContactChangeVerificationEmail, sendEmailToRecipient,
} from '../../utils/_core/email.utils.cloud';
import { sendSmsToPhoneNumber, sendSmsVerification } from '../../utils/_core/sms.utils.cloud';
import {
  checkVerificationRateLimit, generateEncryptedVerificationCode,
  getDecryptedUserCode, recordVerificationFailure, toEmailRecipient, type VerificationField,
} from '../../utils/_core/user.utils.cloud';

const CONTACT_CHANGE_FIELD: VerificationField = 'contactChangeVerification';

/** Lets the `_User` beforeSave keep `phoneVerified` when the number changes through this flow. */
export const CONTACT_CHANGE_CONFIRMED_CONTEXT = { isContactChangeConfirmed: true };

export type ContactChangeInput =
  | { type: `${ContactChangeTypeEnum.EMAIL}`; email: string } |
  { type: `${ContactChangeTypeEnum.PHONE}`; phone: Phone };

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Throws when the value is already the account's own, or already signs in another account — an
 * email is a username, a verified phone number is what `loginWithPhone` resolves.
 */
export const assertContactAvailable = async (
  user: Parse.User,
  input: ContactChangeInput,
  locale: Locale
): Promise<void> => {
  if (input.type === ContactChangeTypeEnum.EMAIL) {
    const email = normalizeEmail(input.email);

    if (normalizeEmail(user.get('email') ?? '') === email) {
      throw new Error(translate('user.contactUnchanged', locale));
    }

    const existing = await Parse.Query.or(
      new Parse.Query(Parse.User).equalTo('email', email),
      new Parse.Query(Parse.User).equalTo('username', email)
    )
      .notEqualTo('objectId', user.id)
      .select(['objectId'])
      .first(USE_MASTER_KEY);

    if (existing) throw new Error(translate('user.emailAlreadyUsedByAnotherAccount', locale));
    return;
  }

  const phone = normalizePhone(input.phone);

  if (user.get('phone')?.number === phone.number) {
    throw new Error(translate('user.contactUnchanged', locale));
  }

  const existing = await new Parse.Query(Parse.User)
    .equalTo('phone.number', phone.number)
    .equalTo('phoneVerified', true)
    .notEqualTo('objectId', user.id)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  if (existing) throw new Error(translate('user.phoneAlreadyUsedByAnotherAccount', locale));
};

/**
 * Sends a code to the email or phone number the member wants to sign in with from now on. The new
 * value waits next to the code and is only written once the code comes back, so a typo never
 * replaces a working login identifier.
 *
 * Changing the login contact is the move that hands an account over — whoever controls it can reset
 * the password — so it needs a fresh step-up proof first: a code received on the contact the
 * account has today. A stolen session alone cannot get past it.
 * @param ip the caller's address, counted against the daily SMS cap when the code goes out by SMS
 */
export const requestContactChangeService = async (
  user: Parse.User,
  input: ContactChangeInput,
  locale: Locale = DEFAULT_LANGUAGE,
  ip?: string
): Promise<boolean> => {
  // before anything else: an answer about whether the new value is taken is not for an unproven session
  assertStepUpVerified(user);
  await assertContactAvailable(user, input, locale);
  await checkVerificationRateLimit(user, locale, {
    flow: CONTACT_CHANGE_FIELD,
    phoneNumber: input.type === ContactChangeTypeEnum.PHONE ? normalizePhone(input.phone).number : undefined,
    ip,
  });

  const pending: IContactChangeCode = {
    ...generateEncryptedVerificationCode(user.get(CONTACT_CHANGE_FIELD) as IContactChangeCode | undefined),
    ...(input.type === ContactChangeTypeEnum.EMAIL
      ? { type: input.type, email: normalizeEmail(input.email) }
      : { type: input.type, phone: normalizePhone(input.phone) }),
  };

  user.set(CONTACT_CHANGE_FIELD, pending);

  const savedUser = await user.save(null, USE_MASTER_KEY);
  const code = getDecryptedUserCode(savedUser, CONTACT_CHANGE_FIELD) as string;

  if (pending.email) {
    return sendContactChangeVerificationEmail(
      { email: pending.email, firstName: savedUser.get('firstName'), lastName: savedUser.get('lastName') },
      code,
      locale
    );
  }

  return sendSmsVerification(pending.phone!.number, code, locale, pending.phone!.code);
};

/**
 * Tells the member, on the contact they just replaced, that it happened. The new value is never
 * quoted: this message goes to whoever still holds the old one, which is the point — a member
 * whose account was taken over learns it here. Adding an email to a phone-only account replaces
 * nothing, so there is no old contact of that kind to warn.
 *
 * Never throws: the change is already written, and a message that cannot be sent must not turn it
 * into an error.
 */
export const notifyPreviousContact = async (
  user: Parse.User,
  input: ContactChangeInput,
  previous: { email?: string; phone?: Phone; wasPhoneVerified: boolean },
  locale: Locale
): Promise<void> => {
  try {
    if (input.type === ContactChangeTypeEnum.EMAIL && previous.email) {
      await sendEmailToRecipient(
        { ...toEmailRecipient(user), email: previous.email },
        {
          subject: translate('email.contactChangedEmailSubject', locale),
          message: translate('email.contactChangedEmailMessage', locale),
          locale,
        }
      );
    }

    // a number the member never confirmed may not be theirs, and every text is paid
    if (input.type === ContactChangeTypeEnum.PHONE && previous.phone?.number && previous.wasPhoneVerified) {
      await sendSmsToPhoneNumber(
        previous.phone.number, translate('sms.contactChanged', locale), previous.phone.code
      );
    }
  }
  catch (error) {
    logger.error('Contact change notice to the previous contact failed', {
      userId: user.id, error: (error as Error).message,
    });
  }
};

/**
 * Writes a new email or phone number on the account, already verified, and keeps the sign-in
 * identifier in step with it. It does not save: what proves the change (a code received on the new
 * contact, or an administrator who checked the member's identity) and what follows it (signing the
 * other devices out, telling the previous contact) belong to the caller.
 */
export const applyContactChange = async (user: Parse.User, input: ContactChangeInput): Promise<void> => {
  if (input.type === ContactChangeTypeEnum.EMAIL) {
    // stored the way the sign-up stores it, whoever typed it: the lookups by email are exact matches
    const email = normalizeEmail(input.email);

    // an email account signs in with its email as username: both move together
    if (user.get('username') === user.get('email')) user.set('username', email);
    user.set('email', email);
    user.set('emailVerified', true);
  } else {
    const previousPhone = user.get('phone') as Phone | undefined;
    const phone = normalizePhone(input.phone);

    /*
     * a phone-signup account signs in with `+<code><number>` as username: both move together, the
     * same way an email account's username follows its email just above. Left behind, the old
     * number keeps holding a username Parse enforces as unique — and operators recycle numbers, so
     * its next owner could never sign up.
     */
    if (previousPhone && user.get('username') === toPhoneUsername(previousPhone)) {
      user.set('username', toPhoneUsername(phone));
    }

    /*
     * the number may be held by a sign-up abandoned before its code: such a row owns the username
     * Parse enforces as unique, and the number is now this account's by proof of the code
     */
    await releaseUnverifiedPhoneSignup(phone.number);

    user.set('phone', phone);
    user.set('phoneVerified', true);
  }
};

/**
 * Confirms the code sent by `requestContactChangeService` and writes the new email or phone number
 * on the account, already verified: receiving the code on it is the proof.
 *
 * Once written, the account is what whoever confirmed it says it is, so the rest is damage
 * control: every other device is signed out (a session opened by a thief does not survive the
 * member taking their account back), the step-up proof is spent, and the contact that was
 * replaced is told. No step-up is asked again here: a pending change only exists because
 * `requestContactChangeService` got past it, and the code it waits for went to the new contact.
 */
export const confirmContactChangeService = async (
  user: Parse.User,
  code: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  if (!user.has(CONTACT_CHANGE_FIELD)) {
    throw new Error(translate('user.noVerificationPending', locale));
  }

  const pending = user.get(CONTACT_CHANGE_FIELD) as IContactChangeCode;

  if (pending.lockedAt) {
    throw new Error(translate('user.verificationLocked', locale));
  }

  if (new Date(pending.expiredAt).getTime() < Date.now()) {
    throw new Error(translate('user.verificationExpired', locale));
  }

  if (decrypt(pending.code) !== code.trim()) {
    const isNowLocked = await recordVerificationFailure(user, CONTACT_CHANGE_FIELD);

    throw new Error(translate(isNowLocked ? 'user.verificationLocked' : 'user.incorrectCode', locale));
  }

  const input: ContactChangeInput = pending.type === ContactChangeTypeEnum.EMAIL
    ? { type: ContactChangeTypeEnum.EMAIL, email: pending.email! }
    : { type: ContactChangeTypeEnum.PHONE, phone: pending.phone! };

  // another account may have taken the value between the request and the confirmation
  await assertContactAvailable(user, input, locale);

  const previous = {
    email: user.get('email') as string | undefined,
    phone: user.get('phone') as Phone | undefined,
    wasPhoneVerified: !!user.get('phoneVerified'),
  };

  await applyContactChange(user, input);

  user.unset(CONTACT_CHANGE_FIELD);
  // spent: the next contact change has to prove the member's identity again
  user.unset('stepUpVerifiedAt');
  await user.save(null, { ...USE_MASTER_KEY, context: CONTACT_CHANGE_CONFIRMED_CONTEXT });

  const currentSessionToken = user.getSessionToken();

  if (currentSessionToken) {
    await revokeOtherSessionsService(user, currentSessionToken);
  } else {
    logger.warn('Contact change confirmed without a session token: other devices not signed out', {
      userId: user.id,
    });
  }

  await notifyPreviousContact(user, input, previous, locale);
};
