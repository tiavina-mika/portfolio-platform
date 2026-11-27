import { Currency, Rates } from '@/types/app.type';

import {
  CURRENCIES,
  FALLBACK_RATES,
  MGA_ROUNDING,
  RATES_API_URLS,
} from './constants';

// no-break space and narrow no-break space: the separators the French texts group thousands with
const NBSP = String.fromCharCode(0xa0);
const NARROW_NBSP = String.fromCharCode(0x202f);
const SPACES = new RegExp(`[${NBSP}${NARROW_NBSP} ]`, 'g');

/*
 * A number as written in the texts, as a JS number: "1 500" and "37,50" (French), "1,500" and "37.50"
 * (English). A comma followed by exactly three digits groups thousands, a comma followed by one or two
 * digits is a decimal mark: no price is written with three decimals.
 */
const parseAmount = (value: string): number => {
  const compact = value.replace(SPACES, '');
  const normalized = /,\d{3}(?!\d)/.test(compact)
    ? compact.replace(/,/g, '')
    : compact.replace(',', '.');

  return parseFloat(normalized);
};

const groupThousands = (value: number, separator: string): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, separator);

// a euro amount can have cents (the price of a screen, "52,5 €"): only the integer part is grouped
const writeEuros = (euros: number, separator: string, decimalMark: string): string => {
  const [integer, decimals] = String(Math.round(euros * 100) / 100).split('.');
  const grouped = groupThousands(Number(integer), separator);

  return decimals ? `${grouped}${decimalMark}${decimals}` : grouped;
};

const isCurrency = (value: unknown): value is Currency =>
  CURRENCIES.includes(value as Currency);

/**
 * An amount in euros written in a currency: dollars are rounded to the unit, ariary to the nearest
 * thousand. The euro keeps its amount, written the way the locale writes it (French by default).
 */
type FormatOptions = {
  currency: Currency;
  rates: Rates;
  /**
   * Writes the symbol of the currency with the amount
   * @default true
   */
  withSymbol?: boolean;
  /**
   * The language the euro is written in: English puts the symbol first ("€1,500")
   */
  locale?: string;
};

export const formatPrice = (
  euros: number,
  {
    currency, rates, withSymbol = true, locale,
  }: FormatOptions
): string => {
  if (currency === 'USD') {
    return `${withSymbol ? '$' : ''}${groupThousands(Math.round(euros * rates.USD), ',')}`;
  }

  if (currency === 'MGA') {
    const ariary = Math.round((euros * rates.MGA) / MGA_ROUNDING) * MGA_ROUNDING;

    return `${groupThousands(ariary, NBSP)}${withSymbol ? `${NBSP}Ar` : ''}`;
  }

  // the English writes the euro before the amount, with a comma for the thousands: "€1,500"
  if (locale === 'en') return `${withSymbol ? '€' : ''}${writeEuros(euros, ',', '.')}`;

  return `${writeEuros(euros, NBSP, ',')}${withSymbol ? `${NBSP}€` : ''}`;
};

// a number, as written in the texts: "1 500", "37,50", "18.5"
const AMOUNT = '(\\d(?:[\\d\\u00a0\\u202f ]*\\d)?(?:[.,]\\d+)?)';
// "18 à 30 €", "€18 to €30", "18 hatramin'ny 30 €": the separator is a word of the three languages
const RANGE = new RegExp(`${AMOUNT}(\\s(?:à|hatramin.ny|to|–|-)\\s)€?${AMOUNT}\\s?€`, 'g');
const SUFFIX = new RegExp(`${AMOUNT}\\s?€`, 'g');
const PREFIX = new RegExp(`€\\s?${AMOUNT}`, 'g');

/**
 * A text with its prices written in euros ("À partir de 1 500 €", "€25 / screen", "18 à 30 €"), with
 * every price converted. A range shows the symbol after its last amount only.
 */
export const convertPrices = (text: string, currency: Currency, rates: Rates): string => {
  const format = (euros: number, withSymbol = true) =>
    formatPrice(euros, { currency, rates, withSymbol });

  if (currency === 'EUR' || !text.includes('€')) return text;

  return text
    .replace(
      RANGE,
      (_match, from: string, separator: string, to: string) => [
        format(parseAmount(from), false),
        separator,
        format(parseAmount(to)),
      ].join('')
    )
    .replace(SUFFIX, (_match, amount: string) => format(parseAmount(amount)))
    .replace(PREFIX, (_match, amount: string) => format(parseAmount(amount)));
};

export type RatesResponse = {
  rates?: Partial<Record<string, number>>;
  eur?: Partial<Record<string, number>>;
};

// a rate is a finite number above zero: anything else would write "NaN" or "0" as a price
export const isValidRate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

type LiveRates = Pick<Rates, 'USD' | 'MGA'>;

// the two free APIs answer in a different shape: `rates.USD` or `eur.usd`
export const readRates = (data: RatesResponse | null): LiveRates | null => {
  const usd = data?.rates?.USD ?? data?.eur?.usd;
  const mga = data?.rates?.MGA ?? data?.eur?.mga;

  return isValidRate(usd) && isValidRate(mga) ? { USD: usd, MGA: mga } : null;
};

/**
 * The rates saved in the browser, `null` when they are missing, older than `maxAgeMs`, or not valid
 * numbers (the storage can hold anything).
 */
export const readStoredRates = (
  stored: string | null,
  maxAgeMs: number,
  now = Date.now()
): LiveRates | null => {
  if (!stored) return null;

  try {
    const data = JSON.parse(stored) as { savedAt?: unknown; USD?: unknown; MGA?: unknown } | null;

    if (typeof data?.savedAt !== 'number' || now - data.savedAt >= maxAgeMs) return null;

    return isValidRate(data.USD) && isValidRate(data.MGA) ? { USD: data.USD, MGA: data.MGA } : null;
  } catch {
    return null;
  }
};

/**
 * The current rates of the dollar and the ariary against the euro, from the first free API that
 * answers. `null` when none does: the caller keeps its fallback rates.
 */
export const fetchRates = async (): Promise<LiveRates | null> => {
  for (const url of RATES_API_URLS) {
    try {
      const response = await fetch(url);

      if (!response.ok) continue;

      const rates = readRates((await response.json()) as RatesResponse | null);

      if (rates) return rates;
    } catch {
      // this API is down or unreachable: the next one is tried
      continue;
    }
  }

  return null;
};

export const getFallbackRates = (): Rates => ({ ...FALLBACK_RATES });

export const parseCurrency = (value: string | null): Currency | null =>
  isCurrency(value) ? value : null;

/*
 * The storage of the browser, which can be blocked (private mode, a policy): reading then gives nothing
 * and writing does nothing, the page just forgets the choice
 */
export const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // blocked storage: the choice lasts until the page is left
    return undefined;
  }
};
