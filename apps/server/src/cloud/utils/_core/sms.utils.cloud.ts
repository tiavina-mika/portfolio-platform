import type { Locale } from '@/types/app.type';
import type { ChannelSendResult } from '@/types/notification.type';
import type { ISendSmsResponse } from '@/types/sms.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { SMS_RETRIEVER_APP_HASH_PATTERN } from '@/constants/_core/constants';
import { sendSms, sendSmsWithResult } from '@/services/sms.service';
import { logger } from '@/utils/_core/logger';

const isSmsSentResponse = (data: ISendSmsResponse): boolean => !!data?.success;

/**
 * Android's SMS Retriever API hands a verification SMS to the app — which then fills the code with
 * no tap at all — only when the message ends with the app's own 11-character hash. The hash
 * depends on the package name and the signing key, so each server environment carries the hash
 * of the build that talks to it. It is appended after the translation, not written into the
 * i18n string: it is not text to translate, and every locale gets it at once. Harmless on iOS,
 * on the web, and on Android phones without Google Play Services: just one more line of text.
 */
const withSmsRetrieverHash = (message: string): string => {
  const hash = process.env.ANDROID_SMS_RETRIEVER_HASH;

  if (!hash) return message;

  if (!SMS_RETRIEVER_APP_HASH_PATTERN.test(hash)) {
    logger.warn('ANDROID_SMS_RETRIEVER_HASH ignored — not an 11-character app hash');
    return message;
  }

  return `${message}\n\n${hash}`;
};

/**
 * @param dialCode the dial code of the number's country, which picks the provider. Required, so a
 * caller cannot forget it: left out, the code would go to the number the same digits make in the
 * default country. `undefined` only for a number stored without one, read as the default country's.
 */
export const sendSmsVerification = async (
  phoneNumber: string,
  code: string,
  locale: Locale | undefined,
  dialCode: string | undefined
): Promise<boolean> => {
  const message = withSmsRetrieverHash(
    translate('sms.verificationCode', locale ?? DEFAULT_LANGUAGE, { code })
  );

  const data = await sendSms({ to: phoneNumber, message, dialCode });

  return isSmsSentResponse(data);
};

/**
 * Texts a user and says why it did not go out when it did not. A user with no number on file is not
 * a refusal — the notification senders record that as its own outcome before getting here. The
 * dial code of their number picks the provider, and a country no provider serves is refused.
 */
export const sendSmsToUserWithResult = async (
  user: Parse.User,
  message: string
): Promise<ChannelSendResult> => {
  const phone = user.get('phone');
  const phoneNumber = phone?.number;

  if (!phoneNumber) return { isSent: false };

  const { data, errorCode, errorMessage } = await sendSmsWithResult({
    to: phoneNumber,
    message,
    dialCode: phone.code,
  });

  return { isSent: isSmsSentResponse(data), errorCode, errorMessage };
};

/**
 * Texts a bare number that is not (or no longer) the one on an account — the number a member just
 * replaced, which only exists in the contact change flow.
 */
export const sendSmsToPhoneNumber = async (
  phoneNumber: string,
  message: string,
  dialCode: string | undefined
): Promise<boolean> => (
  isSmsSentResponse(await sendSms({ to: phoneNumber, message, dialCode }))
);

export const sendSmsToUser = async (user: Parse.User, message: string): Promise<boolean> => (
  (await sendSmsToUserWithResult(user, message)).isSent
);
