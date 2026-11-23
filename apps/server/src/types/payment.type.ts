import type { PaymentKindEnum, PaymentMethodEnum, PaymentStatusEnum } from '@shared/domain-types';

/**
 * The stored fields of an Aldaron `Payment`: one part of an accepted quote's schedule. The amount is an
 * integer in the smallest unit of the quote's currency: a payment has no currency of its own.
 */
export interface IPaymentAttributes {
  quote: Parse.Object;
  // the client of the quote, set by the server from it
  client: Parse.Object;
  kind: PaymentKindEnum;
  // taken from the schedule
  percent: number;
  amount: number;
  status: PaymentStatusEnum;
  dueDate?: Date;
  // set when the payment is paid, today unless another day is typed
  paidAt?: Date;
  method?: PaymentMethodEnum;
  // the transfer reference, if any
  reference?: string;
  createdBy?: Parse.User;
  updatedBy?: Parse.User;
}

/** what the back-office records when the client paid */
export type PaymentPaidInput = {
  method: PaymentMethodEnum;
  reference: string | null;
  paidAt: Date | null;
};
