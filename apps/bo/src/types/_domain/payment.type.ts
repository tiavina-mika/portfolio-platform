import type { PaymentKindEnum, PaymentMethodEnum, PaymentStatusEnum } from '@shared/domain-types';

/**
 * One payment of an accepted quote, as the payments dialog reads it. The amount is in the smallest unit of
 * the quote's currency: a payment has none of its own.
 */
export interface IPayment {
  id: string;
  // the id of the quote it belongs to
  quoteId: string;
  kind: PaymentKindEnum;
  percent: number;
  amount: number;
  status: PaymentStatusEnum;
  dueDate?: string;
  paidAt?: string;
  method?: PaymentMethodEnum;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

/** what the "Mark as paid" form holds and sends */
export interface IPaymentPaidInput {
  method: PaymentMethodEnum;
  reference: string | null;
  paidAt: Date | null;
}

export interface IPaymentState {
  // the payments of the quote whose dialog is open
  payments: IPayment[];
}
