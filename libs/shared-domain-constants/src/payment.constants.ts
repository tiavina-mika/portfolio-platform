import { PaymentKindEnum } from '@shared/domain-types';

/**
 * The one payment schedule of every accepted quote, in the order the payments fall due: 30 % on
 * acceptance, 40 % at a milestone, 30 % at the end. A constant, not a field: no quote has a schedule of
 * its own. The percents add up to 100, and the last part absorbs the rounding of the others.
 */
export const QUOTE_PAYMENT_SCHEDULE = [
  { kind: PaymentKindEnum.DEPOSIT, percent: 30 },
  { kind: PaymentKindEnum.MILESTONE, percent: 40 },
  { kind: PaymentKindEnum.BALANCE, percent: 30 },
] as const;

// the longest transfer reference a payment may hold: the back-office form refuses it before the server
export const PAYMENT_REFERENCE_MAX_LENGTH = 200;
