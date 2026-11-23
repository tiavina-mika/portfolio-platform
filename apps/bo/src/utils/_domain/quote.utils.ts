import { DEFAULT_QUOTE_CURRENCY } from '@shared/domain-constants';
import { fromMinorUnits, getQuoteCurrencyDecimals, isQuoteCurrency } from '@shared/domain-utils';

import { Locale } from '@/types/_core/setting.type';

/**
 * The currency a new quote starts in: the default picked in the settings while it is still one the
 * quotes are written in, the domain's default otherwise.
 * @param pickedCurrency the default currency of the settings, if one was picked
 */
export const getNewQuoteCurrency = (pickedCurrency?: string): string => (
  pickedCurrency && isQuoteCurrency(pickedCurrency) ? pickedCurrency : DEFAULT_QUOTE_CURRENCY
);

/**
 * A stored amount as the reader expects to see it, in the currency of its quote: `1 250,00 €`,
 * `40 000 Ar`. The decimals are the currency's, so an ariary amount never shows cents.
 * @param amount an integer in the smallest unit of the currency
 * @param currency the ISO 4217 code of the quote
 * @param locale the language of the back-office
 */
export const formatQuoteAmount = (amount: number, currency: string, locale: Locale): string => {
  const decimals = getQuoteCurrencyDecimals(currency);

  return new Intl.NumberFormat(locale || undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fromMinorUnits(amount, currency));
};
