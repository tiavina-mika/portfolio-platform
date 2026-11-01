import crypto from 'crypto';

import { PaymentFailureCodeEnum } from '@shared/types';

import type {
  PaymentProcessInput, PaymentOutput,
} from '@/types/payment.type';

import { DEFAULT_CURRENCY } from '@/constants/_core/constants';
import { PAYMENT_MOCK_CONFIRM_SECONDS } from '@/constants/_core/payment.constants';
import { PaymentMockModeEnum, ProviderPaymentStatusEnum } from '@/types/payment.type';
import { logger } from '@/utils/_core/logger';
import { getPaymentServiceByPhoneNumber } from '@/utils/_core/payment.utils';
import { maskPhone } from '@/utils/_core/pii.utils';
import { wait } from '@/utils/_core/utils';

const MOCK_REFERENCE_PREFIX = 'mock';
// a dot, since the mode names hold underscores and a UUID holds dashes
const MOCK_REFERENCE_SEPARATOR = '.';

export type ProviderPaymentStatusOutput = {
  status: ProviderPaymentStatusEnum;
  error?: string;
  /** the refusal as a code the apps can translate — the `error` above is for support only */
  errorCode?: PaymentFailureCodeEnum;
  /** the amount the operator actually moved, when it tells — compared with the one requested */
  amount?: number;
};

/*
 * The mock keeps no state: its transaction reference carries the mode it was issued in and the
 * moment it confirms, so its status API can answer after a restart as a real operator would.
 */
const createMockReference = (mode: PaymentMockModeEnum, merchantReference?: string): string => {
  const confirmAt = Date.now() + (PAYMENT_MOCK_CONFIRM_SECONDS * 1000);

  // the merchant's own reference takes the place of the random part, as a real operator echoes it back
  return [MOCK_REFERENCE_PREFIX, mode, merchantReference ?? crypto.randomUUID(), confirmAt]
    .join(MOCK_REFERENCE_SEPARATOR);
};

/**
 * API to process payment from different payment providers
 * For now it's a mock that confirms every payment at once
 * @NOTE a PENDING answer is not a failure: the customer has not confirmed yet, and
 * `getPaymentStatusAPI` tells later what became of the transaction
 */
export const processPaymentAPI = async ({
  amount,
  currency = DEFAULT_CURRENCY,
  source,
  destination,
  description,
  paymentType,
  reference,
}: PaymentProcessInput): Promise<PaymentOutput> => {
  const mode = PaymentMockModeEnum.SYNC;

  logger.info('Start process payment', {
    amount,
    currency,
    source: maskPhone(source),
    destination: maskPhone(destination),
    description,
    paymentType,
    mode,
  });

  try {
    // Simulate a delay for the payment processing
    await wait(200);
    const paymentService = getPaymentServiceByPhoneNumber(source);

    /*
     * A real gateway (MVola/Orange/Airtel) issues its own transaction reference per call, so the
     * `paymentIntentId` unique index only catches a transaction recorded twice, never a payment
     * sent twice: that is the job of the merchant `reference` sent along (the payment's id) and of
     * the `idempotencyKey` stored on the payment (see db-indexes.ts).
     */
    const paymentResponse = {
      id: createMockReference(mode, reference),
      amount,
      currency,
      description,
      source,
      destination,
    };
    const status = mode === PaymentMockModeEnum.SYNC
      ? ProviderPaymentStatusEnum.SUCCESS
      : ProviderPaymentStatusEnum.PENDING;

    logger.info(`Payment processed: ${status}`, {
      ...paymentResponse,
      source: maskPhone(source),
      destination: maskPhone(destination),
    });

    return {
      status,
      error: '',
      paymentType,
      service: paymentService || 'unknown',
      ...paymentResponse,
    };
  }
  catch (error) {
    logger.error('Payment processing failed', { error: (error as Error).message });

    return {
      status: ProviderPaymentStatusEnum.FAILED,
      paymentType,
      error: (error as Error).message,
      /*
       * the only thing that throws before the operator is reached is the routing of the number:
       * a prefix belonging to no mobile money service the platform can pay through
       */
      errorCode: PaymentFailureCodeEnum.UNKNOWN_SERVICE,
    };
  }
};

/**
 * Asks the operator what became of one of its transactions — the reconciliation job's only source
 * of truth, and the check a webhook is always confirmed with before anything is settled on it.
 * @param reference the operator's own transaction reference, as `processPaymentAPI` returned it
 */
export const getPaymentStatusAPI = async (reference: string): Promise<ProviderPaymentStatusOutput> => {
  await wait(50);

  const [prefix, mode, , confirmAt] = reference.split(MOCK_REFERENCE_SEPARATOR);

  if (prefix !== MOCK_REFERENCE_PREFIX) {
    return {
      status: ProviderPaymentStatusEnum.FAILED,
      error: `Unknown transaction ${reference}`,
      errorCode: PaymentFailureCodeEnum.OUTCOME_UNKNOWN,
    };
  }

  if (mode === PaymentMockModeEnum.TIMEOUT || Date.now() < Number(confirmAt)) {
    return { status: ProviderPaymentStatusEnum.PENDING };
  }

  if (mode === PaymentMockModeEnum.ASYNC_DECLINE) {
    return {
      status: ProviderPaymentStatusEnum.FAILED,
      error: 'Declined by the customer',
      errorCode: PaymentFailureCodeEnum.DECLINED_BY_CUSTOMER,
    };
  }

  return { status: ProviderPaymentStatusEnum.SUCCESS };
};
