import { PaymentStatusEnum, QuoteStatusEnum } from '@shared/domain-types';

/**
 * Whether a save of a quote is the one that accepted it: only that save writes the payment schedule. A
 * later save of the accepted quote (its paid amount kept up to date, for one) writes nothing.
 */
export const isQuoteJustAccepted = (
  status: QuoteStatusEnum, previousStatus: QuoteStatusEnum | undefined
): boolean => status === QuoteStatusEnum.ACCEPTED && previousStatus !== QuoteStatusEnum.ACCEPTED;

/** whether a payment is recorded as paid on a day still to come: money is recorded once it came in */
export const isPaidInTheFuture = (paidAt: Date | undefined, now: Date): boolean => (
  !!paidAt && paidAt.getTime() > now.getTime()
);

/**
 * Whether a save of a payment changes what the quote was paid: a payment that became paid, or a paid one
 * cancelled. Only then is the quote's paid amount summed again.
 */
export const changesPaidAmount = (
  status: PaymentStatusEnum, previousStatus: PaymentStatusEnum | undefined
): boolean => {
  if (status === previousStatus) return false;

  return status === PaymentStatusEnum.PAID || previousStatus === PaymentStatusEnum.PAID;
};
