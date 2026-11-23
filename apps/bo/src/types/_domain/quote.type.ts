import type { IQuoteLine, QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';

/** the client of a quote, as much of it as the list reads through the pointer */
export interface IQuoteClient {
  id: string;
  name: string;
  email: string;
}

/** an Aldaron quote, as the list and the edit dialog read it; amounts in the smallest unit */
export interface IQuote {
  id: string;
  number: string;
  client: IQuoteClient;
  title: string;
  status: QuoteStatusEnum;
  lines: IQuoteLine[];
  currency: string;
  taxRate?: number;
  totalAmount: number;
  paidAmount: number;
  issuedAt?: string;
  validUntil?: string;
  notes?: string;
  version: number;
  acceptedAt?: string;
  acceptanceMethod?: QuoteAcceptanceMethodEnum;
  createdAt: string;
  updatedAt: string;
}

/**
 * One line as it is typed: the unit amount in the main unit of the currency (`12.50`), converted to
 * the smallest unit only when the quote is sent to the server.
 */
export interface IQuoteLineFormValues {
  label: string;
  quantity: number;
  unitAmount: number;
}

/** what the quote form holds */
export interface IQuoteFormValues {
  // the id of the client
  client: string;
  title: string;
  lines: IQuoteLineFormValues[];
  currency: string;
  // the box holds text while typed (`''` when empty); the validation turns it into a number or `null`
  taxRate?: number | string | null;
  validUntil?: Date | null;
  notes?: string;
}

/** what the quote form sends: the amounts in the smallest unit, nothing the server computes */
export interface IQuoteInput {
  client: string;
  title: string;
  lines: IQuoteLine[];
  currency: string;
  taxRate: number | null;
  validUntil: Date | null;
  notes: string | null;
}

export interface IQuoteState {
  quotes: IQuote[];
  count: number;
}
