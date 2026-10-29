import { PaymentStatusEnum, PaymentTypeEnum } from '@shared/types';
import { formatAmountInCurrency } from '@shared/utils';
import dayjs from 'dayjs';

import { translate } from '@/config/i18n';
import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { PAYMENT_BO_PATH, PLATFORM_PAYMENT_RETRY_DELAYS_HOURS } from '@/constants/_core/payment.constants';
import { SLACK_ALERT_ICONS } from '@/constants/_core/slack.constants';
import { logger } from '@/utils/_core/logger';
import { getServerUrl } from '@/utils/_core/utils';

import { retryPaymentAPI } from './payment.service.cloud';
import { getUsersFromRoles } from './userRole.service.cloud';
import { alertStaff } from '../../utils/_core/staff-alert.utils.cloud';

/*
 * A payment the platform owes and could not send — a late-cancellation compensation to a driver,
 * a refund to a passenger whose booking is already cancelled — is a debt: whatever it was owed for
 * has already happened and is never undone. These payments are the only ones carrying
 * `nextAutoRetryAt`, which is what the retry job looks them up by.
 */

/** E-mail keys per direction of the debt: who is owed, and for what */
const RETRY_EXHAUSTED_EMAIL_KEYS: Partial<Record<PaymentTypeEnum, { subject: string; message: string }>> = {
  [PaymentTypeEnum.APP_TO_DRIVER]: {
    subject: 'email.driverIndemnityFailedSubject',
    message: 'email.driverIndemnityFailedMessage',
  },
  [PaymentTypeEnum.APP_TO_PASSENGER]: {
    subject: 'email.passengerRefundFailedSubject',
    message: 'email.passengerRefundFailedMessage',
  },
};

/** Queues the first automatic retry of a payment the platform owes that has just failed */
export const schedulePaymentRetry = async (payment: Parse.Object): Promise<void> => {
  payment.set('autoRetryCount', 0);
  payment.set('nextAutoRetryAt', dayjs().add(PLATFORM_PAYMENT_RETRY_DELAYS_HOURS[0], 'hour').toDate());
  await payment.save(null, USE_MASTER_KEY);
};

/**
 * E-mails the owners and super-administrators about a debt every automatic retry failed on. The
 * failed-payments badge of the back-office already lists it; the e-mail is what makes sure
 * somebody actually looks.
 */
const notifyAdminsOfExhaustedRetries = async (payment: Parse.Object, error: string): Promise<void> => {
  const emailKeys = RETRY_EXHAUSTED_EMAIL_KEYS[payment.get('type') as PaymentTypeEnum];

  if (!emailKeys) {
    logger.error(`No retry e-mail for payment type ${payment.get('type')}`, { paymentId: payment.id });
    return;
  }

  const receiverId: string | undefined = payment.get('receiver')?.id;
  const receiver = receiverId
    ? await new Parse.Query(Parse.User).select(['firstName', 'lastName']).get(receiverId, USE_MASTER_KEY)
    : undefined;
  const admins = await getUsersFromRoles(['OWNER', 'SUPER_ADMIN']);
  const values = {
    // the figure with the symbol of the currency the payment is in, so the message names no currency itself
    amount: formatAmountInCurrency(payment.get('amount'), payment.get('currency')),
    receiverName: [receiver?.get('firstName'), receiver?.get('lastName')].filter(Boolean).join(' '),
    attempts: String(PLATFORM_PAYMENT_RETRY_DELAYS_HOURS.length),
    error,
    url: `${getServerUrl()}/${PAYMENT_BO_PATH}/${payment.id}`,
  };
  // in each administrator's own language rather than always in French, as the hardcoded default was
  const failures = await alertStaff(admins, (locale) => ({
    subject: translate(emailKeys.subject, locale, { paymentId: payment.id }),
    message: translate(emailKeys.message, locale, values),
  }), { icon: SLACK_ALERT_ICONS.payment, url: values.url });

  failures.forEach(({ error: sendError }) => {
    logger.error(`Retry exhausted admin e-mail failed for payment ${payment.id}`, sendError);
  });
};

/**
 * Records one more failed attempt of a debt: schedules the next retry, or — once
 * PLATFORM_PAYMENT_RETRY_DELAYS_HOURS is spent — stops retrying and e-mails the admins. Called by
 * the retry job after a retry that failed at once, and when a retry the operator only confirmed
 * later turns out to have failed.
 * @NOTE the payment is saved by the caller
 */
export const recordFailedPaymentRetry = async (payment: Parse.Object, error: string): Promise<void> => {
  const attempts = payment.get('autoRetryCount') ?? 0;
  // undefined once every retry is spent
  const nextDelayHours: number | undefined = PLATFORM_PAYMENT_RETRY_DELAYS_HOURS[attempts];

  if (nextDelayHours !== undefined) {
    payment.set('nextAutoRetryAt', dayjs().add(nextDelayHours, 'hour').toDate());
    return;
  }

  payment.unset('nextAutoRetryAt');
  await notifyAdminsOfExhaustedRetries(payment, error);
  logger.error('Payment owed by the platform still failing after every automatic retry', {
    paymentId: payment.id, error,
  });
};

/**
 * Puts a debt that just failed in the retry queue: its first retry when it has never been queued,
 * its next one otherwise (a retry the operator only turned down later).
 */
export const retryPlatformDebt = async (payment: Parse.Object, error: string): Promise<void> => {
  if (payment.get('autoRetryCount') === undefined) {
    await schedulePaymentRetry(payment);
    return;
  }

  await recordFailedPaymentRetry(payment, error);
  await payment.save(null, USE_MASTER_KEY);
};

/**
 * Retries the failed debts whose next attempt is due. A success clears the schedule; a failure
 * schedules the next attempt or gives up; a retry the operator has not confirmed yet waits for the
 * reconciliation job, which comes back here through `recordFailedPaymentRetry` if it fails.
 */
export const retryFailedPlatformPayments = async (): Promise<void> => {
  const duePayments = await new Parse.Query(collections.Payment)
    .equalTo('status', PaymentStatusEnum.FAILED)
    .lessThanOrEqualTo('nextAutoRetryAt', dayjs().toDate())
    .select(['type', 'autoRetryCount', 'amount', 'currency', 'receiver'])
    .limit(DEFAULT_QUERY_LIMIT)
    .find(USE_MASTER_KEY);

  for (const payment of duePayments) {
    try {
      const result = await retryPaymentAPI(payment.id);

      payment.set('autoRetryCount', (payment.get('autoRetryCount') ?? 0) + 1);

      if (result.success || result.isPending) {
        payment.unset('nextAutoRetryAt');
        logger.info(`Payment owed by the platform retried: ${result.success ? 'paid' : 'pending'}`, {
          paymentId: payment.id,
        });
      }
      else {
        await recordFailedPaymentRetry(payment, result.error || '');
      }

      await payment.save(null, USE_MASTER_KEY);
    }
    catch (error) {
      logger.error(`Error retrying payment ${payment.id}`, { error: (error as Error).message });
    }
  }
};
