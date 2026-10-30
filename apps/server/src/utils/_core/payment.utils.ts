import { getCountryByDialCode, getPaymentServiceByPhoneNumber } from '@shared/utils';

import { APP_PAYMENT_PHONES } from '@/constants/_core/payment.constants';
import { LARGE_MONEY_ACTION_ALERT_AMOUNTS } from '@/constants/_core/role.constants';
import { type Phone } from '@/types/app.type';

export { getPaymentServiceByPhoneNumber };

/**
 * whether a money action taken from the back-office is big enough for the owners to hear of it — never
 * for an amount or a currency that is unknown, or a currency with no threshold of its own
 */
export const isLargeMoneyAction = (amount?: number, currency?: string): boolean => {
  if (typeof amount !== 'number' || !currency) return false;

  const threshold = LARGE_MONEY_ACTION_ALERT_AMOUNTS[currency];

  return threshold !== undefined && amount >= threshold;
};

/**
 * The platform's own number a member's number pays to or is paid from: the one of the same mobile
 * money service, in the member's own country (read off the dial code) — money never crosses from
 * one operator, or one country, to another.
 * e.g. The user phone number is 0341234567, the payment service is YAS, so the default app payment phone is 0340000000
 * @param phone
 * @returns
 */
export const getAppDefaultPaymentPhone = (phone: Phone): Phone => {
  const service = getPaymentServiceByPhoneNumber(phone);
  const countryCode = getCountryByDialCode(phone.code)?.code;
  const phonesByCountry: Partial<Record<string, Partial<Record<string, Phone>>>> = APP_PAYMENT_PHONES;
  const defaultPhone = countryCode ? phonesByCountry[countryCode]?.[service] : undefined;

  if (!defaultPhone) {
    throw new Error('No default app payment phone found for this service');
  }

  return defaultPhone;
};
