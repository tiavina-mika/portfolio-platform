import { PaymentFailureCodeEnum, PaymentStatusEnum } from '@shared/types';
import dayjs from 'dayjs';

import { getPaymentStatusAPI } from '@/api/_core/payment.api';
import {
  collections, DEFAULT_QUERY_LIMIT, ERRORS, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  PAYMENT_LATE_CHECK_INTERVAL_MINUTES,
  PAYMENT_LATE_CHECK_WINDOW_HOURS,
  PAYMENT_RECONCILIATION_DELAYS_MINUTES,
  PAYMENT_SETTLEMENT_LOCK_MINUTES,
  PAYMENT_SETTLEMENT_MAX_ATTEMPTS,
} from '@/constants/_core/payment.constants';
import {
  type PaymentSettlementKindEnum,
  type PaymentSettlementOutcome,
  PaymentSettledByEnum,
  ProviderPaymentStatusEnum,
} from '@/types/payment.type';
import { logger } from '@/utils/_core/logger';

import { retryOperation } from '../../transactions/utils.transactions';
import { getMongoCollection } from '../../utils/_core/db.utils.cloud';

/*
 * A payment used to be an answer: the gateway said yes or no within the call, and the flow that
 * asked for it carried on. With mobile money the customer confirms on their own phone, after that
 * call has returned, so a payment is a status to wait for. This service is the one place that
 * turns a PENDING payment into a final one, whoever learns the outcome first, and then runs what
 * the flow that asked for the payment registered for that moment.
 */

type PaymentSettlementHandler = (payment: Parse.Object, outcome: PaymentSettlementOutcome) => Promise<void>;

const settlementHandlers = new Map<PaymentSettlementKindEnum, PaymentSettlementHandler>();

/**
 * Fields a settlement handler may read off the payment — its related booking, ride or refunded
 * payment are pointers it fetches itself, with the fields it needs.
 */
const PAYMENT_SETTLEMENT_FIELDS = [
  'status', 'type', 'amount', 'settlement', 'failureReason', 'failureCode', 'providerReference', 'autoRetryCount',
  'request', 'ride', 'refundOf', 'payer', 'receiver', 'settlementAttempts',
];

/**
 * Registers what a flow does once one of its payments is final. Called once per kind, at module
 * load, by the flow that creates the payments of that kind.
 */
export const registerPaymentSettlementHandler = (
  kind: PaymentSettlementKindEnum,
  handler: PaymentSettlementHandler
): void => {
  settlementHandlers.set(kind, handler);
};

/**
 * Runs the follow-up a payment's flow registered. A payment with no `settlement` has none: its
 * flow handled the outcome in the call that asked for it.
 */
export const runPaymentSettlementHandler = async (
  payment: Parse.Object,
  outcome: PaymentSettlementOutcome
): Promise<void> => {
  const kind: PaymentSettlementKindEnum | undefined = payment.get('settlement')?.kind;

  if (!kind) return;

  const handler = settlementHandlers.get(kind);

  if (!handler) {
    logger.error('No settlement handler registered for this payment', { kind, paymentId: payment.id });
    return;
  }

  await handler(payment, outcome);
};

/**
 * Claims a payment with a conditional update, the same way `lockRideCompletion` claims a ride: the
 * operator's answer can reach the server from two paths at once (the reconciliation job, the call
 * that asked for the payment, a retry), and only the first may act on it. A claim older than
 * PAYMENT_SETTLEMENT_LOCK_MINUTES belongs to a call that died midway and no longer counts.
 * @param filter the state the payment must still be in for the claim to be taken
 */
export const claimPaymentSettlement = async (
  paymentId: string,
  filter: Record<string, unknown>,
  now = new Date()
): Promise<boolean> => {
  const paymentCollection = await getMongoCollection(collections.Payment);
  const staleLockDate = dayjs(now).subtract(PAYMENT_SETTLEMENT_LOCK_MINUTES, 'minute').toDate();
  const claimed = await paymentCollection.findOneAndUpdate(
    {
      _id: paymentId,
      ...filter,
      $or: [
        { settlementLockedAt: { $exists: false } },
        { settlementLockedAt: { $lt: staleLockDate } },
      ],
    },
    { $set: { settlementLockedAt: now } }
  );

  return !!(claimed?.value ?? claimed);
};

/** Frees a claim once the payment and its follow-up are done with */
export const releasePaymentSettlement = async (paymentId: string): Promise<void> => {
  const paymentCollection = await getMongoCollection(collections.Payment);

  await paymentCollection.updateOne({ _id: paymentId }, { $unset: { settlementLockedAt: '' } });
};

/**
 * Runs the payment's follow-up, then records that it ran. A follow-up that throws leaves the claim
 * in place: the reconciliation job takes the payment over once the claim is stale, which spaces
 * out the attempts on a follow-up that keeps failing.
 * @NOTE the payment must already be claimed by the caller
 */
export const finishPaymentSettlement = async (
  payment: Parse.Object,
  outcome: PaymentSettlementOutcome
): Promise<void> => {
  try {
    await runPaymentSettlementHandler(payment, outcome);
    payment.set('settledAt', new Date());
    await payment.save(null, USE_MASTER_KEY);
    await releasePaymentSettlement(payment.id);
  }
  catch (error) {
    logger.error('Payment follow-up failed, left to the reconciliation job', {
      paymentId: payment.id, error: (error as Error).stack,
    });

    // counted, so a follow-up that keeps failing is given up instead of resumed for ever
    const paymentCollection = await getMongoCollection(collections.Payment);

    await paymentCollection.updateOne({ _id: payment.id }, { $inc: { settlementAttempts: 1 } });
  }
};

const getSettlementPayment = (paymentId: string): Promise<Parse.Object> => (
  new Parse.Query(collections.Payment)
    .select(PAYMENT_SETTLEMENT_FIELDS)
    .get(paymentId, USE_MASTER_KEY)
);

/**
 * Turns a PENDING payment into a final one and runs its follow-up. Does nothing, and returns
 * false, when the payment is no longer PENDING or another path is settling it right now.
 */
export const settlePayment = async (
  paymentId: string,
  outcome: PaymentSettlementOutcome,
  settledBy: PaymentSettledByEnum,
  {
    now = new Date(),
    /** the status the payment must still hold: FAILED for a late answer on a payment failed on its deadline */
    fromStatus = PaymentStatusEnum.PENDING,
  }: { now?: Date; fromStatus?: PaymentStatusEnum } = {}
): Promise<boolean> => {
  if (!await claimPaymentSettlement(paymentId, { status: fromStatus }, now)) {
    return false;
  }

  const payment = await getSettlementPayment(paymentId);

  payment.set('status', outcome.status);
  payment.set('settledBy', settledBy);
  payment.unset('nextCheckAt');

  if (outcome.status === PaymentStatusEnum.SUCCESS) {
    // the reference is the operator's transaction id: what the idempotency index guards
    payment.set('paymentIntentId', payment.get('providerReference'));
    // a late success replaces the failure the payment was given on its deadline
    payment.unset('failureReason');
    payment.unset('failureCode');
    // the follow-up has not run on this outcome yet
    payment.unset('settledAt');
  }
  else {
    payment.set('failureReason', outcome.error || ERRORS.PAYMENT_FAILED);
    // what the member reads: the sentence above is the operator's, in whatever language it chose
    payment.set('failureCode', outcome.errorCode ?? PaymentFailureCodeEnum.UNKNOWN);
  }

  await payment.save(null, USE_MASTER_KEY);

  logger.info(`Payment settled: ${outcome.status}`, { paymentId, settledBy, error: outcome.error });

  await finishPaymentSettlement(payment, outcome);

  return true;
};

/** Puts the next check of a payment still waiting further away, never past its deadline */
const scheduleNextCheck = async (payment: Parse.Object, now: Date): Promise<void> => {
  const checkCount = (payment.get('checkCount') ?? 0) + 1;
  const delays = PAYMENT_RECONCILIATION_DELAYS_MINUTES;
  const delayMinutes = delays[Math.min(checkCount, delays.length - 1)] ?? delays[0];
  const nextCheckAt = dayjs(now).add(delayMinutes, 'minute');
  const expiresAt = dayjs(payment.get('expiresAt'));

  payment.set('checkCount', checkCount);
  payment.set('nextCheckAt', (nextCheckAt.isAfter(expiresAt) ? expiresAt : nextCheckAt).toDate());
  await payment.save(null, USE_MASTER_KEY);
};

/** Asks the operator about one payment still waiting, and settles it when there is an answer */
const checkPendingPayment = async (payment: Parse.Object, now: Date): Promise<void> => {
  const expiresAt = payment.get('expiresAt');
  const isExpired = !expiresAt || !dayjs(expiresAt).isAfter(now);
  const reference: string | undefined = payment.get('providerReference');

  if (!reference) {
    /*
     * the payment was recorded but the operator's answer never came back: nothing identifies the
     * transaction on its side, so it cannot be asked about it
     */
    if (!isExpired) {
      await scheduleNextCheck(payment, now);
      return;
    }

    logger.error('Payment with no operator answer, to check against its statement', { paymentId: payment.id });
    await settlePayment(
      payment.id,
      {
        status: PaymentStatusEnum.FAILED,
        error: ERRORS.PAYMENT_OUTCOME_UNKNOWN,
        errorCode: PaymentFailureCodeEnum.OUTCOME_UNKNOWN,
      },
      PaymentSettledByEnum.RECONCILIATION,
      { now }
    );
    return;
  }

  const answer = await retryOperation(() => getPaymentStatusAPI(reference));

  if (answer.status === ProviderPaymentStatusEnum.SUCCESS) {
    const isAmountMismatch = answer.amount !== undefined && answer.amount !== payment.get('amount');

    if (isAmountMismatch) {
      logger.error('Operator confirmed another amount', {
        paymentId: payment.id, expected: payment.get('amount'), confirmed: answer.amount,
      });
    }

    await settlePayment(
      payment.id,
      isAmountMismatch
        ? {
          status: PaymentStatusEnum.FAILED,
          error: ERRORS.PAYMENT_AMOUNT_MISMATCH,
          errorCode: PaymentFailureCodeEnum.AMOUNT_MISMATCH,
        }
        : { status: PaymentStatusEnum.SUCCESS },
      PaymentSettledByEnum.RECONCILIATION,
      { now }
    );
    return;
  }

  if (answer.status === ProviderPaymentStatusEnum.FAILED) {
    await settlePayment(
      payment.id,
      { status: PaymentStatusEnum.FAILED, error: answer.error, errorCode: answer.errorCode },
      PaymentSettledByEnum.RECONCILIATION,
      { now }
    );
    return;
  }

  if (isExpired) {
    await settlePayment(
      payment.id,
      {
        status: PaymentStatusEnum.FAILED,
        error: ERRORS.PAYMENT_CONFIRMATION_TIMEOUT,
        errorCode: PaymentFailureCodeEnum.CONFIRMATION_TIMEOUT,
      },
      PaymentSettledByEnum.RECONCILIATION,
      { now }
    );
    return;
  }

  await scheduleNextCheck(payment, now);
};

/**
 * Asks the operator once more about a payment failed on its deadline. A success replaces the
 * failure and runs the follow-up of its flow, exactly like an on-time confirmation.
 */
const checkLatePayment = async (payment: Parse.Object, now: Date): Promise<void> => {
  const paymentCollection = await getMongoCollection(collections.Payment);

  // stamped first: an answer that throws must not be asked again on the very next run
  await paymentCollection.updateOne({ _id: payment.id }, { $set: { lateCheckedAt: now } });

  const answer = await retryOperation(() => getPaymentStatusAPI(payment.get('providerReference')));

  if (answer.status !== ProviderPaymentStatusEnum.SUCCESS) return;

  if (answer.amount !== undefined && answer.amount !== payment.get('amount')) {
    logger.error('Operator confirmed another amount on a late check', {
      paymentId: payment.id, expected: payment.get('amount'), confirmed: answer.amount,
    });
    return;
  }

  await settlePayment(
    payment.id,
    { status: PaymentStatusEnum.SUCCESS },
    PaymentSettledByEnum.LATE_CHECK,
    { now, fromStatus: PaymentStatusEnum.FAILED }
  );
};

/**
 * Asks the operator about one PENDING payment right now instead of waiting for its next scheduled
 * check — what the finance overview's "retry" does for a payment stuck past the gateway's timeout.
 * The answer settles it exactly as the job would (same claim, same follow-up); a payment the
 * operator has not answered for stays PENDING and its next check is pushed back as usual.
 * @returns the status the payment holds once the check is done
 */
export const recheckPendingPayment = async (
  paymentId: string,
  now = new Date()
): Promise<PaymentStatusEnum> => {
  const payment = await new Parse.Query(collections.Payment)
    .equalTo('objectId', paymentId)
    .select(['status', 'providerReference', 'expiresAt', 'checkCount', 'amount'])
    .first(USE_MASTER_KEY);

  if (!payment) {
    throw new Error(ERRORS.PAYMENT_NOT_FOUND);
  }

  if (payment.get('status') !== PaymentStatusEnum.PENDING) {
    throw new Error(ERRORS.PAYMENT_NOT_PENDING);
  }

  await checkPendingPayment(payment, now);

  const checked = await new Parse.Query(collections.Payment)
    .select(['status'])
    .get(paymentId, USE_MASTER_KEY);

  return checked.get('status');
};

/**
 * The reconciliation job:
 * 1. asks the operator about every PENDING payment whose next check is due, and settles the ones
 *    it has an answer for — or that waited past their deadline;
 * 2. re-reads, for a day, the payments failed on their deadline: a customer may confirm late;
 * 3. takes over the final payments whose follow-up never finished (the server stopped, the
 *    follow-up threw).
 * Safe to run on several instances at once: every settlement goes through a claim.
 * @param now the moment to reconcile at — the current time outside of tests
 */
export const reconcilePendingPayments = async (now = new Date()): Promise<void> => {
  const duePayments = await new Parse.Query(collections.Payment)
    .equalTo('status', PaymentStatusEnum.PENDING)
    .lessThanOrEqualTo('nextCheckAt', now)
    .select(['providerReference', 'expiresAt', 'checkCount', 'amount'])
    .ascending('nextCheckAt')
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  for (const payment of duePayments) {
    try {
      await checkPendingPayment(payment, now);
    }
    catch (error) {
      logger.error(`Error reconciling payment ${payment.id}`, { error: (error as Error).stack });

      /*
       * pushed back like any unanswered check: left as it is, it would head the next run's list
       * again and, fifty of them in a row, starve every other payment of the page
       */
      try {
        await scheduleNextCheck(payment, now);
      }
      catch (scheduleError) {
        logger.error(`Could not reschedule payment ${payment.id}`, {
          error: (scheduleError as Error).message,
        });
      }
    }
  }

  const lateCheckDueBefore = dayjs(now).subtract(PAYMENT_LATE_CHECK_INTERVAL_MINUTES, 'minute').toDate();
  const latePayments = await new Parse.Query(collections.Payment)
    .equalTo('status', PaymentStatusEnum.FAILED)
    .equalTo('failureCode', PaymentFailureCodeEnum.CONFIRMATION_TIMEOUT)
    .greaterThan('failedAt', dayjs(now).subtract(PAYMENT_LATE_CHECK_WINDOW_HOURS, 'hour').toDate())
    .exists('providerReference')
    .select(['providerReference', 'amount', 'lateCheckedAt'])
    .ascending('lateCheckedAt')
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);
  const dueLatePayments = latePayments.filter(
    (payment) => !payment.get('lateCheckedAt') || payment.get('lateCheckedAt') <= lateCheckDueBefore
  );

  for (const payment of dueLatePayments) {
    try {
      await checkLatePayment(payment, now);
    }
    catch (error) {
      logger.error(`Error checking late payment ${payment.id}`, { error: (error as Error).stack });
    }
  }

  const interruptedPayments = await new Parse.Query(collections.Payment)
    .containedIn('status', [PaymentStatusEnum.SUCCESS, PaymentStatusEnum.FAILED])
    .doesNotExist('settledAt')
    .doesNotExist('settlementAbandonedAt')
    .exists('settlement')
    .select(PAYMENT_SETTLEMENT_FIELDS)
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  for (const payment of interruptedPayments) {
    const status = payment.get('status');

    if ((payment.get('settlementAttempts') ?? 0) >= PAYMENT_SETTLEMENT_MAX_ATTEMPTS) {
      const paymentCollection = await getMongoCollection(collections.Payment);

      await paymentCollection.updateOne({ _id: payment.id }, { $set: { settlementAbandonedAt: now } });
      logger.error('Payment follow-up failed too many times, left for support to settle by hand', {
        paymentId: payment.id, attempts: payment.get('settlementAttempts'),
      });
      continue;
    }

    const isClaimed = await claimPaymentSettlement(
      payment.id, { status, settledAt: { $exists: false } }, now
    );

    if (isClaimed) {
      logger.warn('Resuming the interrupted follow-up of a payment', { paymentId: payment.id });
      await finishPaymentSettlement(payment, {
        status, error: payment.get('failureReason'), errorCode: payment.get('failureCode'),
      });
    }
  }

  logger.info('Pending payments reconciled', {
    checked: duePayments.length, lateChecked: dueLatePayments.length, resumed: interruptedPayments.length,
  });
};
