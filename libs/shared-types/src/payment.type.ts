import type { DateType } from './date.type';

export enum PaymentTypeEnum {
  /**
   * When the passenger books a ride
   * sender: passenger, receiver: app
   */
  PASSENGER_TO_APP = 'passenger_to_app',
  /**
   * When the driver marks the ride as completed and the app pays the driver
   * sender: app, receiver: driver
   */
  APP_TO_DRIVER = 'app_to_driver',
  /**
   * Not used for now, since the driver receives payment after the ride is completed
   */
  DRIVER_TO_APP = 'driver_to_app',
  /**
   * When the app refunds the passenger
   * sender: app, receiver: passenger
   * * When the driver cancels the ride (request.CANCELLED_BY_DRIVER) and the app refunds the passenger
   * * When the passenger cancels the ride (request.CANCELLED_BY_PASSENGER + penalty) and the app refunds the passenger
   */
  APP_TO_PASSENGER = 'app_to_passenger'
}

export enum PaymentStatusEnum {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

/**
 * Why a payment failed, as a code the apps can translate.
 *
 * `failureReason` keeps the operator's own sentence, which is written by whoever built the gateway,
 * in whatever language they chose, for whoever reads a log — and it was shown to passengers as is.
 * The code is what the member reads, in their language; the sentence stays, for support.
 *
 * Stable across operators on purpose: a real operator's refusal maps onto one of these, so the copy
 * the apps carry does not have to be rewritten the day the gateway changes.
 */
export enum PaymentFailureCodeEnum {
  /** the customer refused, or let the confirmation lapse on their phone */
  DECLINED_BY_CUSTOMER = 'declined_by_customer',
  /** nothing came back before the payment's own deadline */
  CONFIRMATION_TIMEOUT = 'confirmation_timeout',
  /** the operator never answered: support has to read its statement before anything else */
  OUTCOME_UNKNOWN = 'outcome_unknown',
  /** the operator moved another amount than the one asked for */
  AMOUNT_MISMATCH = 'amount_mismatch',
  /** the number belongs to no mobile money service the platform can route to */
  UNKNOWN_SERVICE = 'unknown_service',
  /** anything the gateway reported that maps to none of the above */
  UNKNOWN = 'unknown'
}

export type PaymentFailureCode = `${PaymentFailureCodeEnum}`;

export enum CurrencyEnum {
  MGA = 'MGA'
}

export enum PaymentServiceEnum {
  YAS = 'mvola',
  ORANGE = 'orange-money',
  AIRTEL = 'airtel-money'
}

export type PaymentType = `${PaymentTypeEnum}`;
export type PaymentStatus = `${PaymentStatusEnum}`;
export type Currency = `${CurrencyEnum}`;
export type PaymentService = `${PaymentServiceEnum}`;

export interface IPaymentAttributesBase {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  paymentIntentId?: string;
  /** the operator's own sentence, kept for support — never what a member is shown */
  failureReason?: string;
  /** what the member is shown, translated by each app from `PaymentFailureCodeEnum` */
  failureCode?: PaymentFailureCode;
  /**
   * On a refund: why the money went back. Stored on the refund itself rather than read off the
   * booking, because the booking's reason is written in the same operation that creates the refund
   * — and because a history row has to say "the driver refused you" rather than the one wording
   * every refund used to carry, "the ride you cancelled".
   *
   * Typed as a plain string here: the values are `RefundReasonEnum`, which belongs to the ride
   * domain, and this interface is read by apps that know nothing of it.
   */
  refundReason?: string;
  description?: string;
  service?: PaymentService;
  currency?: Currency;
  /**
   * Platform commission amount retained on this payment — only set on `APP_TO_DRIVER` payouts,
   * where the commission is deducted before paying the driver. Persisted at creation time so
   * net-revenue reporting doesn't need to recompute it from the driver's rate at read time (a
   * rate that can change after the fact).
   */
  commission?: number;
  /** Commission rate (%) used to compute `commission`, based on the driver's tier at payout time. */
  commissionRate?: number;
  /**
   * How much of this payment has already been given back, on a `PASSENGER_TO_APP` collection that
   * the back-office has refunded. Held on the collection itself rather than summed from the refunds
   * pointing at it, because it is what the "can this be refunded" guard reads *and* writes: the
   * database can only refuse a refund that would overshoot if both live in the same document.
   */
  refundedAmount?: number;
  /**
   * How many times the payment was sent to the gateway again after its first attempt — manual
   * relaunches and the automatic ones alike. A retry rewrites the same row, so without it the
   * number of attempts would be lost. Absent on payments never retried, and on the ones retried
   * before it existed.
   */
  retryCount?: number;
  /** When the last retry was sent — `retriedBy` names who asked for it, absent for an automatic one. */
  retriedAt?: DateType;
  /**
   * The operator's own transaction reference, known from its first answer — before the payment
   * succeeds, unlike `paymentIntentId`. What a status check or a webhook is matched on.
   */
  providerReference?: string;
  /** When a payment its operator never confirmed is failed for good */
  expiresAt?: DateType;
  /** How many times the reconciliation job has asked the operator about this payment */
  checkCount?: number;
  /** Which path brought the payment to its final status: sync, reconciliation or retry */
  settledBy?: string;
}
