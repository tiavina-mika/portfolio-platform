import crypto from 'crypto';

import { PaymentFailureCodeEnum } from '@shared/types';

import type {
  PaymentProcessInput, PaymentOutput,
} from '@/types/payment.type';

import { DEFAULT_CURRENCY, FORCE_PROD, IS_PROD } from '@/constants/_core/constants';
import { PAYMENT_MOCK_CONFIRM_SECONDS } from '@/constants/_core/payment.constants';
import { PaymentMockModeEnum, ProviderPaymentStatusEnum } from '@/types/payment.type';
import { logger } from '@/utils/_core/logger';
import { getPaymentServiceByPhoneNumber } from '@/utils/_core/payment.utils';
import { maskPhone } from '@/utils/_core/pii.utils';
import { wait } from '@/utils/_core/utils';

/** True while `processPaymentAPI` is the simulation: set to false once a real operator replaces it */
export const IS_PAYMENT_GATEWAY_MOCK = true;

/**
 * A simulated gateway confirms every payment without moving a single ariary: it must never serve
 * production traffic unless somebody chose that explicitly, with `ALLOW_MOCK_PAYMENT_GATEWAY=true`.
 * Pre-production is out of scope: its end-to-end tests run on the simulation.
 */
export const assertPaymentGatewayIsReal = ({
  isMock = IS_PAYMENT_GATEWAY_MOCK,
  isProduction = IS_PROD || FORCE_PROD,
  isMockAllowed = process.env.ALLOW_MOCK_PAYMENT_GATEWAY === 'true',
} = {}): void => {
  if (isMock && isProduction && !isMockAllowed) {
    throw new Error('The payment gateway is a simulation: refusing to start in production');
  }
};

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

/**
 * Read at every call rather than once at startup, so a test can switch the gateway's behaviour
 * without restarting the server. An unknown value falls back to the synchronous behaviour.
 */
const getMockMode = (): PaymentMockModeEnum => {
  const mode = process.env.PAYMENT_MOCK_MODE as PaymentMockModeEnum | undefined;

  return mode && Object.values(PaymentMockModeEnum).includes(mode) ? mode : PaymentMockModeEnum.SYNC;
};

const getMockConfirmSeconds = (): number => {
  const seconds = Number(process.env.PAYMENT_MOCK_CONFIRM_SECONDS);

  return Number.isFinite(seconds) && seconds >= 0 ? seconds : PAYMENT_MOCK_CONFIRM_SECONDS;
};

/*
 * The mock keeps no state: its transaction reference carries the mode it was issued in and the
 * moment it confirms, so its status API can answer after a restart as a real operator would.
 */
const createMockReference = (mode: PaymentMockModeEnum, merchantReference?: string): string => {
  const confirmAt = Date.now() + (getMockConfirmSeconds() * 1000);

  // the merchant's own reference takes the place of the random part, as a real operator echoes it back
  return [MOCK_REFERENCE_PREFIX, mode, merchantReference ?? crypto.randomUUID(), confirmAt]
    .join(MOCK_REFERENCE_SEPARATOR);
};

/**
 * API to process payment from different payment providers
 * For now it's a mock: see PaymentMockModeEnum for how it answers
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
  const mode = getMockMode();

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
