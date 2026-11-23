import { QuoteStatusEnum } from '@shared/domain-types';
import {
  canAmendQuote, canChangeQuoteStatus, canReviseQuote, computeQuoteAmounts, fromMinorUnits,
  getNextQuoteStatuses, toMinorUnits,
} from '@shared/domain-utils';
import { describe, expect, it } from 'vitest';

import { QuoteParentRelationEnum } from '@/types/quote.type';

import {
  buildQuoteCounterName, canAttachQuoteAcceptanceProof, formatQuoteNumber, getQuoteNumberYear,
  getQuoteParentRelation, isQuoteAcceptanceProofFile, isQuoteValidityAhead,
} from './quote.utils';

/*
 * The server computes the stored total and checks the transitions with the shared functions below
 * (the back-office shows the same total live): they are money, so they are tested here, with the
 * server's own numbering.
 */
describe('the readable number of a quote', () => {
  it('should pad the rank of the year to three digits', () => {
    expect(formatQuoteNumber(2026, 1)).toBe('AL-2026-001');
    expect(formatQuoteNumber(2026, 42)).toBe('AL-2026-042');
  });

  it('should grow a digit past the 999th quote of a year rather than wrap', () => {
    expect(formatQuoteNumber(2026, 1000)).toBe('AL-2026-1000');
  });

  it('should number each year from its own counter, so the numbering starts again every year', () => {
    expect(buildQuoteCounterName(2026)).toBe('quote-2026');
    expect(buildQuoteCounterName(2027)).not.toBe(buildQuoteCounterName(2026));
  });

  it('should turn the year at midnight where the business works, not at midnight UTC', () => {
    // 31 December 22:30 UTC is already 1 January 01:30 in Antananarivo (UTC+3)
    expect(getQuoteNumberYear(new Date('2026-12-31T22:30:00Z'), 'Indian/Antananarivo')).toBe(2027);
    expect(getQuoteNumberYear(new Date('2026-12-31T20:30:00Z'), 'Indian/Antananarivo')).toBe(2026);
  });
});

describe('the total of a quote', () => {
  it('should add up the lines with no VAT when there is no rate', () => {
    const amounts = computeQuoteAmounts([
      { quantity: 2, unitAmount: 50_000 },
      { quantity: 1, unitAmount: 12_550 },
    ], null);

    expect(amounts).toEqual({ subtotalAmount: 112_550, taxAmount: 0, totalAmount: 112_550 });
  });

  it('should add the VAT computed once on the subtotal', () => {
    // 100.00 € + 20 % = 120.00 €
    expect(computeQuoteAmounts([{ quantity: 1, unitAmount: 10_000 }], 20)).toEqual({
      subtotalAmount: 10_000, taxAmount: 2_000, totalAmount: 12_000,
    });
  });

  it('should round a quantity with decimals to the smallest unit', () => {
    // half a day at 333.33 € is 166.665 €, stored as 16 667 cents
    expect(computeQuoteAmounts([{ quantity: 0.5, unitAmount: 33_333 }]).totalAmount).toBe(16_667);
  });

  it('should round the VAT to the smallest unit', () => {
    // 0.10 € at 5.5 % is 0.0055 €: one cent once rounded
    expect(computeQuoteAmounts([{ quantity: 1, unitAmount: 10 }], 5.5).taxAmount).toBe(1);
  });

  it('should give a total of zero for a quote with no line', () => {
    expect(computeQuoteAmounts([], 20).totalAmount).toBe(0);
  });
});

describe('the amounts typed in the main unit of a currency', () => {
  it('should store euros in cents', () => {
    expect(toMinorUnits(12.5, 'EUR')).toBe(1250);
    expect(fromMinorUnits(1250, 'EUR')).toBe(12.5);
  });

  it('should store ariary as whole ariary, with no sub-unit', () => {
    expect(toMinorUnits(40_000, 'MGA')).toBe(40_000);
    expect(fromMinorUnits(40_000, 'MGA')).toBe(40_000);
  });

  it('should not leave a float error in a stored amount', () => {
    // 0.1 + 0.2 typed as 0.3 €
    expect(toMinorUnits(0.1 + 0.2, 'EUR')).toBe(30);
  });
});

describe('the moves a quote may make', () => {
  it('should let a draft be sent, and nothing else', () => {
    expect(getNextQuoteStatuses(QuoteStatusEnum.DRAFT)).toEqual([QuoteStatusEnum.SENT]);
    expect(canChangeQuoteStatus(QuoteStatusEnum.DRAFT, QuoteStatusEnum.ACCEPTED)).toBe(false);
  });

  it('should let a sent quote be accepted, refused or expire', () => {
    expect(canChangeQuoteStatus(QuoteStatusEnum.SENT, QuoteStatusEnum.ACCEPTED)).toBe(true);
    expect(canChangeQuoteStatus(QuoteStatusEnum.SENT, QuoteStatusEnum.REFUSED)).toBe(true);
    expect(canChangeQuoteStatus(QuoteStatusEnum.SENT, QuoteStatusEnum.EXPIRED)).toBe(true);
    expect(canChangeQuoteStatus(QuoteStatusEnum.SENT, QuoteStatusEnum.DRAFT)).toBe(false);
  });

  it('should keep an answered or expired quote where it is', () => {
    [QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED].forEach((status) => {
      expect(getNextQuoteStatuses(status)).toEqual([]);
    });
    expect(canChangeQuoteStatus(QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.SENT)).toBe(false);
  });
});

describe('attaching the proof of an acceptance', () => {
  const CLOUD = 'demo';
  const proof = {
    publicId: 'quotes/acceptance-proofs/k3j2h1',
    url: 'https://res.cloudinary.com/demo/image/upload/v1700000000/quotes/acceptance-proofs/k3j2h1.pdf',
  };

  it('should take a proof only with the move that accepts the quote', () => {
    expect(canAttachQuoteAcceptanceProof(QuoteStatusEnum.SENT, QuoteStatusEnum.ACCEPTED)).toBe(true);
  });

  it('should refuse a proof on any other move, and on a quote already accepted', () => {
    expect(canAttachQuoteAcceptanceProof(QuoteStatusEnum.SENT, QuoteStatusEnum.REFUSED)).toBe(false);
    expect(canAttachQuoteAcceptanceProof(QuoteStatusEnum.SENT, QuoteStatusEnum.EXPIRED)).toBe(false);
    expect(canAttachQuoteAcceptanceProof(QuoteStatusEnum.DRAFT, QuoteStatusEnum.SENT)).toBe(false);
    expect(canAttachQuoteAcceptanceProof(QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.ACCEPTED)).toBe(false);
  });

  it('should accept a PDF or an image stored in the proofs folder of the platform', () => {
    expect(isQuoteAcceptanceProofFile(proof, CLOUD)).toBe(true);
    ['jpg', 'jpeg', 'png', 'webp', 'PDF'].forEach((extension) => {
      expect(isQuoteAcceptanceProofFile({ ...proof, url: proof.url.replace(/pdf$/, extension) }, CLOUD))
        .toBe(true);
    });
  });

  it('should refuse a file of another type', () => {
    expect(isQuoteAcceptanceProofFile({ ...proof, url: proof.url.replace(/pdf$/, 'svg') }, CLOUD)).toBe(false);
    expect(isQuoteAcceptanceProofFile({ ...proof, url: proof.url.replace(/\.pdf$/, '') }, CLOUD)).toBe(false);
  });

  it('should refuse a link to another host, another account or over plain http', () => {
    expect(isQuoteAcceptanceProofFile({ ...proof, url: 'https://evil.example/quotes/acceptance-proofs/k3j2h1.pdf' }, CLOUD))
      .toBe(false);
    expect(isQuoteAcceptanceProofFile({ ...proof, url: proof.url.replace('/demo/', '/other/') }, CLOUD)).toBe(false);
    expect(isQuoteAcceptanceProofFile({ ...proof, url: proof.url.replace('https:', 'http:') }, CLOUD)).toBe(false);
  });

  it('should refuse a file stored outside the proofs folder, or an address naming another file', () => {
    expect(isQuoteAcceptanceProofFile({ ...proof, publicId: 'app/portfolio-cv' }, CLOUD)).toBe(false);
    expect(isQuoteAcceptanceProofFile({ ...proof, publicId: 'quotes/acceptance-proofs/other' }, CLOUD)).toBe(false);
  });

  it('should refuse anything when the account is not configured or the proof is not a file', () => {
    expect(isQuoteAcceptanceProofFile(proof, undefined)).toBe(false);
    expect(isQuoteAcceptanceProofFile(null, CLOUD)).toBe(false);
    expect(isQuoteAcceptanceProofFile({ publicId: proof.publicId, url: 'not a url' }, CLOUD)).toBe(false);
  });
});

describe('revising and amending a quote', () => {
  it('should revise a sent quote only', () => {
    expect(canReviseQuote(QuoteStatusEnum.SENT)).toBe(true);
    [QuoteStatusEnum.DRAFT, QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED]
      .forEach((status) => expect(canReviseQuote(status)).toBe(false));
  });

  it('should never revise an accepted quote, which is amended instead', () => {
    expect(canReviseQuote(QuoteStatusEnum.ACCEPTED)).toBe(false);
    expect(canAmendQuote(QuoteStatusEnum.ACCEPTED)).toBe(true);
  });

  it('should amend an accepted quote only', () => {
    [QuoteStatusEnum.DRAFT, QuoteStatusEnum.SENT, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED]
      .forEach((status) => expect(canAmendQuote(status)).toBe(false));
  });

  it('should read a quote pointing to a sent quote as a revision, to an accepted one as an amendment', () => {
    expect(getQuoteParentRelation(QuoteStatusEnum.SENT)).toBe(QuoteParentRelationEnum.REVISION);
    expect(getQuoteParentRelation(QuoteStatusEnum.ACCEPTED)).toBe(QuoteParentRelationEnum.AMENDMENT);
  });

  it('should keep the validity of a revised quote only while it is still ahead', () => {
    const now = new Date('2026-11-23T10:00:00Z');

    expect(isQuoteValidityAhead(new Date('2026-12-31T00:00:00Z'), now)).toBe(true);
    expect(isQuoteValidityAhead(new Date('2026-11-01T00:00:00Z'), now)).toBe(false);
    expect(isQuoteValidityAhead(undefined, now)).toBe(false);
    expect(isQuoteValidityAhead(null, now)).toBe(false);
  });

  it('should let no quote point to a draft, a refused or an expired quote', () => {
    [QuoteStatusEnum.DRAFT, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED]
      .forEach((status) => expect(getQuoteParentRelation(status)).toBeNull());
  });
});
