import { DEFAULT_QUOTE_CURRENCY, QUOTE_CURRENCIES } from '@shared/domain-constants';
import { QuoteStatusEnum, type IQuoteLine } from '@shared/domain-types';

export type QuoteCurrency = keyof typeof QUOTE_CURRENCIES;

/** the amounts a quote adds up to, each an integer in the smallest unit of its currency */
export type QuoteAmounts = {
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
};

// what the amounts of a line are computed from: its label plays no part
type QuoteLineAmounts = Pick<IQuoteLine, 'quantity' | 'unitAmount'>;

/*
 * The only moves a quote may make. A draft is sent; a sent quote is answered (accepted or refused) or
 * left to expire. The three answers are final: a quote is revised by a new version, never reopened.
 */
const QUOTE_STATUS_TRANSITIONS: Record<QuoteStatusEnum, QuoteStatusEnum[]> = {
  [QuoteStatusEnum.DRAFT]: [QuoteStatusEnum.SENT],
  [QuoteStatusEnum.SENT]: [QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED],
  [QuoteStatusEnum.ACCEPTED]: [],
  [QuoteStatusEnum.REFUSED]: [],
  [QuoteStatusEnum.EXPIRED]: [],
};

/** whether a currency code is one a quote can be written in */
export const isQuoteCurrency = (currency: string): currency is QuoteCurrency => (
  Object.prototype.hasOwnProperty.call(QUOTE_CURRENCIES, currency)
);

/**
 * How many decimals the amounts of a currency are typed with.
 * @example getQuoteCurrencyDecimals('EUR') => 2
 * @example getQuoteCurrencyDecimals('MGA') => 0
 */
export const getQuoteCurrencyDecimals = (currency: string): number => (
  QUOTE_CURRENCIES[isQuoteCurrency(currency) ? currency : DEFAULT_QUOTE_CURRENCY].decimals
);

/**
 * A typed amount in the main unit, as it is stored: an integer in the smallest unit.
 * @example toMinorUnits(12.5, 'EUR') => 1250
 * @example toMinorUnits(40000, 'MGA') => 40000
 */
export const toMinorUnits = (amount: number, currency: string): number => (
  Math.round(amount * (10 ** getQuoteCurrencyDecimals(currency)))
);

/**
 * A stored amount back in the main unit, to be typed or read.
 * @example fromMinorUnits(1250, 'EUR') => 12.5
 */
export const fromMinorUnits = (amount: number, currency: string): number => (
  amount / (10 ** getQuoteCurrencyDecimals(currency))
);

/**
 * The amount of one line: its quantity times its unit amount, rounded to the smallest unit, so a
 * quantity with decimals never leaves a fraction of a cent.
 */
export const computeQuoteLineAmount = ({ quantity, unitAmount }: QuoteLineAmounts): number => (
  Math.round(quantity * unitAmount)
);

/**
 * What a quote adds up to. The VAT is computed once on the subtotal, not line by line, so the rounding
 * happens a single time; no rate (or an empty one) means no VAT.
 * @param lines the priced lines, amounts in the smallest unit
 * @param taxRate the VAT rate in percent, or nothing
 */
export const computeQuoteAmounts = (
  lines: QuoteLineAmounts[],
  taxRate?: number | null
): QuoteAmounts => {
  const subtotalAmount = lines.reduce((sum, line) => sum + computeQuoteLineAmount(line), 0);
  const taxAmount = taxRate ? Math.round((subtotalAmount * taxRate) / 100) : 0;

  return { subtotalAmount, taxAmount, totalAmount: subtotalAmount + taxAmount };
};

/** the statuses a quote can move to from the one it is in */
export const getNextQuoteStatuses = (status: QuoteStatusEnum): QuoteStatusEnum[] => (
  QUOTE_STATUS_TRANSITIONS[status] ?? []
);

/** whether a quote may move from one status to another */
export const canChangeQuoteStatus = (from: QuoteStatusEnum, to: QuoteStatusEnum): boolean => (
  getNextQuoteStatuses(from).includes(to)
);

/**
 * Whether a quote can be revised: only a sent one, still waiting for the client's answer. A revision is
 * a new draft version of the same number; an accepted quote is completed by an amendment instead.
 */
export const canReviseQuote = (status: QuoteStatusEnum): boolean => status === QuoteStatusEnum.SENT;

/** whether an amendment (extra work, its own number) can be written for a quote: only an accepted one */
export const canAmendQuote = (status: QuoteStatusEnum): boolean => status === QuoteStatusEnum.ACCEPTED;
