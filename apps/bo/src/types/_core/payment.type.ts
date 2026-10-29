

import {
  Currency, IPaymentAttributesBase, PaymentService, PaymentStatus, PaymentType,
} from '@shared/types';
import { z } from 'zod';

import type { IEntityState } from '@/redux/factories/_core/entitySlice.factory';
import type { IPhone, IUser } from '@/types/_core/user.type';
import type { DateType, IUserDefaultRecord } from '@/types/_core/utils.type';

import { paymentFilterSchema } from '@/validations/_core/payment.validations';

export type {
  Currency, PaymentService, PaymentStatus, PaymentType,
};

export type PaymentSnapshot = {
  // domain-specific entities are stored as open records — each business domain registers its own shape
  entities?: Record<string, { id: string; date?: DateType; [key: string]: unknown }>;
  payer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export interface IPaymentAttributes extends IPaymentAttributesBase, IUserDefaultRecord {
  createdBy?: IUser;
  payer?: IUser;
  receiver?: IUser;
  snapshot?: PaymentSnapshot;
  source: IPhone;
  destination: IPhone;
  /**
   * The collection this payment gives back, when it is a refund. Arrives as a bare pointer (there
   * is nothing to read on it but the id), so it is `objectId` and never `id`.
   */
  refundOf?: { objectId?: string };
  // when each status was reached, and by whom — included on the detail read, for its history
  successAt?: DateType;
  failedAt?: DateType;
  pendingAt?: DateType;
  successBy?: IUser;
  failedBy?: IUser;
  pendingBy?: IUser;
  // who asked for the last retry — absent for an automatic one
  retriedBy?: IUser;
  /**
   * Why an operator moved this money by hand: the reason typed before sending a failed payment
   * again, or before giving a collection back. Required on both, and the only record of the
   * decision — the amounts alone never say whether a refund settled a complaint or a mistake.
   */
  manualReason?: string;
  /**
   * What the driver's cancellation rate multiplied the tier commission by (1 when none). Shown
   * next to the rate: a payout reading "9 100 Ar (13 %)" of a 70 000 Ar fare looks like an
   * arithmetic error until you know the 13 % was multiplied by 1,4.
   */
  commissionMultiplier?: number;

}
export type IPayment = IPaymentAttributes;

/** How one mobile money operator is behaving across the whole ledger. */
export interface IPaymentServiceHealth {
  service: PaymentService;
  total: number;
  success: number;
  pending: number;
  failed: number;
  /** what actually settled through this operator — both directions, hence "succeeded", not "collected" */
  successAmount: number;
}

/**
 * The figures the payments list states above its rows. Loaded apart from the page of results, so
 * they describe the whole ledger and stay put while the rows under them are narrowed.
 */
export interface IPaymentLedgerSummary {
  /** ISO 4217 code every amount of the summary is in */
  currency?: string;
  total: number;
  /** what was paid in, less the payouts and refunds paid back out — settled payments only */
  netAmount: number;
  failedAmount: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byService: IPaymentServiceHealth[];
  /** the failure messages the gateway actually produced, which is what the filter offers */
  failureReasons: string[];
}

/**
 * A booking whose passenger was charged and that stayed PENDING, as the "to settle" band lists it.
 * Read straight off the Cloud Function, so ids are `objectId` and never `id`.
 */
export interface IChargedPendingBooking {
  objectId: string;
  createdAt: DateType;
  seats: number;
  passenger?: IUser;
  /** the collection that was settled for it */
  payment?: { objectId: string; amount: number; currency?: string; service?: PaymentService };
}

export type ChargedPendingDecision = 'confirm' | 'refund';

export type IPaymentState = IEntityState<IPayment>;

export type PaymentFiltersInput = z.infer<typeof paymentFilterSchema>;
