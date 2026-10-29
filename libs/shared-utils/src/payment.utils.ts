import { PAYMENT_SERVICE_PREFIXES_BY_COUNTRY } from '@shared/constants';
import { PaymentServiceEnum } from '@shared/types';

import { getCountryByDialCode } from './country.utils';

/** A phone number as stored: its dial code (bare or with its '+') and its national digits */
export type PhoneNumberLike = { code: string; number: string | number };

export type CountryPaymentService = { service: PaymentServiceEnum; prefixes: readonly string[] };

/**
 * The mobile money services of a country with their operator prefixes, in the order they are
 * offered — none for a country the platform has no service in.
 * @param countryCode ISO 3166-1 alpha-2 code
 */
export const getCountryPaymentServices = (countryCode: string): readonly CountryPaymentService[] => {
  const byCountry: Record<string, readonly CountryPaymentService[] | undefined> =
    PAYMENT_SERVICE_PREFIXES_BY_COUNTRY;

  return byCountry[countryCode] ?? [];
};

/**
 * Detects the mobile money provider of a phone number — used both to route a payment and to pick
 * the app's own escrow number for that provider. The provider is looked up among those of the
 * number's own country, read off its dial code, then by its operator prefix; the number may still
 * carry its national leading 0 (`0341234567`). Throws when no provider of a country the platform
 * runs in matches: a foreign number is never routed as a local one.
 */
export const getPaymentServiceByPhoneNumber = (phone: PhoneNumberLike): PaymentServiceEnum => {
  const country = getCountryByDialCode(phone.code);
  const services = country ? getCountryPaymentServices(country.code) : [];
  const phoneNumber = phone.number.toString().replace(/^0/, '');
  const match = services.find(({ prefixes }) => prefixes.some(prefix => phoneNumber.startsWith(prefix)));

  if (match) return match.service;

  throw new Error('Unknown payment type');
};
