import type { IContact } from '@/types/_core/contact.type';
import type { IFileCloud } from '@/types/_core/file.type';
import type { IQuoteLine, QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';

/** the client of a quote, as much of it as the list reads through the pointer */
export interface IQuoteClient {
  id: string;
  name: string;
  email: string;
}

/**
 * the quote another one revises or amends, as much of it as the list names: a revision shares its
 * number, an amendment has its own
 */
export interface IQuoteParent {
  id: string;
  number: string;
  version: number;
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
  // the quote this one revises or amends; none for a first quote
  parentQuote?: IQuoteParent;
  acceptedAt?: string;
  acceptanceMethod?: QuoteAcceptanceMethodEnum;
  // the file the acceptance rests on, when one was joined
  acceptanceProof?: IFileCloud;
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

/**
 * What a quote request of the Aldaron site starts a draft from: the client found by its e-mail (or just
 * created from it), the product as the title and the estimate as lines priced 0, for the team to price.
 */
export interface IQuoteFromContact {
  client: IQuoteClient;
  title: string;
  lines: IQuoteLine[];
}

/** a contact message that may have become a quote: the generic contact knows nothing of quotes */
export type IContactWithQuote = IContact & {
  // the quote the request was turned into, as a pointer
  quote?: { objectId: string };
};

export interface IQuoteState {
  quotes: IQuote[];
  count: number;
}
