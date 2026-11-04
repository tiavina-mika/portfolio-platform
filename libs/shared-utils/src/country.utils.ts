import { COUNTRIES, DEFAULT_COUNTRY, type Country } from '@shared/constants';

/**
 * The country a stored code designates, or the default one: rows and places saved without a
 * country, or with one the platform does not run in, are read as the default country's.
 * @param code ISO 3166-1 alpha-2 code, in any case
 */
export const getCountry = (code?: string | null): Country => (
  (code && (COUNTRIES as Record<string, Country>)[code.toUpperCase()]) || DEFAULT_COUNTRY
);

/**
 * The country the platform runs in that a dial code belongs to, or `undefined` when it runs in
 * none of them — never the default country: a number from elsewhere must not be read as a local one.
 * @param dialCode bare ('261') or with its '+' ('+261'), the two forms phone numbers carry
 * @example getCountryByDialCode('261') => COUNTRIES.MG
 */
export const getCountryByDialCode = (dialCode?: string | null): Country | undefined => {
  if (!dialCode) return undefined;

  const prefixed = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;

  return Object.values(COUNTRIES as Record<string, Country>).find(country => country.dialCode === prefixed);
};

/**
 * The country of a dial code when texts reach its numbers — it has an SMS provider — or `undefined`
 * for any other: a sign-up by phone, an emergency contact or an answer by SMS needs such a number.
 * @param dialCode bare ('261') or with its '+' ('+261')
 */
export const getSmsCountryByDialCode = (dialCode?: string | null): Country | undefined => {
  const country = getCountryByDialCode(dialCode);

  return country?.sms ? country : undefined;
};

/** The dial codes texts reach ('+261'…), in the order the countries are declared. */
export const getSmsDialCodes = (): string[] => Object.values(COUNTRIES as Record<string, Country>)
  .filter(country => !!country.sms)
  .map(country => country.dialCode);

/**
 * Whether a number, as stored (no dial code, no leading 0), is a mobile number of a country: one
 * of its operator prefixes, then digits up to its national length.
 * @example isNationalMobileNumber('341234567') => true
 */
export const isNationalMobileNumber = (number: string, country: Country = DEFAULT_COUNTRY): boolean => {
  const { nationalNumberLength, prefixes } = country.mobilePhone;

  return number.length === nationalNumberLength &&
    /^\d+$/.test(number) &&
    prefixes.some(prefix => number.startsWith(prefix));
};

/**
 * Whether a number typed by a person is a mobile number of a country, in any of the forms people
 * write it: with the dial code or the national 0, spaced or dashed — `034 12 345 67`, `0341234567`,
 * `341234567`, `+261 34 12 345 67`. A letter, or a dial code written without its `+`, is refused.
 */
export const isTypedMobilePhoneNumber = (value: string, country: Country = DEFAULT_COUNTRY): boolean => {
  if (!/^\+?[\d\s-]+$/.test(value)) return false;

  const digits = value.replace(/[\s-]/g, '');
  const national = digits.startsWith(country.dialCode)
    ? digits.slice(country.dialCode.length)
    : digits.replace(/^0/, '');

  return isNationalMobileNumber(national, country);
};

/**
 * The country the platform runs in that uses a currency, or `undefined` when it runs in none that
 * does. Currencies are stored as ISO 4217 codes, so this is how a stored amount gets back the
 * writing rules (symbol, side) and the clock of the country it belongs to.
 * @example getCountryByCurrency('MGA') => COUNTRIES.MG
 */
export const getCountryByCurrency = (currency?: string | null): Country | undefined => (
  currency
    ? Object.values(COUNTRIES as Record<string, Country>).find((candidate) => candidate.currency === currency)
    : undefined
);

/**
 * How the currency of an ISO 4217 code is written for a member: the symbol of the country that uses
 * it ("Ar" for MGA). A currency no country of the platform uses is written as its own code rather
 * than with a symbol borrowed from another country.
 * @example getCurrencySymbol('MGA') => 'Ar'
 * @example getCurrencySymbol('EUR') => 'EUR'
 */
export const getCurrencySymbol = (currency?: string | null): string => {
  if (!currency) return DEFAULT_COUNTRY.currencySymbol;

  return getCountryByCurrency(currency)?.currencySymbol ?? currency;
};

/**
 * National digits grouped the way the country reads them out loud. Digits beyond the declared
 * groups stay in the last one, so a number longer than expected is never cut.
 * @example groupNationalDigits('341234567') => '34 12 345 67'
 */
export const groupNationalDigits = (digits: string, country: Country = DEFAULT_COUNTRY): string => {
  const { groupSizes } = country.mobilePhone;
  let start = 0;

  return groupSizes
    .map((size, index) => {
      const end = index === groupSizes.length - 1 ? undefined : start + size;
      const group = digits.slice(start, end);

      start += size;
      return group;
    })
    .filter(Boolean)
    .join(' ');
};

/**
 * Tells which country a number typed by a person belongs to, and its national digits. A number
 * starting with `+` names its own country through its dial code; any other is read as a number of
 * the home country, the way it is written at home. `undefined` when the `+` dial code is the
 * one of no country the platform runs in.
 * @param homeCountry the country of whoever typed the number — a back-office agent types a number in
 * their own country's way; the default country when the typist is not known (a website visitor)
 * @example splitTypedPhoneNumber('+261 34 12 345 67') => { country: COUNTRIES.MG, digits: '341234567' }
 * @example splitTypedPhoneNumber('034 12 345 67') => { country: COUNTRIES.MG, digits: '341234567' }
 */
export const splitTypedPhoneNumber = (
  value: string,
  homeCountry: Country = DEFAULT_COUNTRY
): { country: Country; digits: string } | undefined => {
  const trimmed = value.trim();
  const allDigits = trimmed.replace(/\D/g, '');
  const isInternational = trimmed.startsWith('+');
  const country = isInternational
    ? Object.values(COUNTRIES as Record<string, Country>)
      .find((candidate) => allDigits.startsWith(candidate.dialCode.slice(1)))
    : homeCountry;

  if (!country) return undefined;

  const { trunkPrefix } = country.mobilePhone;
  const nationalPart = isInternational ? allDigits.slice(country.dialCode.length - 1) : allDigits;
  const digits = trunkPrefix && nationalPart.startsWith(trunkPrefix)
    ? nationalPart.slice(trunkPrefix.length)
    : nationalPart;

  return { country, digits };
};

/**
 * Whether a number typed by a person is a mobile number a text reaches: of the default country when
 * it carries no dial code, of the country its `+` dial code names otherwise, provided an SMS
 * provider texts that country.
 */
export const isTypedSmsMobilePhoneNumber = (value: string): boolean => {
  if (!/^\+?[\d\s-]+$/.test(value.trim())) return false;

  const split = splitTypedPhoneNumber(value);

  return !!split?.country.sms && isNationalMobileNumber(split.digits, split.country);
};

/**
 * What a query on the editorial content of a country (articles, pages) must match on its stored
 * `country`. The default country also owns the rows saved before the field existed, which carry
 * none, so it is asked for as "any country but the others" — a missing field passes that, where
 * an equality on the code would drop those rows.
 * @example getContentCountryConstraint('MG') => { notContainedIn: [] } while MG is the only country
 */
export const getContentCountryConstraint = (
  countryCode?: string | null
): { equalTo: string } | { notContainedIn: string[] } => {
  const { code } = getCountry(countryCode);

  if (code !== DEFAULT_COUNTRY.code) return { equalTo: code };

  return { notContainedIn: Object.keys(COUNTRIES).filter((otherCode) => otherCode !== code) };
};

/**
 * `getContentCountryConstraint` for several countries at once: a back-office list filtered on some
 * countries, or kept inside the ones an editor's roles cover. The rows saved before the field existed
 * still go with the default country, so a list that includes it keeps them.
 * @param countryCodes the countries to keep; none matches nothing
 * @example getContentCountriesConstraint(['MG']) => { notContainedIn: [] } while MG is the only country
 */
export const getContentCountriesConstraint = (
  countryCodes: string[]
): { containedIn: string[] } | { notContainedIn: string[] } => {
  if (!countryCodes.includes(DEFAULT_COUNTRY.code)) return { containedIn: countryCodes };

  return { notContainedIn: Object.keys(COUNTRIES).filter((code) => !countryCodes.includes(code)) };
};
