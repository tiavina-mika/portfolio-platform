import type { PaymentStatus, PaymentType } from '@shared/types';

/** Which end of the passenger → platform → driver chain the payment being read sits at. */
export type PaymentCycleAnchor = 'collection' | 'payout' | 'refund';

export interface IPaymentCyclePerson {
  id: string;
  firstName?: string;
  lastName?: string;
}

/** One movement of money of the chain, reduced to what the back-office states about it. */
export interface IPaymentCycleEntry {
  id: string;
  paymentIntentId?: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  // when it settled, or when it was created while it has not
  date: Date;
  refundedAmount?: number;
  // set while the operator has not answered: when the payment is failed for good if it stays silent
  expiresAt?: Date;
  payer?: IPaymentCyclePerson;
}

/**
 * Where the money of one booking stands, from the passenger's payment to the driver's payout. The
 * payout is made once per ride, for every booking of it, so a booking's own share of the commission
 * and of the payout is worked out here rather than read from a field.
 */
export interface IPaymentCycle {
  anchor: PaymentCycleAnchor;
  ride: {
    id: string;
    date?: Date;
    status?: string;
    departure?: string;
    destination?: string;
    totalPrice: number;
    driver?: IPaymentCyclePerson;
  };
  // absent when the payment read is the ride's payout
  request?: {
    id: string;
    seats?: number;
    totalPrice: number;
    passenger?: IPaymentCyclePerson;
  };
  // the passenger's payment of that booking
  collection?: IPaymentCycleEntry;
  // every passenger payment of the ride
  collections: IPaymentCycleEntry[];
  payout?: IPaymentCycleEntry;
  // the refunds of `collection`
  refunds: IPaymentCycleEntry[];
  commission: {
    amount: number;
    rate?: number;
    // computed from the ride as it stands today: the ride is not closed, so it can still change
    isProvisional: boolean;
  };
  payoutAmount: number;
  // the booking's own part of the commission and of the payout
  requestShare?: {
    commission: number;
    payout: number;
  };
}
