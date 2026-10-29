import { DEFAULT_COUNTRY, type Country } from '@shared/constants';

import { getCountryByCurrency } from './country.utils';

/**
 * Thousands grouped by a space, the fr-MG convention the whole product writes amounts in.
 * Grouped by hand rather than through `toLocaleString`: the separator then never depends on
 * whether the engine ships a full ICU dataset, and never comes back as a narrow no-break space
 * that renders as a missing glyph in some fonts.
 * @example formatNumberWithThousands(40000) => '40 000'
 */
export const formatNumberWithThousands = (value = 0): string =>
  String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/**
 * An amount as a member reads it: the figure, and the currency's symbol on the side the country
 * writes it. The one formatter every app, e-mail and notification goes through, so a price reads
 * the same everywhere it is shown.
 * @example formatAmount(40000) => '40 000 Ar'
 */
export const formatAmount = (amount = 0, country: Country = DEFAULT_COUNTRY): string => {
  const figure = formatNumberWithThousands(amount);

  return country.currencySymbolPosition === 'before'
    ? `${country.currencySymbol}${figure}`
    : `${figure} ${country.currencySymbol}`;
};

/**
 * An amount written in the currency it is stored in — for a payment, which carries its own ISO
 * code and must not be read in the currency of whoever looks at it. Written the way the country
 * that uses the currency writes it; a currency no country of the platform uses keeps its code.
 * @example formatAmountInCurrency(40000, 'MGA') => '40 000 Ar'
 * @example formatAmountInCurrency(40, 'EUR') => '40 EUR'
 */
export const formatAmountInCurrency = (amount = 0, currency?: string | null): string => {
  if (!currency) return formatAmount(amount);

  const country = getCountryByCurrency(currency);

  return country ? formatAmount(amount, country) : `${formatNumberWithThousands(amount)} ${currency}`;
};
