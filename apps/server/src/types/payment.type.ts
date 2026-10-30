import { RefundReasonEnum } from '@shared/domain-types';
import {
  CurrencyEnum, PaymentFailureCodeEnum, PaymentStatusEnum, PaymentTypeEnum,
} from '@shared/types';

import type { PaymentService, Phone } from './app.type';

export type PaymentStatus = `${PaymentStatusEnum}`;

export type Currency = `${CurrencyEnum}`;

/**
 * A generic business-domain pointer to attach to a Payment (e.g. a ride, a request,
 * or in another project an order/invoice). `key` is the field name set on the Payment
 * object, `type` is the Parse class name, `id` is the related object's id.
 * Keeps payment.service.cloud.ts free of any ride/request-specific knowledge.
 */
/**
 * What the operator says about one transaction. Mobile money is confirmed by the customer on their
 * own phone, seconds to minutes after the request: PENDING is an answer, not an error.
 */
export enum ProviderPaymentStatusEnum {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

/**
 * How the mock gateway answers, until a real operator is wired up. Anything but SYNC takes the
 * asynchronous path the real operators will use: the payment stays PENDING and the reconciliation
 * job settles it.
 */
export enum PaymentMockModeEnum {
  /** final answer at once, always a success — the behaviour every flow was written against */
  SYNC = 'sync',
  /** PENDING, then a success once the confirmation delay has passed */
  ASYNC = 'async',
  /** PENDING, then a refusal once the confirmation delay has passed */
  ASYNC_DECLINE = 'async_decline',
  /** PENDING for ever: the customer never confirms */
  TIMEOUT = 'timeout'
}

/**
 * What has to happen once a payment reaches its final status — one entry per flow that moves
 * money. Stored on the payment, so the reconciliation job can finish the flow long after the call
 * that started it has returned.
 */
export enum PaymentSettlementKindEnum {
  BOOKING = 'booking',
  REQUEST_REFUND = 'requestRefund',
  RIDE_PAYOUT = 'ridePayout',
  MANUAL_REFUND = 'manualRefund'
}

/** Which path brought a payment to its final status — shown to support, and in the logs */
export enum PaymentSettledByEnum {
  /** the operator answered for good in the call that asked for the payment */
  SYNC = 'sync',
  /** the reconciliation job asked the operator later */
  RECONCILIATION = 'reconciliation',
  /** a retry of a failed payment, from the back-office, the app or the retry job */
  RETRY = 'retry',
  /** the operator confirmed, after the payment had been failed on its deadline */
  LATE_CHECK = 'lateCheck',
  /** nothing to move (a zero amount): recorded for the audit trail, never sent to an operator */
  SYSTEM = 'system'
}

/** A final status, and why when it is a failure */
export type PaymentSettlementOutcome = {
  status: PaymentStatusEnum.SUCCESS | PaymentStatusEnum.FAILED;
  /** the operator's own sentence, kept for support */
  error?: string;
  /** the same refusal as a code, which is what the apps translate for the member */
  errorCode?: PaymentFailureCodeEnum;
};

/**
 * The follow-up stored on a payment. The booking, ride or refunded payment it concerns is read
 * from the payment's own pointers; only what they cannot tell is kept here.
 */
export type PaymentSettlement = {
  kind: PaymentSettlementKindEnum;
  /** REQUEST_REFUND: what the driver is owed once the passenger's refund has gone through */
  driverAmount?: number;
  /** RIDE_PAYOUT: the support operator who released the payout ahead of the deadline */
  releasedById?: string;
  /**
   * RIDE_PAYOUT: the part of the driver's debt kept back from this payout, and what is left of it —
   * fixed when the payout is sent, since the debt may change before the operator confirms it
   */
  penaltyToPay?: number;
  remainingDebt?: number;
  /**
   * RIDE_PAYOUT: the bookings whose held late-cancellation compensation this payout pays, so a
   * later release of the same ride does not pay them again
   */
  indemnityRequestIds?: string[];
  /**
   * A refund: the amount went back into what can still be refunded of the collection, after the
   * refund failed — a retry that goes through has to take it out again
   */
  isRefundAmountReleased?: boolean;
  /**
   * MANUAL_REFUND of a booking still standing: the booking and ride this refund's amount was taken
   * off, so that a refund that never leaves puts it back
   */
  bookingAdjustment?: { requestId: string; rideId: string };
};

export interface IPaymentRelatedEntity {
  key: string;
  type: string;
  id: string;
}

export interface IPaymentInput {
  /**
   * The user who pays the amount
   * @NOTE not defined if the payment is from the app
   */
  payerId?: string;
  /**
   * The user who receives the amount
   * @NOTE not defined if the payment is to the app
   */
  receiverId?: string;
  /**
   * The amount to be paid
   * @required
   */
  amount: number;
  /**
   * Generic business-domain pointers to attach to the payment
   * (e.g. [{ key: 'ride', type: 'Ride', id }, { key: 'request', type: 'Request', id }])
   */
  relatedEntities?: IPaymentRelatedEntity[];
  /**
   * Names the one money movement this payment is (`collect:<requestId>`, `payout:<rideId>`): a
   * second payment asking for the same key is answered with the first one instead of being sent
   * again. Left out for the movements that may legitimately happen several times (partial refunds).
   */
  idempotencyKey?: string;
  /**
   * ISO 4217 code the amount is in: the currency of the ride the money belongs to
   * @default the default country's currency
   */
  currency?: string;
  /** ISO 3166-1 alpha-2 code of the country the money belongs to: the country of its ride */
  country?: string;
  /**
   * The payment status
   * @default PENDING
   */
  status?: PaymentStatus;
  /**
   * The payment type
   * passenger to driver or driver to passenger payment
   * both does not pay directly to the app
   * the payment pass through the app
   * paymentType is used to determine the payment direction
   * passenger to app or app to driver or driver to app or app to passenger
   * @required
   */
  paymentType: PaymentTypeEnum;
  /**
   * The payment description
   * @required
   */
  description: string;
  /**
   * The source of the payment (phone number)
   * @required
   */
  source: Phone;
  /**
   * The destination of the payment (phone number)
   * @required
   */
  destination: Phone;
  /**
   * Platform commission amount retained on this payment (e.g. an APP_TO_DRIVER payout) —
   * persisted at creation time instead of recomputed later from the driver's rate.
   */
  commission?: number;
  /**
   * Tier commission rate (%) `commission` was computed from, before any surcharge
   */
  commissionRate?: number;
  /**
   * What the driver's cancellation rate multiplied the tier commission by (1 when none).
   *
   * Stored next to the rate because the two together are the only way to read the amount: a
   * payout showing "9 100 Ar (13 %)" of a 50 000 Ar fare looks like an arithmetic error until you
   * know the 13 % was multiplied by 1,4 — and support is asked to explain exactly that.
   */
  commissionMultiplier?: number;
  /**
   * On a refund: why the money is going back, so the history can word the row from the real cause
   * instead of assuming the passenger cancelled.
   */
  refundReason?: RefundReasonEnum;
  /** What to run once the payment is final, when that happens after this call has returned */
  settlement?: PaymentSettlement;
}

export interface IDriverPassengerPaymentOutput {
  success: boolean;
  /**
   * The operator has not answered yet: neither a success nor a failure. The reconciliation job
   * settles the payment later and runs its follow-up then.
   */
  isPending?: boolean;
  error?: string;
  payment: Parse.Object;
  paymentIntentId?: string;
  // only used for driver payment when penalty is applied and the penalty amount is greater than the payout amount
  remainingDebt?: number;
  // only used for driver payment when penalty is applied
  penaltyToPay?: number;
  /** ride payout: the bookings whose held late-cancellation compensation it paid */
  indemnityRequestIds?: string[];
  /**
   * ride payout: it was sent again on the row that had failed, and the retry's own follow-up has
   * already closed the ride — so the caller must not close it a second time
   */
  isSettledByFollowUp?: boolean;
}

export type PaymentProcessInput = {
  /** the merchant's own reference of the payment, so the operator can be asked about it later */
  reference?: string;
  amount: number;
  currency?: string;
  source: Phone;
  destination: Phone;
  description: string;
  paymentType?: PaymentTypeEnum;
};

export type PaymentOutput = {
  status: ProviderPaymentStatusEnum;
  error?: string;
  /** the refusal as a code the apps can translate — `error` above is the operator's own sentence */
  errorCode?: PaymentFailureCodeEnum;
  id?: string;
  amount?: number;
  currency?: string;
  description?: string;
  service?: PaymentService | 'unknown';
} & Partial<Pick<PaymentProcessInput, 'paymentType' | 'source' | 'destination'>>;
