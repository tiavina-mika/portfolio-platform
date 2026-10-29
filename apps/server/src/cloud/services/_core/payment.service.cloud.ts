import { DEFAULT_COUNTRY_CODE } from '@shared/constants';
import { RefundReasonEnum } from '@shared/domain-types';
import { PaymentFailureCodeEnum, PaymentStatusEnum, PaymentTypeEnum } from '@shared/types';
import dayjs from 'dayjs';

import { getPaymentStatusAPI, processPaymentAPI } from '@/api/_core/payment.api';
import {
  collections, DEFAULT_CURRENCY, ERRORS, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  PAYMENT_RECONCILIATION_DELAYS_MINUTES, PENDING_PAYMENT_TIMEOUT_MINUTES,
} from '@/constants/_core/payment.constants';
import {
  type IDriverPassengerPaymentOutput,
  type IPaymentInput,
  type PaymentSettlement,
  type PaymentSettlementOutcome,
  PaymentSettlementKindEnum,
  PaymentSettledByEnum,
  ProviderPaymentStatusEnum,
} from '@/types/payment.type';
import { logger } from '@/utils/_core/logger';
import { paymentInputSchema } from '@/validations/_core/payment.validations';

import {
  adjustStandingBookingFare, getDriverPayoutForRide, getStandingBookingOfCollection, isBookingClosed,
} from './payment-booking.service.cloud';
import {
  claimPaymentSettlement, finishPaymentSettlement, registerPaymentSettlementHandler, releasePaymentSettlement,
  settlePayment,
} from './payment-settlement.service.cloud';
import { Payment } from '../../triggers/_core/payment.triggers';
import { getMongoCollection } from '../../utils/_core/db.utils.cloud';
import { convertIdToPointer, createQuery } from '../../utils/_core/parse.utils.cloud';
import {
  getPaymentIncludesForDirtyKeys, getPaymentRelatedFieldKeys,
} from '../../utils/_core/payment-fields.utils.cloud';
import { setPaymentSnapshot } from '../../utils/_core/snapshot.utils.cloud';

export const getPaymentById = async (
  paymentId: string,
  include: string[] = []
): Promise<Parse.Object | undefined> => {
  const payment = await createQuery(collections.Payment, {
    include,
    filters: [{ key: 'objectId', value: paymentId }],
  })
    .first(USE_MASTER_KEY);

  return payment;
};

export const getPaymentByPaymentIntentId = async (
  paymentIntentId: string
): Promise<Parse.Object | undefined> => {
  const payment = await createQuery(collections.Payment, {
    filters: [{ key: 'paymentIntentId', value: paymentIntentId }],
  })
    .first(USE_MASTER_KEY);

  return payment;
};

const getPaymentByProviderReference = async (
  providerReference: string
): Promise<Parse.Object | undefined> => {
  const payment = await createQuery(collections.Payment, {
    filters: [{ key: 'providerReference', value: providerReference }],
  })
    .first(USE_MASTER_KEY);

  return payment;
};

export const getPaymentByIdempotencyKey = async (
  idempotencyKey: string
): Promise<Parse.Object | undefined> => {
  const payment = await createQuery(collections.Payment, {
    filters: [{ key: 'idempotencyKey', value: idempotencyKey }],
  })
    .first(USE_MASTER_KEY);

  return payment;
};

/** Reads a payment already recorded as the answer a caller would have got from sending it */
const toPaymentOutput = (payment: Parse.Object): IDriverPassengerPaymentOutput => {
  const status = payment.get('status');

  if (status === PaymentStatusEnum.PENDING) {
    return { success: false, isPending: true, payment };
  }

  return {
    success: status === PaymentStatusEnum.SUCCESS,
    paymentIntentId: payment.get('paymentIntentId'),
    error: status === PaymentStatusEnum.FAILED ? payment.get('failureReason') : undefined,
    payment,
  };
};

/**
 * A `Payment.save()` rejected with this code means the DB-level unique index on
 * `paymentIntentId` (see db-indexes.ts) caught a gateway transaction id that is already
 * recorded on another Payment row — i.e. this exact transaction was already processed
 * (concurrent duplicate call, replayed webhook once real providers are wired up).
 */
const isDuplicateValueError = (error: unknown): boolean =>
  (error as Parse.Error)?.code === Parse.Error.DUPLICATE_VALUE;

const isDuplicatePaymentIntentIdError = isDuplicateValueError;

/**
 * Refuses a payment that could never be sent (a missing or malformed number, an invalid amount),
 * before anything is recorded or asked of the operator. Exposed for the flows sending a batch of
 * payments, which check every one of them before sending the first.
 */
export const assertPaymentInput = (input: IPaymentInput): void => {
  if (!input.source) {
    throw new Error(ERRORS.PAYER_PHONE_NOT_FOUND);
  }

  if (!input.destination) {
    throw new Error(ERRORS.RECEIVER_PHONE_NOT_FOUND);
  }

  const validation = paymentInputSchema.safeParse(input);

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || ERRORS.PAYMENT_FAILED);
  }
};

/**
 * Records the answer the operator gave within the call that asked for the payment. The flow that
 * asked carries on from there itself, so the payment is marked settled at once.
 */
const recordSyncPaymentOutcome = async (
  payment: Parse.Object,
  outcome: PaymentSettlementOutcome
): Promise<IDriverPassengerPaymentOutput> => {
  /*
   * an operator slower to answer than the payment's deadline leaves the reconciliation job time to
   * fail it first: what that job decided stands
   */
  if (!await claimPaymentSettlement(payment.id, { status: PaymentStatusEnum.PENDING })) {
    const settledPayment = await getPaymentById(payment.id);

    logger.warn('Payment already settled by another path', {
      paymentId: payment.id, status: settledPayment?.get('status'),
    });

    return {
      success: settledPayment?.get('status') === PaymentStatusEnum.SUCCESS,
      error: settledPayment?.get('failureReason'),
      payment: settledPayment ?? payment,
    };
  }

  const isSuccess = outcome.status === PaymentStatusEnum.SUCCESS;

  payment.set('status', outcome.status);
  payment.set('settledBy', PaymentSettledByEnum.SYNC);
  payment.set('settledAt', new Date());
  payment.unset('nextCheckAt');

  if (isSuccess) {
    payment.set('paymentIntentId', payment.get('providerReference'));
  }
  else {
    payment.set('failureReason', outcome.error); // Store the failure reason for debugging
    // what the member reads: the sentence above is the operator's, in whatever language it chose
    payment.set('failureCode', outcome.errorCode ?? PaymentFailureCodeEnum.UNKNOWN);
  }

  try {
    const savedPayment = await payment.save(null, USE_MASTER_KEY);

    return {
      success: isSuccess,
      error: outcome.error,
      paymentIntentId: savedPayment.get('paymentIntentId'), // Return to the frontend for card confirmation
      payment: savedPayment,
    };
  }
  catch (saveError) {
    if (!isDuplicatePaymentIntentIdError(saveError)) {
      throw saveError;
    }

    /*
     * Idempotent replay: this gateway transaction was already recorded — surface the existing
     * Payment as a success, and drop the row this call recorded before asking the operator.
     */
    const reference: string = payment.get('providerReference');

    logger.info('Idempotent payment replay detected — reusing existing payment', { paymentIntentId: reference });

    const existingPayment = await getPaymentByPaymentIntentId(reference);

    await payment.destroy(USE_MASTER_KEY);

    return {
      success: true,
      paymentIntentId: reference,
      payment: existingPayment || payment,
    };
  }
  finally {
    await releasePaymentSettlement(payment.id);
  }
};

/**
 * passenger to driver or driver to passenger payment
 * both does not pay directly to the app
 * the payment pass through the app
 * paymentType is used to determine the payment direction
 * @returns
 */
export const processAndCreatePayment = async ({
  payerId,
  receiverId,
  relatedEntities = [],
  amount,
  paymentType,
  description,
  source,
  destination,
  commission,
  commissionRate,
  commissionMultiplier,
  refundReason,
  settlement,
  idempotencyKey,
  currency = DEFAULT_CURRENCY,
  country = DEFAULT_COUNTRY_CODE,
}: IPaymentInput): Promise<IDriverPassengerPaymentOutput | void> => {
  assertPaymentInput({
    payerId, receiverId, relatedEntities, amount, paymentType, description, source, destination,
    commission, commissionRate,
  });

  if (idempotencyKey) {
    const existingPayment = await getPaymentByIdempotencyKey(idempotencyKey);

    // the same money movement asked for twice: answer with the first one instead of sending it again
    if (existingPayment) {
      logger.warn('Payment already recorded for this idempotency key', { idempotencyKey });
      return toPaymentOutput(existingPayment);
    }
  }

  const payment = new Payment();
  // past this, a payment its operator has not confirmed is failed by the reconciliation job
  const expiresAt = dayjs().add(PENDING_PAYMENT_TIMEOUT_MINUTES, 'minute').toDate();

  payment.set('type', paymentType);
  payment.set('status', PaymentStatusEnum.PENDING);
  payment.set('amount', amount);
  payment.set('currency', currency);
  payment.set('country', country);
  payment.set('source', source);
  payment.set('destination', destination);
  payment.set('expiresAt', expiresAt);
  /*
   * checked at its deadline even if the operator's answer never comes back: without it, a payment
   * recorded just before the server stopped would stay PENDING for ever
   */
  payment.set('nextCheckAt', expiresAt);

  if (settlement) {
    payment.set('settlement', settlement);
  }
  if (idempotencyKey) {
    payment.set('idempotencyKey', idempotencyKey);
  }

  // only set on payments where a commission was actually computed (e.g. APP_TO_DRIVER payouts)
  if (commission !== undefined) {
    payment.set('commission', commission);
  }
  if (commissionRate !== undefined) {
    payment.set('commissionRate', commissionRate);
  }
  if (commissionMultiplier !== undefined) {
    payment.set('commissionMultiplier', commissionMultiplier);
  }
  // why the money is going back, so the history can word the row from the real cause
  if (refundReason) {
    payment.set('refundReason', refundReason);
  }

  const pointerFields = [
    { key: 'payer', value: payerId, type: '_User' },
    { key: 'receiver', value: receiverId, type: '_User' },
    ...relatedEntities.map(({ key, type, id }) => ({ key, value: id, type })),
  ];

  pointerFields.forEach(({ key, value, type }) => {
    if (value) {
      payment.set(key, convertIdToPointer(type, value));
    }
  });

  /*
   * recorded before the operator is called, not after: if the call never comes back, this row is
   * the only trace that money may have moved, for support and for the reconciliation job
   */
  // nothing to move: recorded for the audit trail, never sent to an operator that would refuse it
  if (amount === 0) {
    payment.set('status', PaymentStatusEnum.SUCCESS);
    payment.set('settledBy', PaymentSettledByEnum.SYSTEM);
    payment.set('settledAt', new Date());
    payment.unset('nextCheckAt');

    return { success: true, payment: await payment.save(null, USE_MASTER_KEY) };
  }

  try {
    await payment.save(null, USE_MASTER_KEY);
  }
  catch (saveError) {
    if (!idempotencyKey || !isDuplicateValueError(saveError)) throw saveError;

    // a concurrent call recorded the same movement between the check above and this write
    const racedPayment = await getPaymentByIdempotencyKey(idempotencyKey);

    if (!racedPayment) throw saveError;
    return toPaymentOutput(racedPayment);
  }

  /*
   * the gateway's refusal as a code, kept across the throw below: the Error carries only the
   * operator's own sentence, and that sentence is not what a member can be shown
   */
  let failureCode: PaymentFailureCodeEnum | undefined;
  let paymentResponse: Awaited<ReturnType<typeof processPaymentAPI>>;

  /*
   * Phase 1 — talking to the operator. Only a failure here may end the payment as FAILED: nothing
   * is known to have moved.
   */
  try {
    paymentResponse = await processPaymentAPI({
      amount,
      currency,
      description,
      source,
      destination,
      reference: payment.id,
    });

    if (paymentResponse.status === ProviderPaymentStatusEnum.FAILED) {
      failureCode = paymentResponse.errorCode;
      throw new Error(paymentResponse.error || 'Payment failed');
    }
  }
  catch (error) {
    logger.error('processDriverPassengerPaymentTransaction payment failed', { error: (error as Error).stack });

    const result = await recordSyncPaymentOutcome(payment, {
      status: PaymentStatusEnum.FAILED,
      error: (error as Error).message,
      errorCode: failureCode,
    });

    return {
      ...result,
      error: `processDriverPassengerPaymentTransaction payment failed: ${(error as Error).message}`,
    };
  }

  /*
   * Phase 2 — recording what the operator answered. From here it has the money or is about to: this
   * payment can no longer be marked FAILED by us. The reference is written first, so that whatever
   * goes wrong next, the reconciliation job can ask the operator about this very transaction.
   */
  payment.set('providerReference', paymentResponse.id);
  payment.set('service', paymentResponse.service);
  payment.set('currency', paymentResponse.currency);
  payment.set('checkCount', 0);
  payment.set(
    'nextCheckAt',
    paymentResponse.status === ProviderPaymentStatusEnum.PENDING
      ? dayjs().add(PAYMENT_RECONCILIATION_DELAYS_MINUTES[0], 'minute').toDate()
      : new Date()
  );

  let recordedPayment: Parse.Object;

  try {
    recordedPayment = await payment.save(null, USE_MASTER_KEY);
  }
  catch (saveError) {
    if (!isDuplicateValueError(saveError) || !paymentResponse.id) throw saveError;

    /*
     * Idempotent replay: this gateway transaction was already recorded — answer with the existing
     * payment, and drop the row this call recorded before asking the operator.
     */
    logger.info('Idempotent payment replay detected — reusing existing payment', {
      providerReference: paymentResponse.id,
    });

    const existingPayment = await getPaymentByProviderReference(paymentResponse.id);

    if (!existingPayment) throw saveError;

    await payment.destroy(USE_MASTER_KEY);

    return toPaymentOutput(existingPayment);
  }

  if (paymentResponse.status === ProviderPaymentStatusEnum.PENDING) {
    logger.info('Payment waiting for its operator', { paymentId: recordedPayment.id });

    return { success: false, isPending: true, payment: recordedPayment };
  }

  try {
    return await recordSyncPaymentOutcome(recordedPayment, { status: PaymentStatusEnum.SUCCESS });
  }
  catch (error) {
    // the money moved: the reconciliation job settles it from the operator's own answer
    logger.error('Payment accepted but its outcome could not be recorded', {
      paymentId: recordedPayment.id, error: (error as Error).stack,
    });

    return { success: false, isPending: true, payment: recordedPayment };
  }
};

/**
 * How much of a collection is still to be given back.
 *
 * Held on the collection itself as `refundedAmount` rather than summed from the refunds pointing at
 * it: the guard below has to read this figure and write it in the same operation, which only the
 * database can do atomically, and only for a field of the one document it is locking.
 */
export const getRefundableAmount = (payment: Parse.Object): number => (
  (payment.get('amount') ?? 0) - (payment.get('refundedAmount') ?? 0)
);

/**
 * Takes the amount out of what is left of a collection, or refuses. Returns whether it was taken.
 *
 * A conditional update rather than a read followed by a write (the same reason `acceptRequest`
 * guards seats this way): two operators refunding the last of the same collection at the same
 * moment would both read the same remainder and both pass an applicative check, and the platform
 * would have paid the passenger twice. The filter lets MongoDB serialise the two — the second one
 * matches nothing and is refused.
 *
 * The type and status are part of the filter too, so a collection that stopped being refundable
 * between the caller's read and this write cannot be refunded on the strength of the stale read.
 */
export const reserveRefundAmount = async (paymentId: string, amount: number): Promise<boolean> => {
  const paymentCollection = await getMongoCollection(collections.Payment);

  const reserved = await paymentCollection.findOneAndUpdate(
    {
      _id: paymentId,
      type: PaymentTypeEnum.PASSENGER_TO_APP,
      status: PaymentStatusEnum.SUCCESS,
      // `$ifNull` because a collection that has never been refunded carries no field at all
      $expr: {
        $lte: [{ $add: [{ $ifNull: ['$refundedAmount', 0] }, amount] }, '$amount'],
      },
    },
    {
      $inc: { refundedAmount: amount },
      $set: { _updated_at: new Date() },
    },
    { returnDocument: 'after' }
  );

  return !!(reserved?.value ?? reserved);
};

/**
 * Puts a reserved amount back, when the refund it was taken for never left the merchant account.
 * Without it a gateway failure would quietly make the collection less refundable than it is.
 */
export const releaseRefundAmount = async (paymentId: string, amount: number): Promise<void> => {
  const paymentCollection = await getMongoCollection(collections.Payment);

  await paymentCollection.updateOne(
    { _id: paymentId },
    { $inc: { refundedAmount: -amount }, $set: { _updated_at: new Date() } }
  );
};

/**
 * Puts the amount of a refund that never left the merchant account back into what can still be
 * refunded of its collection, and records it on the refund: a retry that later goes through has to
 * take it out again. A manual refund of a standing booking also gives its amount back to the
 * driver's fare.
 */
export const releaseRefundReservation = async (refund: Parse.Object): Promise<void> => {
  const refundOfId = refund.get('refundOf')?.id;

  if (!refundOfId) return;

  const bookingAdjustment = refund.get('settlement')?.bookingAdjustment;

  if (bookingAdjustment) {
    await adjustStandingBookingFare(bookingAdjustment, -refund.get('amount'));
  }

  await releaseRefundAmount(refundOfId, refund.get('amount'));
  refund.set('settlement', { ...refund.get('settlement'), isRefundAmountReleased: true });
  await refund.save(null, USE_MASTER_KEY);
};

/**
 * Keeps the remainder of a collection in step with a refund its operator settled after the call
 * that asked for it: a failure gives the amount back to what can be refunded, as an immediate one
 * does; a success after a failure (a retry) takes it out again — refused when another refund has
 * used it meanwhile, which support has to settle.
 *
 * Shared by every kind of refund rather than written once per flow: a booking refund, a refund
 * that came with a ride cancellation and an operator's manual refund all come out of the same
 * remainder, and the one that forgot to keep it up to date was the one that let the back office
 * refund the same money twice.
 */
export const settleRefundReservation = async (
  refund: Parse.Object,
  outcome: PaymentSettlementOutcome
): Promise<void> => {
  const settlement: PaymentSettlement = refund.get('settlement') ?? {};
  const refundOfId = refund.get('refundOf')?.id;

  if (!refundOfId) return;

  if (outcome.status === PaymentStatusEnum.FAILED) {
    if (!settlement.isRefundAmountReleased) {
      await releaseRefundReservation(refund);
    }
    return;
  }

  if (!settlement.isRefundAmountReleased) return;

  if (!await reserveRefundAmount(refundOfId, refund.get('amount'))) {
    logger.error('Refund paid on retry beyond what was left of its collection', {
      refundId: refund.id, refundOfId,
    });
    return;
  }

  // the retried refund leaves again: the driver's fare goes down with it, as it did the first time
  if (settlement.bookingAdjustment) {
    await adjustStandingBookingFare(settlement.bookingAdjustment, refund.get('amount'));
  }

  refund.set('settlement', { ...settlement, isRefundAmountReleased: false });
  await refund.save(null, USE_MASTER_KEY);
};

registerPaymentSettlementHandler(PaymentSettlementKindEnum.MANUAL_REFUND, settleRefundReservation);

/**
 * Gives a settled passenger collection back, as a new payment out of the merchant account towards
 * the account the money was taken from.
 *
 * A new payment rather than the original voided in place: the money genuinely moves a second time,
 * in the opposite direction, and the ledger has to show both halves. Marking the collection
 * `REVERSED` instead would state that it never happened, and would move nothing at all.
 *
 * `amount` gives back part of it — a journey cut short, a seat dropped. Omitted, it gives back
 * whatever is left, which is the whole collection the first time. A collection can be refunded
 * several times this way, up to its own amount and never past it.
 *
 * Only a `PASSENGER_TO_APP` payment that reached `SUCCESS` can be refunded. On a payout that has
 * already arrived on a driver's own mobile money account the operator gives the platform no way to
 * debit them back; the real remedy there is an adjustment on their next payout, which is a
 * different operation on a different object.
 *
 * The refund is filed under everything the original was filed under (the booking, the ride) so it
 * appears in that booking's own payment history rather than only in the ledger.
 */
export const refundPaymentAPI = async (
  paymentId: string,
  amount?: number,
  reason?: string,
  /**
   * Why the money is going back, when the caller knows a cause of its own — a booking paid after
   * it had closed. Omitted, it is an operator refunding by hand.
   */
  refundReason: RefundReasonEnum = RefundReasonEnum.MANUAL
): Promise<IDriverPassengerPaymentOutput> => {
  const relatedFieldKeys = getPaymentRelatedFieldKeys();
  const payment = await getPaymentById(paymentId, relatedFieldKeys);

  if (!payment) {
    throw new Error(ERRORS.PAYMENT_NOT_FOUND);
  }

  if (
    payment.get('type') !== PaymentTypeEnum.PASSENGER_TO_APP ||
    payment.get('status') !== PaymentStatusEnum.SUCCESS
  ) {
    throw new Error(ERRORS.PAYMENT_NOT_REFUNDABLE);
  }

  /*
   * A refund by hand on a booking still standing also comes off the ride's total, which is what the
   * driver is paid on — otherwise the platform would pay the same seat twice. Once the payout has
   * been sent (or is waiting for its operator) there is nothing left to take it off, so the refund
   * is refused. A refund of a collection whose booking is closed is not concerned.
   */
  const bookingId: string | undefined = payment.get('request')?.id;
  const standingBooking = refundReason === RefundReasonEnum.MANUAL && bookingId
    ? await getStandingBookingOfCollection(bookingId)
    : undefined;

  if (standingBooking && await getDriverPayoutForRide(standingBooking.rideId)) {
    throw new Error(ERRORS.PAYMENT_DRIVER_ALREADY_PAID);
  }

  const refundable = getRefundableAmount(payment);

  if (refundable <= 0) {
    throw new Error(ERRORS.PAYMENT_ALREADY_REFUNDED);
  }

  // no amount means all of what is left, which is the whole collection the first time round
  const refundedAmount = amount ?? refundable;

  if (refundedAmount > refundable) {
    throw new Error(ERRORS.PAYMENT_REFUND_AMOUNT_TOO_HIGH);
  }

  /*
   * taken out of the remainder before the gateway is called, not after: the reservation is what
   * makes two operators refunding at once impossible, and it can only do that if it happens first
   */
  if (!await reserveRefundAmount(paymentId, refundedAmount)) {
    throw new Error(ERRORS.PAYMENT_ALREADY_REFUNDED);
  }

  if (standingBooking) {
    await adjustStandingBookingFare(standingBooking, refundedAmount);

    // the payout may have started between the check above and the adjustment: put everything back
    if (await getDriverPayoutForRide(standingBooking.rideId)) {
      await adjustStandingBookingFare(standingBooking, -refundedAmount);
      await releaseRefundAmount(paymentId, refundedAmount);
      throw new Error(ERRORS.PAYMENT_DRIVER_ALREADY_PAID);
    }
  }

  /*
   * the two accounts of the collection, swapped: the money goes back out of the account it was
   * paid into and towards the one it was taken from, which is the only pair either side has agreed
   * to. Deriving them from the platform's default numbers instead would send a refund to whatever
   * number the passenger happens to have on their profile today.
   */
  const source = payment.get('destination');
  const destination = payment.get('source');

  const relatedEntities = relatedFieldKeys
    .map((key) => ({ key, entity: payment.get(key) as Parse.Object | undefined }))
    .filter((related): related is { key: string; entity: Parse.Object } => !!related.entity)
    .map(({ key, entity }) => ({ key, type: entity.className, id: entity.id }));

  let refund: IDriverPassengerPaymentOutput | void;

  try {
    refund = await processAndCreatePayment({
      amount: refundedAmount,
      receiverId: payment.get('payer')?.id,
      paymentType: PaymentTypeEnum.APP_TO_PASSENGER,
      description: reason || `Refund for Payment ${payment.id}`,
      refundReason,
      source,
      destination,
      relatedEntities: [
        ...relatedEntities,
        // what this refund gives back, so the ledger can be read from either end of the pair
        { key: 'refundOf', type: collections.Payment, id: payment.id },
      ],
      settlement: { kind: PaymentSettlementKindEnum.MANUAL_REFUND, bookingAdjustment: standingBooking },
    });
  }
  catch (error) {
    /*
     * Nothing left the merchant account: only what happens before the operator is called can throw
     * here (an invalid number, a first write that failed), since what follows the operator's
     * acceptance never fails the payment any more. The collection is as refundable as it was.
     */
    if (standingBooking) {
      await adjustStandingBookingFare(standingBooking, -refundedAmount);
    }
    await releaseRefundAmount(paymentId, refundedAmount);
    throw error;
  }

  // a refund still waiting for its operator keeps its amount reserved until it is settled
  if (refund && !refund.success && !refund.isPending) {
    await releaseRefundReservation(refund.payment);
    logger.error('refundPaymentAPI failed', { paymentId, error: refund.error });
  }

  if (!refund) {
    throw new Error(ERRORS.PAYMENT_FAILED);
  }

  /*
   * why the operator gave this money back, on the refund itself: the amounts alone never say
   * whether it settled a complaint, a journey cut short or a mistake of the platform's own
   */
  if (reason && refund.payment) {
    refund.payment.set('manualReason', reason);
    await refund.payment.save(null, USE_MASTER_KEY);
  }

  return refund;
};

export const updatePaymentAfterSave = async (
  id: string,
  dirtyKeys: string[]= []
): Promise<void> => {
  const includes = getPaymentIncludesForDirtyKeys(dirtyKeys);

  const refreshedPayment = await new Parse.Query(collections.Payment)
    .equalTo('objectId', id)
    .include(includes)
    .first(USE_MASTER_KEY);

  if (!refreshedPayment) return;

  const snapshot = setPaymentSnapshot(refreshedPayment, dirtyKeys);

  refreshedPayment.set('snapshot', snapshot);
  await refreshedPayment.save(null, USE_MASTER_KEY);
};

/**
 * Refuses a retry that would move money the platform no longer owes, whoever asks for it — the
 * back office, the passenger, or the job retrying the platform's debts.
 *
 * Two cases, both of which produced real money movements with nothing to match them:
 *
 * - **a ride payout whose ride is already paid**: every failed run of the release job left a
 *   `FAILED` payout row behind, and the back office offered "retry" on each of them. Retrying one
 *   after another run had paid the driver paid them twice. A payout still waiting for its operator
 *   counts as paid here: its outcome is not known yet, so sending another is the same gamble.
 *
 * - **a booking collection whose booking is closed**: a collection that goes through once the
 *   booking has been refused, expired or cancelled debits a passenger who has no seat. The money
 *   is then neither a booking nor refundable (`refundPassenger…` needs a PAID booking), so it sat
 *   on the merchant account with nothing pointing at it. A booking still waiting to be paid is a
 *   different matter: its collection finishes the booking normally, so it may be retried.
 */
const assertPaymentCanBeRetried = async (payment: Parse.Object): Promise<void> => {
  const rideId = payment.get('ride')?.id;

  if (payment.get('type') === PaymentTypeEnum.APP_TO_DRIVER && rideId) {
    const existingPayout = await getDriverPayoutForRide(rideId);

    if (existingPayout && existingPayout.id !== payment.id) {
      throw new Error(ERRORS.PAYMENT_RIDE_ALREADY_PAID);
    }
  }

  const requestId = payment.get('request')?.id;

  if (
    payment.get('type') === PaymentTypeEnum.PASSENGER_TO_APP && requestId && await isBookingClosed(requestId)
  ) {
    throw new Error(ERRORS.BOOKING_CLOSED_BOOK_AGAIN);
  }
};

/**
 * Re-attempts a `FAILED` payment against the gateway using the amount/source/destination
 * already recorded on it — used by the BO "retry" action, the mobile "retry" button on a
 * passenger's own failed booking payment, and the retry job of the payments the platform owes.
 * @NOTE mutates the existing Payment (same audit trail) instead of creating a new one, so the
 * `beforeSave` trigger's `successBy`/`failedBy` timestamps double as the retry's "who/when".
 * @NOTE a retry that goes through runs the follow-up its flow registered (a booking paid late, a
 * refund owed to a passenger): whatever the first attempt failed to finish is finished now. One
 * that fails again leaves the payment where it was, for its caller to decide.
 * @param retriedBy who asked for the retry — omitted for an automatic one. Passed in rather than
 * read in the trigger because the row is saved with the master key, which carries no user.
 * @param reason why the operator is sending it again — required of a back-office retry by its
 * Cloud Function, absent on an automatic one.
 */
export const retryPaymentAPI = async (
  paymentId: string,
  retriedBy?: Parse.User,
  reason?: string
): Promise<IDriverPassengerPaymentOutput> => {
  const payment = await getPaymentById(paymentId);

  if (!payment) {
    throw new Error(ERRORS.PAYMENT_NOT_FOUND);
  }

  if (payment.get('status') !== PaymentStatusEnum.FAILED) {
    throw new Error(ERRORS.PAYMENT_NOT_FAILED);
  }

  await assertPaymentCanBeRetried(payment);

  /*
   * A payment failed on its deadline, or whose answer never came back, may still have gone through
   * at the operator. Sending it again without asking would pay the same thing twice, and the
   * first transaction would vanish from the registers once its reference is replaced.
   */
  const previousReference: string | undefined = payment.get('providerReference');
  const isOutcomeUncertain = [
    PaymentFailureCodeEnum.CONFIRMATION_TIMEOUT, PaymentFailureCodeEnum.OUTCOME_UNKNOWN,
  ].includes(payment.get('failureCode'));

  if (previousReference && isOutcomeUncertain) {
    const previousAnswer = await getPaymentStatusAPI(previousReference);

    if (previousAnswer.status === ProviderPaymentStatusEnum.SUCCESS) {
      // the first attempt did go through: settle it instead of paying the same thing a second time
      await settlePayment(
        paymentId, { status: PaymentStatusEnum.SUCCESS }, PaymentSettledByEnum.LATE_CHECK,
        { fromStatus: PaymentStatusEnum.FAILED }
      );
      throw new Error(ERRORS.PAYMENT_ALREADY_SETTLED_AT_OPERATOR);
    }

    if (previousAnswer.status === ProviderPaymentStatusEnum.PENDING) {
      throw new Error(ERRORS.PAYMENT_STILL_PENDING_AT_OPERATOR);
    }
  }

  // one retry at a time: two operators pressing "retry" together would send the money twice
  if (!await claimPaymentSettlement(paymentId, { status: PaymentStatusEnum.FAILED })) {
    throw new Error(ERRORS.PAYMENT_NOT_FAILED);
  }

  const amount = payment.get('amount');
  const source = payment.get('source');
  const destination = payment.get('destination');
  let isClaimHandedOver = false;
  // same reason as in processAndCreatePayment: the Error carries only the operator's own sentence
  let failureCode: PaymentFailureCodeEnum | undefined;

  /*
   * written with whichever outcome is saved below, so an attempt is counted whether it went
   * through or failed again — the row only ever holds the last one of either
   */
  payment.increment('retryCount');
  payment.set('retriedAt', new Date());
  if (reason) {
    payment.set('manualReason', reason);
  }
  // an automatic retry clears the name of whoever asked for an earlier one, instead of borrowing it
  if (retriedBy) {
    payment.set('retriedBy', retriedBy);
  }
  else {
    payment.unset('retriedBy');
  }

  try {
    let paymentResponse: Awaited<ReturnType<typeof processPaymentAPI>>;

    /*
     * Phase 1 — talking to the operator. Only a failure here may leave the retry FAILED: nothing is
     * known to have moved.
     */
    try {
      paymentResponse = await processPaymentAPI({
        amount,
        currency: payment.get('currency') ?? DEFAULT_CURRENCY,
        source,
        destination,
        description: `Retry for Payment ${payment.id}`,
        // another reference than the first attempt's, which the operator may still hold
        reference: `${payment.id}-r${payment.get('retryCount')}`,
      });

      if (paymentResponse.status === ProviderPaymentStatusEnum.FAILED) {
        failureCode = paymentResponse.errorCode;
        throw new Error(paymentResponse.error || ERRORS.PAYMENT_FAILED);
      }
    }
    catch (error) {
      logger.error('retryPaymentAPI failed', { paymentId, error: (error as Error).stack });

      payment.set('status', PaymentStatusEnum.FAILED);
      payment.set('failureReason', (error as Error).message);
      payment.set('failureCode', failureCode ?? PaymentFailureCodeEnum.UNKNOWN);
      // a retry that failed has nothing left to finish: its caller decides what comes next
      payment.set('settledAt', new Date());

      const failedPayment = await payment.save(null, USE_MASTER_KEY);

      return {
        success: false,
        error: (error as Error).message,
        payment: failedPayment,
      };
    }

    /*
     * Phase 2 — recording what the operator answered. It has the money or is about to, so this
     * payment can no longer be marked FAILED by us: the reference is written first, as a payment
     * waiting for its operator, and the reconciliation job settles it if anything below goes wrong.
     */
    // kept, not overwritten: a late callback or statement line for the first attempt must still match
    if (previousReference) {
      payment.addUnique('previousReferences', previousReference);
    }

    payment.set('providerReference', paymentResponse.id);
    payment.set('service', paymentResponse.service);
    payment.set('currency', paymentResponse.currency);
    payment.unset('failureReason');
    payment.unset('failureCode');
    payment.unset('settledAt');
    payment.set('status', PaymentStatusEnum.PENDING);
    payment.set('expiresAt', dayjs().add(PENDING_PAYMENT_TIMEOUT_MINUTES, 'minute').toDate());
    payment.set('checkCount', 0);
    payment.set(
      'nextCheckAt',
      paymentResponse.status === ProviderPaymentStatusEnum.PENDING
        ? dayjs().add(PAYMENT_RECONCILIATION_DELAYS_MINUTES[0], 'minute').toDate()
        : new Date()
    );

    const recordedPayment = await payment.save(null, USE_MASTER_KEY);

    if (paymentResponse.status === ProviderPaymentStatusEnum.PENDING) {
      return { success: false, isPending: true, payment: recordedPayment };
    }

    recordedPayment.set('status', PaymentStatusEnum.SUCCESS);
    recordedPayment.set('paymentIntentId', paymentResponse.id);
    recordedPayment.set('settledBy', PaymentSettledByEnum.RETRY);
    recordedPayment.unset('nextCheckAt');

    try {
      const updatedPayment = await recordedPayment.save(null, USE_MASTER_KEY);

      // releases the claim once the follow-up is done, or leaves it to the reconciliation job
      isClaimHandedOver = true;
      await finishPaymentSettlement(updatedPayment, { status: PaymentStatusEnum.SUCCESS });

      return {
        success: true,
        paymentIntentId: paymentResponse.id,
        payment: updatedPayment,
      };
    }
    catch (saveError) {
      if (!isDuplicatePaymentIntentIdError(saveError)) {
        // the money moved: the row waits for its operator and the reconciliation job settles it
        logger.error('Retry accepted but its outcome could not be recorded', {
          paymentId, error: (saveError as Error).stack,
        });

        return { success: false, isPending: true, payment: recordedPayment };
      }

      logger.info('Idempotent payment retry detected — reusing existing payment', {
        paymentId, paymentIntentId: paymentResponse.id,
      });

      const existingPayment = paymentResponse.id
        ? await getPaymentByPaymentIntentId(paymentResponse.id)
        : undefined;

      return {
        success: true,
        paymentIntentId: paymentResponse.id,
        payment: existingPayment || recordedPayment,
      };
    }
  }
  finally {
    if (!isClaimHandedOver) {
      await releasePaymentSettlement(paymentId);
    }
  }
};
