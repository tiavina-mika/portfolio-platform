import { QUOTE_PAYMENT_SCHEDULE } from '@shared/domain-constants';
import { PaymentStatusEnum, type PaymentKindEnum } from '@shared/domain-types';

/** one part of the schedule applied to a quote's total: an integer in the smallest unit of its currency */
export type QuotePaymentPart = {
  kind: PaymentKindEnum;
  percent: number;
  amount: number;
};

// what the paid amount of a quote is summed from
type PaymentAmount = {
  status: PaymentStatusEnum;
  amount: number;
};

/*
 * The only moves a payment may make. An unpaid payment gets or loses its due date (`planned` ⇄ `due`),
 * is paid or cancelled. A paid payment is never edited: the only way out is to cancel it, a new payment
 * then taking its place. A cancelled payment stays as it is.
 */
const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatusEnum, PaymentStatusEnum[]> = {
  [PaymentStatusEnum.PLANNED]: [PaymentStatusEnum.DUE, PaymentStatusEnum.PAID, PaymentStatusEnum.CANCELLED],
  [PaymentStatusEnum.DUE]: [PaymentStatusEnum.PLANNED, PaymentStatusEnum.PAID, PaymentStatusEnum.CANCELLED],
  [PaymentStatusEnum.PAID]: [PaymentStatusEnum.CANCELLED],
  [PaymentStatusEnum.CANCELLED]: [],
};

/**
 * The three payments of an accepted quote, in the order of the schedule. Every part but the last is
 * rounded down, and the last takes what is left: the parts always add up to the exact total, and none is
 * ever negative.
 * @param totalAmount the quote's total, an integer in the smallest unit of its currency
 * @example splitQuotePayments(1000) => amounts 300, 400, 300
 * @example splitQuotePayments(1001) => amounts 300, 400, 301
 */
export const splitQuotePayments = (totalAmount: number): QuotePaymentPart[] => {
  let allotted = 0;

  return QUOTE_PAYMENT_SCHEDULE.map(({ kind, percent }, index) => {
    const isLast = index === QUOTE_PAYMENT_SCHEDULE.length - 1;
    const amount = isLast ? totalAmount - allotted : Math.floor((totalAmount * percent) / 100);

    allotted += amount;

    return { kind, percent, amount };
  });
};

/** the statuses a payment can move to from the one it is in */
export const getNextPaymentStatuses = (status: PaymentStatusEnum): PaymentStatusEnum[] => (
  PAYMENT_STATUS_TRANSITIONS[status] ?? []
);

/** whether a payment may move from one status to another */
export const canChangePaymentStatus = (from: PaymentStatusEnum, to: PaymentStatusEnum): boolean => (
  getNextPaymentStatuses(from).includes(to)
);

/** whether a payment still waits for the client's money: it can be dated, paid or cancelled */
export const isPaymentOpen = (status: PaymentStatusEnum): boolean => (
  status === PaymentStatusEnum.PLANNED || status === PaymentStatusEnum.DUE
);

/**
 * The status an unpaid payment takes from its due date: a dated payment is `due`, an undated one
 * `planned`, so "what is due" is always a query on the status.
 */
export const getOpenPaymentStatus = (dueDate: Date | string | null | undefined): PaymentStatusEnum => (
  dueDate ? PaymentStatusEnum.DUE : PaymentStatusEnum.PLANNED
);

/** what the client already paid: the sum of the paid payments only */
export const sumPaidPayments = (payments: PaymentAmount[]): number => (
  payments
    .filter((payment) => payment.status === PaymentStatusEnum.PAID)
    .reduce((sum, payment) => sum + payment.amount, 0)
);

/**
 * What the client still owes on a quote: its total minus what is paid, never below zero.
 * @example computeQuoteRemainingAmount(1000, 300) => 700
 */
export const computeQuoteRemainingAmount = (totalAmount: number, paidAmount: number): number => (
  Math.max(totalAmount - paidAmount, 0)
);
