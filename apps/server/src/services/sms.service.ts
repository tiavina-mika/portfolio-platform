import { E2eOutboxChannelEnum } from '@shared/domain-types';
import { getSmsCountryByDialCode } from '@shared/utils';

import type {
  ISendSms, ISendSmsResponse, ISendSmsResult, SmsProviderSender,
} from '@/types/sms.type';
import type { SmsProvider } from '@shared/constants';

import {
  IS_E2E, IS_LOCAL, IS_TEST, SMS_UNREACHABLE_COUNTRY_CODE,
} from '@/constants/_core/constants';
import { DEFAULT_DIAL_CODE } from '@/constants/_core/user.constants';
import { sendWithMmsDuck } from '@/services/mmsduck.service';
import { recordE2eMessage } from '@/utils/_core/e2e-outbox.utils';
import { logger } from '@/utils/_core/logger';

/**
 * The sender of each SMS provider a country may name in its config. Adding a provider is one file
 * of its own (its client, its API key in the environment) and one line here; the countries it
 * serves then name it in their `sms.provider`.
 */
const SMS_PROVIDERS: Record<SmsProvider, SmsProviderSender> = {
  mmsduck: sendWithMmsDuck,
};

// ─── Out-of-credit listeners ────────────────────────────────────────────────

type OutOfCreditListener = () => void | Promise<void>;

const outOfCreditListeners: OutOfCreditListener[] = [];

/**
 * Registers what has to happen when the provider says the account has no credit left. This file is
 * Parse-free, so it cannot warn the staff itself: the cloud layer registers the alert here.
 */
export const onSmsOutOfCredit = (listener: OutOfCreditListener): void => {
  outOfCreditListeners.push(listener);
};

const notifyOutOfCredit = async (): Promise<void> => {
  await Promise.allSettled(outOfCreditListeners.map(async (listener) => listener()));
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Texts a number through the provider of its country, read off its dial code. A country no
 * provider serves is refused before anything is sent: handed over as national digits, its number
 * would reach whoever holds the same digits in another country.
 *
 * Every SMS costs real credits — never call a provider outside preProduction/production, just log
 * the message. A refusal comes back with the provider's own code and message: a notification
 * records them on the recipient the SMS failed for.
 */
export const sendSmsWithResult = async (values: ISendSms): Promise<ISendSmsResult> => {
  const country = getSmsCountryByDialCode(values.dialCode || DEFAULT_DIAL_CODE);

  if (!country?.sms) {
    logger.warn('sendSms refused — no SMS provider texts the country of the number', {
      dialCode: values.dialCode,
    });
    return {
      errorCode: SMS_UNREACHABLE_COUNTRY_CODE,
      errorMessage: 'No SMS provider texts the country of this number',
    };
  }

  // E2E runs keep the SMS on top of skipping it, so a test can assert on what was sent
  if (IS_E2E) recordE2eMessage({ channel: E2eOutboxChannelEnum.SMS, to: [values.to], body: values.message });

  if (IS_LOCAL || IS_TEST) {
    logger.info('sendSms skipped (dev/test) — message:', values.message);
    return { data: { success: true, message_id: 'local-skip', status: 'queued' } };
  }

  const { isOutOfCredit, ...result } = await SMS_PROVIDERS[country.sms.provider]({
    nationalNumber: values.to,
    dialCode: country.dialCode,
    message: values.message,
  });

  if (isOutOfCredit) await notifyOutOfCredit();

  return result;
};

export const sendSms = async (values: ISendSms): Promise<ISendSmsResponse> => (
  (await sendSmsWithResult(values)).data
);
