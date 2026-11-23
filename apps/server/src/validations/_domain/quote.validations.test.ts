import { QUOTE_LINES_MAX } from '@shared/domain-constants';
import { QuoteAcceptanceMethodEnum, QuoteStatusEnum } from '@shared/domain-types';
import { describe, expect, it } from 'vitest';

import { QUOTE_LIST_MAX_LIMIT } from '@/constants/_domain/quote.constants';

import {
  changeQuoteStatusSchema, createQuoteSchema, getQuotesSchema, quoteInputSchema, updateQuoteSchema,
} from './quote.validations';

const validQuote = {
  client: 'client1',
  title: 'Mobile app',
  lines: [{ label: 'Design', quantity: 2, unitAmount: 50_000 }],
  currency: 'EUR',
};

const proof = {
  publicId: 'quotes/acceptance-proofs/k3j2h1',
  url: 'https://res.cloudinary.com/demo/image/upload/v1/quotes/acceptance-proofs/k3j2h1.pdf',
};

describe('writing a draft quote from the back-office', () => {
  it('should accept a quote with a client, a title, a line and a currency', () => {
    expect(createQuoteSchema.safeParse(validQuote).success).toBe(true);
  });

  it('should accept a VAT rate and a quantity with two decimals', () => {
    const quote = { ...validQuote, taxRate: 5.5, lines: [{ label: 'Day', quantity: 0.5, unitAmount: 100 }] };

    expect(createQuoteSchema.safeParse(quote).success).toBe(true);
  });

  it('should refuse a currency the quotes are not written in', () => {
    expect(createQuoteSchema.safeParse({ ...validQuote, currency: 'USD' }).success).toBe(false);
  });

  it('should refuse a quote with no line', () => {
    expect(createQuoteSchema.safeParse({ ...validQuote, lines: [] }).success).toBe(false);
  });

  it('should refuse more lines than a quote may hold', () => {
    const lines = Array.from({ length: QUOTE_LINES_MAX + 1 }, () => validQuote.lines[0]);

    expect(createQuoteSchema.safeParse({ ...validQuote, lines }).success).toBe(false);
  });

  it('should refuse a unit amount that is not a whole number of the smallest unit', () => {
    const lines = [{ label: 'Design', quantity: 1, unitAmount: 12.5 }];

    expect(createQuoteSchema.safeParse({ ...validQuote, lines }).success).toBe(false);
  });

  it('should refuse a VAT rate above 100 % or with more than two decimals', () => {
    expect(createQuoteSchema.safeParse({ ...validQuote, taxRate: 120 }).success).toBe(false);
    expect(createQuoteSchema.safeParse({ ...validQuote, taxRate: 5.555 }).success).toBe(false);
  });

  it('should refuse a line with a key that is not one of the fixed set', () => {
    const lines = [{ ...validQuote.lines[0], discount: 10 }];

    expect(createQuoteSchema.safeParse({ ...validQuote, lines }).success).toBe(false);
  });

  it.each(['number', 'totalAmount', 'paidAmount', 'status', 'version', 'issuedAt', 'acceptedAt'])(
    'should refuse %s, which the server computes or moves',
    (field) => {
      expect(createQuoteSchema.safeParse({ ...validQuote, [field]: 1 }).success).toBe(false);
      expect(updateQuoteSchema.safeParse({ ...validQuote, id: 'q1', [field]: 1 }).success).toBe(false);
    }
  );

  it('should turn an empty VAT rate and empty notes into nothing stored', () => {
    const input = quoteInputSchema.parse({ ...validQuote, taxRate: null, notes: '  ' });

    expect(input.taxRate).toBeNull();
    expect(input.notes).toBeNull();
  });

  it('should read a validity date sent as an ISO string', () => {
    const input = quoteInputSchema.parse({ ...validQuote, validUntil: '2026-12-31T00:00:00.000Z' });

    expect(input.validUntil).toEqual(new Date('2026-12-31T00:00:00.000Z'));
  });
});

describe('moving a quote', () => {
  it('should ask how the client accepted when the quote is accepted', () => {
    expect(changeQuoteStatusSchema.safeParse({ id: 'q1', status: QuoteStatusEnum.ACCEPTED }).success).toBe(false);
    expect(changeQuoteStatusSchema.safeParse({
      id: 'q1', status: QuoteStatusEnum.ACCEPTED, acceptanceMethod: QuoteAcceptanceMethodEnum.EMAIL,
    }).success).toBe(true);
  });

  it('should refuse an acceptance method on any other move', () => {
    expect(changeQuoteStatusSchema.safeParse({
      id: 'q1', status: QuoteStatusEnum.REFUSED, acceptanceMethod: QuoteAcceptanceMethodEnum.EMAIL,
    }).success).toBe(false);
  });

  it('should take a proof file with an acceptance', () => {
    expect(changeQuoteStatusSchema.safeParse({
      id: 'q1',
      status: QuoteStatusEnum.ACCEPTED,
      acceptanceMethod: QuoteAcceptanceMethodEnum.SIGNATURE,
      acceptanceProof: proof,
    }).success).toBe(true);
  });

  it('should refuse a proof file on any other move', () => {
    [QuoteStatusEnum.SENT, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED].forEach((status) => {
      expect(changeQuoteStatusSchema.safeParse({ id: 'q1', status, acceptanceProof: proof }).success).toBe(false);
    });
  });

  it('should refuse a proof that is not a plain file of an https address', () => {
    const accept = { id: 'q1', status: QuoteStatusEnum.ACCEPTED, acceptanceMethod: QuoteAcceptanceMethodEnum.EMAIL };

    expect(changeQuoteStatusSchema.safeParse({ ...accept, acceptanceProof: { ...proof, url: 'http://x.test/a.pdf' } })
      .success).toBe(false);
    expect(changeQuoteStatusSchema.safeParse({ ...accept, acceptanceProof: { ...proof, size: 10 } }).success)
      .toBe(false);
    expect(changeQuoteStatusSchema.safeParse({ ...accept, acceptanceProof: { url: proof.url } }).success)
      .toBe(false);
  });

  it('should never take a quote back to draft', () => {
    expect(changeQuoteStatusSchema.safeParse({ id: 'q1', status: QuoteStatusEnum.DRAFT }).success).toBe(false);
  });
});

describe('the quote list', () => {
  it('should refuse a page larger than the list allows', () => {
    expect(getQuotesSchema.safeParse({ limit: QUOTE_LIST_MAX_LIMIT + 1, skip: 0 }).success).toBe(false);
  });

  it('should refuse a status filter that does not exist', () => {
    expect(getQuotesSchema.safeParse({ limit: 10, skip: 0, filters: { status: 'paid' } }).success).toBe(false);
  });
});
