import { QUOTE_PAYMENT_SCHEDULE } from '@shared/domain-constants';
import { PaymentKindEnum, PaymentStatusEnum, QuoteStatusEnum } from '@shared/domain-types';
import {
  canChangePaymentStatus, computeQuoteRemainingAmount, getNextPaymentStatuses, getOpenPaymentStatus,
  isPaymentOpen, splitQuotePayments, sumPaidPayments,
} from '@shared/domain-utils';
import { describe, expect, it } from 'vitest';

import { changesPaidAmount, isPaidInTheFuture, isQuoteJustAccepted } from './payment.utils';

const sumAmounts = (parts: { amount: number }[]): number => parts.reduce((sum, part) => sum + part.amount, 0);

/*
 * The quote trigger writes the payments of an accepted quote with the split below, and the payment trigger
 * checks every save with the shared moves: they are tested here, with the server's own rules.
 */
describe('splitting an accepted quote into its three payments', () => {
  it('should follow the 30 / 40 / 30 schedule, deposit first', () => {
    expect(splitQuotePayments(100_000)).toEqual([
      { kind: PaymentKindEnum.DEPOSIT, percent: 30, amount: 30_000 },
      { kind: PaymentKindEnum.MILESTONE, percent: 40, amount: 40_000 },
      { kind: PaymentKindEnum.BALANCE, percent: 30, amount: 30_000 },
    ]);
  });

  it('should have a schedule that adds up to 100 %', () => {
    expect(QUOTE_PAYMENT_SCHEDULE.reduce((sum, part) => sum + part.percent, 0)).toBe(100);
  });

  it('should let the balance absorb the rounding, so the three add up to the exact total', () => {
    const parts = splitQuotePayments(1001);

    expect(parts.map((part) => part.amount)).toEqual([300, 400, 301]);
    expect(sumAmounts(parts)).toBe(1001);
  });

  it('should add up to the total and never go negative, whatever the total', () => {
    [0, 1, 2, 3, 7, 99, 12_345, 999_999_999].forEach((total) => {
      const parts = splitQuotePayments(total);

      expect(sumAmounts(parts)).toBe(total);
      parts.forEach((part) => {
        expect(Number.isInteger(part.amount)).toBe(true);
        expect(part.amount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('should split a quote of nothing into three payments of nothing', () => {
    expect(splitQuotePayments(0).map((part) => part.amount)).toEqual([0, 0, 0]);
  });
});

describe('when a quote gets its payments', () => {
  it('should write them on the save that accepts the quote', () => {
    expect(isQuoteJustAccepted(QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.SENT)).toBe(true);
  });

  it('should write nothing on a later save of the accepted quote', () => {
    expect(isQuoteJustAccepted(QuoteStatusEnum.ACCEPTED, QuoteStatusEnum.ACCEPTED)).toBe(false);
  });

  it('should write nothing for a quote that is not accepted', () => {
    [QuoteStatusEnum.DRAFT, QuoteStatusEnum.SENT, QuoteStatusEnum.REFUSED, QuoteStatusEnum.EXPIRED]
      .forEach((status) => expect(isQuoteJustAccepted(status, QuoteStatusEnum.SENT)).toBe(false));
    expect(isQuoteJustAccepted(QuoteStatusEnum.DRAFT, undefined)).toBe(false);
  });
});

describe('moving a payment through its statuses', () => {
  it('should let an unpaid payment be dated, paid or cancelled', () => {
    expect(getNextPaymentStatuses(PaymentStatusEnum.PLANNED))
      .toEqual([PaymentStatusEnum.DUE, PaymentStatusEnum.PAID, PaymentStatusEnum.CANCELLED]);
    expect(canChangePaymentStatus(PaymentStatusEnum.DUE, PaymentStatusEnum.PAID)).toBe(true);
    expect(canChangePaymentStatus(PaymentStatusEnum.DUE, PaymentStatusEnum.PLANNED)).toBe(true);
  });

  it('should only let a paid payment be cancelled, never brought back to unpaid', () => {
    expect(getNextPaymentStatuses(PaymentStatusEnum.PAID)).toEqual([PaymentStatusEnum.CANCELLED]);
    expect(canChangePaymentStatus(PaymentStatusEnum.PAID, PaymentStatusEnum.DUE)).toBe(false);
  });

  it('should keep a cancelled payment where it is', () => {
    expect(getNextPaymentStatuses(PaymentStatusEnum.CANCELLED)).toEqual([]);
  });

  it('should tell an unpaid payment from a paid or cancelled one', () => {
    expect(isPaymentOpen(PaymentStatusEnum.PLANNED)).toBe(true);
    expect(isPaymentOpen(PaymentStatusEnum.DUE)).toBe(true);
    expect(isPaymentOpen(PaymentStatusEnum.PAID)).toBe(false);
    expect(isPaymentOpen(PaymentStatusEnum.CANCELLED)).toBe(false);
  });

  it('should make a dated payment due and an undated one planned', () => {
    expect(getOpenPaymentStatus(new Date('2026-12-01'))).toBe(PaymentStatusEnum.DUE);
    expect(getOpenPaymentStatus(null)).toBe(PaymentStatusEnum.PLANNED);
  });
});

describe('the paid amount and what is left to pay on a quote', () => {
  const payments = [
    { status: PaymentStatusEnum.PAID, amount: 300 },
    { status: PaymentStatusEnum.CANCELLED, amount: 400 },
    { status: PaymentStatusEnum.PAID, amount: 400 },
    { status: PaymentStatusEnum.DUE, amount: 300 },
  ];

  it('should sum the paid payments only, never a cancelled or unpaid one', () => {
    expect(sumPaidPayments(payments)).toBe(700);
    expect(sumPaidPayments([])).toBe(0);
  });

  it('should leave the total minus what is paid', () => {
    expect(computeQuoteRemainingAmount(1000, 700)).toBe(300);
    expect(computeQuoteRemainingAmount(1000, 1000)).toBe(0);
  });

  it('should sum again only when a payment becomes paid or a paid one is cancelled', () => {
    expect(changesPaidAmount(PaymentStatusEnum.PAID, PaymentStatusEnum.DUE)).toBe(true);
    expect(changesPaidAmount(PaymentStatusEnum.CANCELLED, PaymentStatusEnum.PAID)).toBe(true);
    expect(changesPaidAmount(PaymentStatusEnum.DUE, PaymentStatusEnum.PLANNED)).toBe(false);
    expect(changesPaidAmount(PaymentStatusEnum.CANCELLED, PaymentStatusEnum.DUE)).toBe(false);
    // a new payment is never paid: its creation changes nothing
    expect(changesPaidAmount(PaymentStatusEnum.PLANNED, undefined)).toBe(false);
  });
});

describe('the day a payment is recorded as paid', () => {
  const now = new Date('2026-11-23T10:00:00.000Z');

  it('should accept today or a past day, and no day at all (today is then set)', () => {
    expect(isPaidInTheFuture(new Date('2026-11-23T00:00:00.000Z'), now)).toBe(false);
    expect(isPaidInTheFuture(new Date('2026-10-01'), now)).toBe(false);
    expect(isPaidInTheFuture(undefined, now)).toBe(false);
  });

  it('should refuse a day still to come', () => {
    expect(isPaidInTheFuture(new Date('2026-11-24T00:00:00.000Z'), now)).toBe(true);
  });
});
