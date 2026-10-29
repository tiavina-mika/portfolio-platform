import { DEFAULT_COUNTRY, type Country } from '@shared/constants';
import { getSmsCountryByDialCode, isNationalMobileNumber, splitTypedPhoneNumber } from '@shared/utils';

import type { Phone } from '@/types/user.type';

import { PHONE_SEARCH_MIN_DIGITS, PHONE_SEARCH_PATTERN } from '@/constants/_core/user.constants';

import { getAgentCountry } from './agent-context.utils';

/**
 * Brings a phone number to the single shape every stored `phone.number` uses: digits only, no
 * dial code, no national trunk prefix — `0341234567`, `+261 34 12 345 67` and `341234567` all
 * become `341234567`.
 *
 * Every lookup that resolves an account by its number has to go through this: the value is stored
 * normalized at sign-up, so a client sending the number the way a person writes it would otherwise
 * silently match no account at all.
 *
 * @param dialCode bare dial code ('261'), stripped from the front of the number when present
 */
export const normalizePhoneNumber = (number: string, dialCode?: string): string => {
  const digits = String(number).replace(/\D/g, '');
  const withoutDialCode = dialCode && digits.startsWith(dialCode)
    ? digits.slice(dialCode.length)
    : digits;

  return withoutDialCode.replace(/^0+/, '');
};

/** Dial codes are stored bare ('261'), whatever form the client sends. */
export const normalizePhone = (phone: Phone): Phone => {
  const code = phone.code.replace(/^\+/, '');

  return { code, number: normalizePhoneNumber(String(phone.number), code) };
};

/** Two numbers are the same once normalized, whatever way each one was written. */
export const isSamePhone = (a: Phone, b: Phone): boolean => {
  const first = normalizePhone(a);
  const second = normalizePhone(b);

  return first.code === second.code && first.number === second.number;
};

/**
 * The `username` a phone-signup account is created with — the account has no email, so the number
 * in its international form is the only login identity it has.
 */
export const toPhoneUsername = (phone: Phone): string => {
  const { code, number } = normalizePhone(phone);

  return `+${code}${number}`;
};

/**
 * A number typed by a person in the international form a ticket keeps: the dial code of the country
 * its `+` names, the default country's for a number typed the way it is written at home.
 * @example toTypedPhoneUsername('+261 34 12 345 67') => '+261341234567'
 */
export const toTypedPhoneUsername = (value: string): string => {
  const split = splitTypedPhoneNumber(value);

  return toPhoneUsername({
    code: (split?.country ?? DEFAULT_COUNTRY).dialCode,
    number: split?.digits ?? value,
  });
};

/** What a person types a number with: digits, a leading `+`, and the separators people put in. */
const PHONE_TYPED_CHARACTERS_PATTERN = /^[\d\s+\-.()]+$/;

/**
 * Whether a text reaches a number: its dial code is the one of a country with an SMS provider, and
 * its digits, in any of the forms people write them (`034 12 345 67`, `+261341234567`,
 * `341234567`), make a mobile number of that country. Anything with a letter in it is refused
 * rather than stripped down to its digits.
 */
export const isSmsReachablePhone = ({ code, number }: Phone): boolean => {
  const country = getSmsCountryByDialCode(code);
  const value = String(number);

  return !!country &&
    PHONE_TYPED_CHARACTERS_PATTERN.test(value) &&
    isNationalMobileNumber(normalizePhoneNumber(value, country.dialCode.replace(/^\+/, '')), country);
};

/**
 * The national digits a free-text search should look a phone number up by, or an empty string when
 * the text does not look like a number worth looking up. `034 12 345 67`, `+261341234567` and
 * `261341234567` all give `341234567`, which is how accounts store their number. A `+` dial code
 * is read as the country it names; a number typed without one is read the way the operator writes
 * it at home: `261341234567` is a Malagasy number for an agent in Madagascar, and a French
 * `33612345678` for one in France.
 * @param text what the operator typed in a search box
 * @param homeCountry the operator's own country; the default country when the typist is not known
 */
export const toPhoneSearchDigits = (
  text: string,
  homeCountry: Country = getAgentCountry() ?? DEFAULT_COUNTRY
): string => {
  const trimmed = text.trim();

  if (!PHONE_SEARCH_PATTERN.test(trimmed)) return '';

  const typed = trimmed.startsWith('+') ? splitTypedPhoneNumber(trimmed, homeCountry) : undefined;
  const digits = typed
    ? typed.digits
    : normalizePhoneNumber(trimmed, homeCountry.dialCode.replace(/^\+/, ''));

  return digits.length >= PHONE_SEARCH_MIN_DIGITS ? digits : '';
};
