import { PaymentStatusEnum, PaymentTypeEnum } from '@shared/types';
import { ComponentType, ReactNode } from 'react';

import { StatusDotColor } from '@/components/StatusDot';
import i18n from '@/config/i18n';
import { defaultUserPointerFields } from '@/constants/_core/app.constants';
import {
  paymentServiceOptions, paymentStatusOptions, paymentTypeOptions,
  PAYMENT_SERVICE_FAILING_RATE, PAYMENT_SERVICE_HEALTHY_RATE,
  RETRYABLE_PAYMENT_STATUSES, RETRYABLE_PAYMENT_TYPES,
} from '@/constants/_core/payment.constants';
import { IPreviewSection, ITableHeadCell } from '@/types/_core/app.type';
import {
  IPayment, IPaymentServiceHealth, PaymentService, PaymentStatus, PaymentType,
} from '@/types/_core/payment.type';
import { IPhone, IUser } from '@/types/_core/user.type';

// the authors of the history: each status the payment reached, and the last retry
const basePaymentIncludes: string[] = [
  'successBy', 'failedBy', 'pendingBy', 'retriedBy', ...defaultUserPointerFields,
];
const extraPaymentIncludes: string[] = [];

export const registerPaymentIncludes = (includes: string[]): void => {
  extraPaymentIncludes.push(...includes);
};

export const getPaymentIncludes = (): string[] => [...basePaymentIncludes, ...extraPaymentIncludes];

export const getPaymentTypeLabel = (type: PaymentType): string => {
  const option = paymentTypeOptions.find(option => option.value === type);

  return option?.label || '';
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const option = paymentStatusOptions.find(option => option.value === status);

  return option?.label || '';
};

export const getPaymentServiceLabel = (service?: PaymentService): string => {
  const option = paymentServiceOptions.find(option => option.value === service);

  return option?.label || '';
};

/**
 * The state of a payment as a tone.
 */
export const getPaymentStatusColor = (status: PaymentStatus): StatusDotColor => {
  switch (status) {
    case PaymentStatusEnum.SUCCESS:
      return 'success';
    case PaymentStatusEnum.FAILED:
      return 'error';
    case PaymentStatusEnum.PENDING:
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * The reference an operator quotes for one movement of money — the object id, which is what the
 * gateway's own `paymentIntentId` is reconciled against when there is one.
 */
export const getPaymentReference = (payment: IPayment): string => (
  payment.paymentIntentId || payment.id
);

/**
 * Whether the money is coming into the platform or leaving it. Every rule about what can be done
 * to a payment turns on this, so it is asked once here rather than by comparing the type in each
 * place that needs it.
 */
export const isPaymentCollection = (payment: IPayment): boolean => (
  payment.type === PaymentTypeEnum.PASSENGER_TO_APP
);

/**
 * Whether the back-office can send this payment to the operator again. A payout is issued by the
 * back-office against the merchant account, so replaying it is legitimate. A collection is debited
 * from the passenger's own account and needs their PIN — no amount of retrying from here can
 * produce that, so the action is not offered on those rows rather than offered and failing.
 */
export const canRetryPayment = (payment: IPayment): boolean => (
  RETRYABLE_PAYMENT_TYPES.includes(payment.type) &&
  RETRYABLE_PAYMENT_STATUSES.includes(payment.status)
);

/**
 * How much of this payment is still to be given back. A collection can be refunded in several
 * goes — a seat dropped, then the rest of the journey — so what is left is the amount less
 * whatever has already gone back, not a yes or no.
 */
export const getRefundableAmount = (payment: IPayment): number => (
  payment.amount - (payment.refundedAmount ?? 0)
);

/** Whether any of this payment has already been given back. */
export const isPartiallyRefunded = (payment: IPayment): boolean => (
  (payment.refundedAmount ?? 0) > 0
);

/**
 * The commission rate a payout was computed from, written so the amount next to it adds up.
 *
 * The stored rate is the driver's **tier** rate, while the amount kept is that rate multiplied by
 * the surcharge their cancellations add — so a payout showed "9 100 Ar (13 %)" on a 70 000 Ar fare
 * and support was asked to explain an arithmetic error that was not one. The multiplier is written
 * next to the rate whenever there is one.
 *
 * Returns `undefined` when no rate was recorded — a collection, or a payout from before the field
 * existed — rather than a label reading "(undefined%)", which is what the wallet used to print.
 */
export const getCommissionRateLabel = (payment: Pick<
  IPayment, 'commissionRate' | 'commissionMultiplier'
>): string | undefined => {
  const { commissionRate, commissionMultiplier } = payment;

  if (commissionRate === undefined) return undefined;

  if (commissionMultiplier === undefined || commissionMultiplier === 1) {
    return i18n.t('user:payments.commissionRateValue', { rate: commissionRate });
  }

  return i18n.t('user:payments.commissionWithSurcharge', {
    rate: commissionRate,
    multiplier: commissionMultiplier,
  });
};

/**
 * Whether this payment can still be given back, in whole or in part. Only a passenger collection
 * that actually settled: the money is sitting on the merchant account and can be sent back to the
 * account it came from.
 *
 * Not a payout — once it has arrived on a driver's own mobile money account the operator gives the
 * platform no way to debit them back, and the real remedy is an adjustment on their next payout.
 * Not one with nothing left to give back either.
 */
export const canRefundPayment = (payment: IPayment): boolean => (
  isPaymentCollection(payment) &&
  payment.status === PaymentStatusEnum.SUCCESS &&
  getRefundableAmount(payment) > 0
);

/**
 * The person the platform is dealing with on this payment, and the mobile money account the money
 * reached them at. On a collection that is the payer and the account it was debited from; on a
 * payout, the receiver and the account it was sent to. The other side of both is the platform's
 * own merchant account, which names no one and is the same on every row.
 */
export const getPaymentCounterparty = (
  payment: IPayment
): { user?: IUser; phone: IPhone } => (isPaymentCollection(payment)
  ? { user: payment.payer, phone: payment.source }
  : { user: payment.receiver, phone: payment.destination });

const getPaymentSideLabel = (side: 'passenger' | 'app' | 'driver'): string => (
  i18n.t(`user:payments.flow.${side}`)
);

/** Where the money comes from and where it goes, as the two ends an operator reads first. */
export const getPaymentFlow = (payment: IPayment): { from: string; to: string } => {
  switch (payment.type) {
    case PaymentTypeEnum.APP_TO_DRIVER:
      return { from: getPaymentSideLabel('app'), to: getPaymentSideLabel('driver') };
    case PaymentTypeEnum.DRIVER_TO_APP:
      return { from: getPaymentSideLabel('driver'), to: getPaymentSideLabel('app') };
    case PaymentTypeEnum.APP_TO_PASSENGER:
      return { from: getPaymentSideLabel('app'), to: getPaymentSideLabel('passenger') };
    case PaymentTypeEnum.PASSENGER_TO_APP:
    default:
      return { from: getPaymentSideLabel('passenger'), to: getPaymentSideLabel('app') };
  }
};

/**
 * How much of a collection has gone back: `partial` while some of it is still owed, `full` once
 * nothing is. Nothing for a payment no one has refunded, or for anything but a collection.
 */
export const getPaymentRefundState = (payment: IPayment): 'partial' | 'full' | undefined => {
  if (!isPaymentCollection(payment) || !isPartiallyRefunded(payment)) return undefined;

  return getRefundableAmount(payment) > 0 ? 'partial' : 'full';
};

/**
 * How many times the payment was sent to the operator. A retry rewrites the same row and only
 * bumps its counter, so a row with no counter was sent once — or retried before the counter
 * existed, which cannot be told apart.
 */
export const getPaymentAttemptsCount = (payment: IPayment): number => 1 + (payment.retryCount ?? 0);

/** Share of an operator's traffic that settled, as a whole percentage. */
export const getPaymentServiceSuccessRate = (health: IPaymentServiceHealth): number => (
  health.total > 0
    ? Math.round((health.success / health.total) * 100)
    : 0
);

/**
 * How an operator is behaving, as the tone its figures are read in. An operator with no traffic at
 * all is neutral rather than failing: a rate of zero out of zero says nothing went wrong, it says
 * nothing went through it.
 */
export const getPaymentServiceHealthColor = (
  health: IPaymentServiceHealth
): StatusDotColor => {
  if (health.total === 0) return 'default';

  const rate = getPaymentServiceSuccessRate(health);

  if (rate >= PAYMENT_SERVICE_HEALTHY_RATE) return 'success';
  if (rate >= PAYMENT_SERVICE_FAILING_RATE) return 'warning';

  return 'error';
};

/**
 * What a business domain adds to the generic payment page: a block above the sections (where the
 * money it settles stands), banners of its own, blocks for the "related records" section and whole
 * sections. A payment is a core concern that any transactional domain settles through, so the core
 * page renders one without knowing which domains exist.
 */
export type PaymentPageExtension = {
  summary?: ReactNode;
  banners?: ReactNode[];
  linked?: ReactNode[];
  // placed after the related records, before the parties
  sections?: IPreviewSection[];
};

/*
 * a hook rather than components: a section contributed this way states a figure on the summary rail
 * (the failed sends) before it is opened, so its data has to be read at page level
 */
// called before the page knows it has a payment to show, so it has to cope with none
export type PaymentPageExtensionHook = (payment: IPayment | undefined) => PaymentPageExtension;

const noPaymentPageExtension: PaymentPageExtensionHook = () => ({});

let paymentPageExtensionHook: PaymentPageExtensionHook = noPaymentPageExtension;

/**
 * Registered once, at module load, by the one domain that settles through payments. It is called on
 * every render of the page, so it has to be set before the page first renders and never swapped.
 */
export const registerPaymentPageExtension = (hook: PaymentPageExtensionHook): void => {
  paymentPageExtensionHook = hook;
};

export const getPaymentPageExtensionHook = (): PaymentPageExtensionHook => paymentPageExtensionHook;

/**
 * Open registry: extra columns for the generic payments list (`pages/payments/Payments.tsx`) —
 * lets a domain (ride/request) contribute columns without the list importing domain-specific
 * payment fields directly.
 */
export type PaymentListColumn = {
  headCell: ITableHeadCell<string>;
  Component: ComponentType<{ payment: IPayment }>;
  order?: number;
};

const paymentListColumns: PaymentListColumn[] = [];

export const registerPaymentListColumn = (column: PaymentListColumn): void => {
  paymentListColumns.push(column);
};

export const getPaymentListColumns = (): PaymentListColumn[] =>
  [...paymentListColumns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/**
 * Open registry: one more fact stated in the band a ledger row opens onto. A payment settles
 * something a business domain owns (a booking, a ride), and naming that thing is exactly what the
 * operator needs to decide on the row — but the core ledger cannot know which domains exist.
 */
export type PaymentRowDetailFact = {
  label: string;
  Component: ComponentType<{ payment: IPayment }>;
  order?: number;
};

const paymentRowDetailFacts: PaymentRowDetailFact[] = [];

export const registerPaymentRowDetailFact = (fact: PaymentRowDetailFact): void => {
  paymentRowDetailFacts.push(fact);
};

export const getPaymentRowDetailFacts = (): PaymentRowDetailFact[] =>
  [...paymentRowDetailFacts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/**
 * Open registry: one more action offered on an opened ledger row — following a payment back to the
 * booking it settles, say. Registered rather than imported, for the same reason as the facts above.
 */
export type PaymentRowDetailAction = {
  Component: ComponentType<{ payment: IPayment }>;
  order?: number;
};

const paymentRowDetailActions: PaymentRowDetailAction[] = [];

export const registerPaymentRowDetailAction = (action: PaymentRowDetailAction): void => {
  paymentRowDetailActions.push(action);
};

export const getPaymentRowDetailActions = (): PaymentRowDetailAction[] =>
  [...paymentRowDetailActions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
