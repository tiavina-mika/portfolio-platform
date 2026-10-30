import { PaymentServiceEnum, PaymentStatusEnum, PaymentTypeEnum } from '@shared/types';
import { capitalize } from 'string-ts';


import i18n from '@/config/i18n';
import { defaultTabOptions } from '@/constants/_core/app.constants';
import { DefaultMUIColorType, IListTabValue, ISelectOption } from '@/types/_core/app.type';
import { PaymentStatus, PaymentType } from '@/types/_core/payment.type';

export const paymentTypeOptions: ISelectOption<PaymentTypeEnum>[] = [
  { label: i18n.t('user:payments.passengerToApp'), value: PaymentTypeEnum.PASSENGER_TO_APP },
  { label: i18n.t('user:payments.appToDriver'), value: PaymentTypeEnum.APP_TO_DRIVER },
  { label: i18n.t('user:payments.driverToApp'), value: PaymentTypeEnum.DRIVER_TO_APP },
  { label: i18n.t('user:payments.appToPassenger'), value: PaymentTypeEnum.APP_TO_PASSENGER },
];

export const paymentStatusOptions: ISelectOption<PaymentStatusEnum>[] = [
  { label: i18n.t('user:payments.success'), value: PaymentStatusEnum.SUCCESS },
  { label: i18n.t('user:payments.failed'), value: PaymentStatusEnum.FAILED },
  { label: i18n.t('user:payments.pending'), value: PaymentStatusEnum.PENDING },
];

/**
 * synthetic notification badge key for failed payments — not a real Parse class name (unlike
 * NOTIFICATION_COLLECTIONS entries), it's a `status: failed`-filtered subset of the `Payment`
 * collection, tracked as its own badge entry so a failed payment doesn't get lost in the generic
 * "seen: false" payment count (see §8.2 of the notifications audit)
 */
export const PAYMENT_FAILED_NOTIFICATION_KEY = 'paymentFailed';

/**
 * "failed" tab — a `status`-keyed tab alongside the generic `seen`/`deleted` ones, used both by
 * the Payments list page and by the failed-payments badge navigation (NotificationCenter)
 */
export const failedPaymentsTabOption: IListTabValue = {
  label: capitalize(i18n.t('route:tabs.failed')),
  tab: i18n.t('route:tabs.failed'),
  key: 'status',
  // both status tabs scope the same field, so each states which figure of the counts is its own
  countKey: PaymentStatusEnum.FAILED,
  value: PaymentStatusEnum.FAILED,
};

/**
 * "in progress" tab — the payments whose operator has not answered yet. They call for no action
 * (the reconciliation job settles them, and fails them at their deadline), but an operator working
 * the ledger has to see how many are in flight before reading anything into the failures.
 */
export const pendingPaymentsTabOption: IListTabValue = {
  label: i18n.t('user:payments.pending'),
  tab: i18n.t('route:tabs.pending'),
  key: 'status',
  countKey: PaymentStatusEnum.PENDING,
  value: PaymentStatusEnum.PENDING,
};

/**
 * The two directions money moves through the platform, offered as tabs because an operator works
 * one of them at a time: a collection that failed is the passenger's problem to be told about, a
 * payout that failed is a driver still waiting to be paid.
 *
 * Both scope the same `type` field, so each states which figure of the tab counts is its own —
 * without `countKey` they would share the `type` entry and show the same total.
 */
export const paymentDirectionTabOptions: IListTabValue[] = [
  {
    label: i18n.t('user:payments.collections'),
    tab: i18n.t('route:tabs.collections'),
    key: 'type',
    countKey: PaymentTypeEnum.PASSENGER_TO_APP,
    value: PaymentTypeEnum.PASSENGER_TO_APP,
  },
  {
    label: i18n.t('user:payments.payouts'),
    tab: i18n.t('route:tabs.payouts'),
    key: 'type',
    countKey: PaymentTypeEnum.APP_TO_DRIVER,
    value: PaymentTypeEnum.APP_TO_DRIVER,
  },
];

/** How many charged bookings left pending the "to settle" band reads — a handful, never a backlog */
export const CHARGED_PENDING_BOOKINGS_LIMIT = 20;

/*
 * the direction tabs come before the generic ones: they are what the ledger is worked through,
 * where "new" and the recycle bin qualify any list in the back-office
 */
export const paymentsTabOptions: IListTabValue[] = [
  ...paymentDirectionTabOptions,
  pendingPaymentsTabOption,
  failedPaymentsTabOption,
  ...defaultTabOptions,
];

export const paymentServiceOptions: ISelectOption<PaymentServiceEnum>[] = [
  { label: i18n.t('user:payments.services.mvola'), value: PaymentServiceEnum.YAS },
  { label: i18n.t('user:payments.services.orange-money'), value: PaymentServiceEnum.ORANGE },
  { label: i18n.t('user:payments.services.airtel-money'), value: PaymentServiceEnum.AIRTEL },
];

/**
 * Success rate above which an operator is reported as healthy, and the rate under which it is
 * reported as failing. Between the two it is drawn as degraded — an operator settling four
 * payments out of five is not broken, but it is not something to look away from either.
 */
export const PAYMENT_SERVICE_HEALTHY_RATE = 80;
export const PAYMENT_SERVICE_FAILING_RATE = 50;

/**
 * The statuses whose share of an operator's traffic is drawn in the health bar, in the order the
 * segments are laid out.
 */
export const PAYMENT_SERVICE_BAR_STATUSES = [
  PaymentStatusEnum.SUCCESS,
  PaymentStatusEnum.PENDING,
  PaymentStatusEnum.FAILED,
] as const;

/**
 * Which direction of a payment the back-office is able to send again. A payout leaves the merchant
 * account on an order the back-office itself issues, so replaying it is legitimate. A collection is
 * debited from the passenger's own mobile money account and needs their PIN — the back-office
 * cannot replay that debit, so no retry is offered on those rows at all.
 */
export const RETRYABLE_PAYMENT_TYPES: PaymentType[] = [PaymentTypeEnum.APP_TO_DRIVER];

/**
 * Statuses a payout can be sent again from — a settled one has nothing to retry, and a
 * pending one has not been answered by its operator yet: the reconciliation job settles it, and
 * sending it again meanwhile would pay the driver a second time (the server refuses it too).
 */
export const RETRYABLE_PAYMENT_STATUSES: PaymentStatus[] = [PaymentStatusEnum.FAILED];

// the events of a payment's own life, each one a `<event>At` / `<event>By` pair on the row
export const PAYMENT_HISTORY_FIELDS = ['created', 'pending', 'success', 'failed', 'retried'];

// a failure and a retry are what an operator looks for on the rail, so they carry the loud tones
export const PAYMENT_HISTORY_COLORS: Record<string, DefaultMUIColorType> = {
  created: 'default',
  pending: 'warning',
  success: 'success',
  failed: 'error',
  retried: 'warning',
};
