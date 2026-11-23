import {
  QUOTE_COUNTER_NAME_PREFIX, QUOTE_NUMBER_PREFIX, QUOTE_NUMBER_SEQUENCE_DIGITS,
} from '@/constants/_domain/quote.constants';

/**
 * The counter row the quotes of one year are numbered from: one row per year, so the numbering starts
 * again at 1 every January without anything to reset.
 * @example buildQuoteCounterName(2026) => 'quote-2026'
 */
export const buildQuoteCounterName = (year: number): string => `${QUOTE_COUNTER_NAME_PREFIX}-${year}`;

/**
 * The year a quote is numbered in: the calendar year where the business works, not the server's (UTC)
 * year, so a quote written on the 1st of January at 1 a.m. in Antananarivo is already the new year's.
 * @param date the moment the quote is created
 * @param timeZone the IANA time zone of the business
 * @example getQuoteNumberYear(new Date('2026-12-31T22:30:00Z'), 'Indian/Antananarivo') => 2027
 */
export const getQuoteNumberYear = (date: Date, timeZone: string): number => (
  Number(new Intl.DateTimeFormat('en', { timeZone, year: 'numeric' }).format(date))
);

/**
 * The readable reference of a quote.
 * @param year the year the quote was created in
 * @param sequence its rank in that year, from 1
 * @example formatQuoteNumber(2026, 1) => 'AL-2026-001'
 */
export const formatQuoteNumber = (year: number, sequence: number): string => (
  `${QUOTE_NUMBER_PREFIX}-${year}-${String(sequence).padStart(QUOTE_NUMBER_SEQUENCE_DIGITS, '0')}`
);
