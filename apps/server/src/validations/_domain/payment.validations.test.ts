import { PAYMENT_REFERENCE_MAX_LENGTH } from '@shared/domain-constants';
import { PaymentMethodEnum, PaymentStatusEnum } from '@shared/domain-types';
import { describe, expect, it } from 'vitest';

import {
  cancelPaymentSchema, getQuotePaymentsSchema, markPaymentAsPaidSchema, paymentDueDateInputSchema,
  paymentPaidInputSchema, setPaymentDueDateSchema,
} from './payment.validations';

describe('recording a payment as paid from the back-office', () => {
  const paid = { id: 'payment1', method: PaymentMethodEnum.TRANSFER };

  it('should accept the method alone, or with a reference and a day', () => {
    expect(markPaymentAsPaidSchema.safeParse(paid).success).toBe(true);
    expect(markPaymentAsPaidSchema.safeParse({
      ...paid, reference: 'VIR-123', paidAt: '2026-11-20T00:00:00.000Z',
    }).success).toBe(true);
  });

  it('should refuse a payment with no method or an unknown one', () => {
    expect(markPaymentAsPaidSchema.safeParse({ id: 'payment1' }).success).toBe(false);
    expect(markPaymentAsPaidSchema.safeParse({ ...paid, method: 'cheque' }).success).toBe(false);
  });

  it('should refuse a reference longer than a payment may hold', () => {
    const reference = 'a'.repeat(PAYMENT_REFERENCE_MAX_LENGTH + 1);

    expect(markPaymentAsPaidSchema.safeParse({ ...paid, reference }).success).toBe(false);
  });

  it('should refuse an amount, a percent or a status sent with it: they are the server\'s', () => {
    expect(markPaymentAsPaidSchema.safeParse({ ...paid, amount: 1 }).success).toBe(false);
    expect(markPaymentAsPaidSchema.safeParse({ ...paid, percent: 100 }).success).toBe(false);
    expect(markPaymentAsPaidSchema.safeParse({ ...paid, status: PaymentStatusEnum.PAID }).success)
      .toBe(false);
  });

  it('should read an empty reference and an empty day as none', () => {
    expect(paymentPaidInputSchema.parse({ ...paid, reference: '  ', paidAt: null }))
      .toEqual({ method: PaymentMethodEnum.TRANSFER, reference: null, paidAt: null });
  });
});

describe('dating a payment', () => {
  it('should accept a day, or none to take the date away', () => {
    expect(setPaymentDueDateSchema.safeParse({ id: 'payment1', dueDate: new Date() }).success).toBe(true);
    expect(setPaymentDueDateSchema.safeParse({ id: 'payment1', dueDate: null }).success).toBe(true);
  });

  it('should read a day sent as an ISO string as a date', () => {
    expect(paymentDueDateInputSchema.parse({ dueDate: '2026-12-01T00:00:00.000Z' }).dueDate)
      .toEqual(new Date('2026-12-01T00:00:00.000Z'));
  });

  it('should refuse an amount sent with it', () => {
    expect(setPaymentDueDateSchema.safeParse({ id: 'payment1', dueDate: null, amount: 10 }).success).toBe(false);
  });
});

describe('reading and correcting the payments of a quote', () => {
  it('should read the payments of the quote named', () => {
    expect(getQuotePaymentsSchema.safeParse({ quote: 'quote1' }).success).toBe(true);
    expect(getQuotePaymentsSchema.safeParse({}).success).toBe(false);
  });

  it('should cancel the payment named, and nothing else', () => {
    expect(cancelPaymentSchema.safeParse({ id: 'payment1' }).success).toBe(true);
    expect(cancelPaymentSchema.safeParse({ id: 'payment1', amount: 10 }).success).toBe(false);
  });
});
