import { COUNTRIES, type CountryCode } from '@shared/constants';
import { PENDING_PAYMENT_TIMEOUT_MINUTES } from '@shared/domain-constants';
import { PaymentServiceEnum } from '@shared/types';

import type { Phone } from '@/types/app.type';

// dial codes are stored bare ('261')
const MG_DIAL_CODE = COUNTRIES.MG.dialCode.replace('+', '');

/*
 * shared with the back-office, which writes it into the copy explaining what an overdue payment is
 */
export { PENDING_PAYMENT_TIMEOUT_MINUTES };

/**
 * Waits between two checks of a payment still waiting for its operator, one entry per check; past
 * the last one, every check waits as long as the last. The first ones come quickly because a
 * customer usually confirms within a minute or two of the prompt reaching their phone.
 */
export const PAYMENT_RECONCILIATION_DELAYS_MINUTES = [1, 2, 5] as const;

/**
 * How long a claim on a payment being settled holds. A claim older than this belongs to a call that
 * died midway, and the reconciliation job may take the payment over.
 */
export const PAYMENT_SETTLEMENT_LOCK_MINUTES = 5;

/**
 * How many times the follow-up of a payment is resumed before the reconciliation job gives it up:
 * a follow-up that keeps failing needs somebody to read its error, not a sixth identical attempt.
 */
export const PAYMENT_SETTLEMENT_MAX_ATTEMPTS = 5;

/**
 * How long the operator keeps being asked about a payment declared failed on its deadline: a
 * customer who confirms late is debited without anyone knowing, so the answer is read until it is
 * final or this window closes.
 */
export const PAYMENT_LATE_CHECK_WINDOW_HOURS = 24;

/** Minimum gap between two late checks of one payment, so the 2-minute job does not hammer the operator */
export const PAYMENT_LATE_CHECK_INTERVAL_MINUTES = 10;

/**
 * Seconds before the mock gateway confirms a payment in its asynchronous modes — how long a
 * customer would take to type their code. `PAYMENT_MOCK_CONFIRM_SECONDS` overrides it.
 */
export const PAYMENT_MOCK_CONFIRM_SECONDS = 5;

/**
 * The platform's own receiving number on each mobile money service, per country (ISO code): a
 * member pays the platform on the service of their own number. Server-side only — the apps never
 * need it, the gateway does.
 */
export const APP_PAYMENT_PHONES = {
  MG: {
    [PaymentServiceEnum.YAS]: { code: MG_DIAL_CODE, number: '340000000' },
    [PaymentServiceEnum.ORANGE]: { code: MG_DIAL_CODE, number: '320000000' },
    [PaymentServiceEnum.AIRTEL]: { code: MG_DIAL_CODE, number: '330000000' },
  },
} as const satisfies Partial<Record<CountryCode, Record<PaymentServiceEnum, Phone>>>;

/**
 * Label for a payment whose mobile money service is not known — the gateway could not tell the
 * operator from the phone number, or the row predates the `service` column.
 */
export const UNKNOWN_PAYMENT_SERVICE = 'unknown';

/**
 * Waits between the automatic retries of a payment the platform owes and could not send (a
 * late-cancellation compensation, a refund of a booking already cancelled), one entry per retry:
 * the first comes an hour after the failure, the last a day after the one before. Spaced out so an
 * operator outage of a few hours does not burn every attempt; once they are all spent, the owners
 * are e-mailed and the payment waits for a manual retry from the back-office.
 */
export const PLATFORM_PAYMENT_RETRY_DELAYS_HOURS = [1, 6, 24] as const;

/** Back-office path of a payment (`<server>/<path>/<paymentId>`), linked from the admins' e-mail */
export const PAYMENT_BO_PATH = 'paiements';
