import { PaymentServiceEnum, PaymentStatusEnum, PaymentTypeEnum } from '@shared/types';

import { collections } from '@/constants/_core/constants';
import { resolveScopedCountry } from '@/utils/_core/agent-context.utils';

/**
 * Operators the ledger reports on, in the order the summary band shows them. A payment carrying
 * no `service` yet (created before the field existed, or still being routed) has no column of its
 * own: it is counted in the totals but not attributed to an operator that did not handle it.
 */
const LEDGER_SERVICES = [
  PaymentServiceEnum.YAS,
  PaymentServiceEnum.ORANGE,
  PaymentServiceEnum.AIRTEL,
];

/**
 * The two directions the quick filters split the ledger by. The other two types exist but are not
 * a filter of their own: a refund to a passenger and a driver's payment into the app are both rare
 * enough that a tab for each would be a tab that is almost always empty.
 */
const LEDGER_TYPES = [PaymentTypeEnum.PASSENGER_TO_APP, PaymentTypeEnum.APP_TO_DRIVER];

/**
 * Which way the money goes, for the one figure that has to net them: what passengers paid in
 * against what the platform paid back out, in payouts to drivers and in refunds to passengers.
 * A refund is money leaving the merchant account — counted as income it would make the platform
 * look richer every time it gave some back.
 */
const INFLOW_TYPES: string[] = [PaymentTypeEnum.PASSENGER_TO_APP, PaymentTypeEnum.DRIVER_TO_APP];

/**
 * How many distinct failure reasons the "failure reason" filter offers. The list is what an
 * operator picks from, not an exhaustive catalogue — an unbounded distinct over the whole
 * collection would grow with every new gateway message.
 */
const MAX_FAILURE_REASONS = 30;

export type PaymentServiceHealth = {
  service: string;
  total: number;
  success: number;
  pending: number;
  failed: number;
  /** Amount actually settled through this operator — both directions, hence "succeeded" and not "collected". */
  successAmount: number;
};

export type PaymentLedgerSummary = {
  /** ISO 4217 code every amount of the summary is in */
  currency: string;
  total: number;
  /**
   * What the platform is actually holding: everything that was paid in, less the payouts and
   * refunds that were paid back out. Settled payments only — a pending one has not moved yet.
   */
  netAmount: number;
  /** Amount stuck on failed payments — what the failures are worth, not how many there are. */
  failedAmount: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byService: PaymentServiceHealth[];
  failureReasons: string[];
};

type TypeStatusGroup = {
  objectId?: { type?: string | null; status?: string | null };
  _id?: { type?: string | null; status?: string | null };
  count: number;
  amount: number;
};

type ServiceStatusGroup = {
  objectId?: { service?: string | null; status?: string | null };
  _id?: { service?: string | null; status?: string | null };
  count: number;
  amount: number;
};

/**
 * Reads a grouped key back off an aggregate row. The adapter returns the group key as `objectId`
 * on a Parse aggregate and as `_id` on a raw one, so both are read rather than one being assumed.
 */
const readGroupKey = <T>(group: { objectId?: T; _id?: T }): T | undefined => (
  group.objectId ?? group._id
);

const isVisiblePaymentMatch = { deleted: { $ne: true } };

/**
 * The ledger broken down by direction and status at once, with what each cell is worth. Every
 * figure the band and the tabs show comes off this one read: how many payments are in each status,
 * how many in each direction, and — because it needs the two together — what the platform is
 * actually holding once the money it paid back out is taken off what it took in.
 *
 * The amount matters as much as the count: ten failed payments of 500 Ar and one of 500 000 Ar are
 * the same figure in a status breakdown and two completely different mornings for an operator.
 */
const aggregateByTypeAndStatus = async (currency: string): Promise<TypeStatusGroup[]> => {
  const pipeline = [
    { $match: { ...isVisiblePaymentMatch, currency } },
    {
      $group: {
        _id: { type: '$type', status: '$status' },
        count: { $sum: 1 },
        amount: { $sum: '$amount' },
      },
    },
  ];

  return new Parse.Query(collections.Payment).aggregate(pipeline as any);
};

/**
 * Operator health, grouped on operator and status at once rather than queried per pair: the band
 * shows a success rate, a settled amount and a failure count for each operator, which is twelve
 * figures that all come off the same three columns.
 */
const aggregateByServiceAndStatus = async (currency: string): Promise<ServiceStatusGroup[]> => {
  const pipeline = [
    { $match: { ...isVisiblePaymentMatch, currency } },
    {
      $group: {
        _id: { service: '$service', status: '$status' },
        count: { $sum: 1 },
        amount: { $sum: '$amount' },
      },
    },
  ];

  return new Parse.Query(collections.Payment).aggregate(pipeline as any);
};

/**
 * The failure messages the gateway has actually produced, which is what the filter has to offer —
 * a hardcoded list would go stale the moment an operator changes its wording.
 */
const aggregateFailureReasons = async (currency: string): Promise<string[]> => {
  const pipeline = [
    {
      $match: {
        ...isVisiblePaymentMatch,
        currency,
        status: PaymentStatusEnum.FAILED,
        failureReason: { $nin: [null, ''] },
      },
    },
    { $group: { _id: '$failureReason', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: MAX_FAILURE_REASONS },
  ];

  const groups: { objectId?: unknown; _id?: unknown }[] = await new Parse.Query(
    collections.Payment
  ).aggregate(pipeline as any);

  return groups
    .map((group) => readGroupKey<unknown>(group))
    .filter((reason): reason is string => typeof reason === 'string' && reason.length > 0);
};

const buildServiceHealth = (
  groups: ServiceStatusGroup[]
): PaymentServiceHealth[] => LEDGER_SERVICES.map((service) => {
  const rows = groups.filter((group) => readGroupKey(group)?.service === service);
  const countOf = (status: PaymentStatusEnum): number => (
    rows.find((row) => readGroupKey(row)?.status === status)?.count ?? 0
  );

  return {
    service,
    total: rows.reduce((sum, row) => sum + row.count, 0),
    success: countOf(PaymentStatusEnum.SUCCESS),
    pending: countOf(PaymentStatusEnum.PENDING),
    failed: countOf(PaymentStatusEnum.FAILED),
    successAmount: rows
      .filter((row) => readGroupKey(row)?.status === PaymentStatusEnum.SUCCESS)
      .reduce((sum, row) => sum + row.amount, 0),
  };
});

/**
 * Everything the payments list states above its rows: what the ledger is worth, how it splits
 * across statuses and directions, how each mobile money operator is behaving, and which failure
 * messages the filter can offer. Read apart from the page of rows so the figures describe the
 * whole ledger and stay put while the rows under them are narrowed.
 */
export const getPaymentLedgerSummary = async (country?: string): Promise<PaymentLedgerSummary> => {
  const { currency } = resolveScopedCountry(country);
  const [typeStatusGroups, serviceGroups, failureReasons] = await Promise.all([
    aggregateByTypeAndStatus(currency),
    aggregateByServiceAndStatus(currency),
    aggregateFailureReasons(currency),
  ]);

  const sumWhere = (
    predicate: (key: { type?: string | null; status?: string | null }) => boolean,
    field: 'count' | 'amount'
  ): number => typeStatusGroups
    .filter((group) => predicate(readGroupKey(group) ?? {}))
    .reduce((sum, group) => sum + group[field], 0);

  const settled = (key: { status?: string | null }): boolean => (
    key.status === PaymentStatusEnum.SUCCESS
  );

  return {
    currency,
    total: typeStatusGroups.reduce((sum, group) => sum + group.count, 0),
    /*
     * paid in, less paid back out — a payout to a driver and a refund to a passenger both leave the
     * merchant account, and adding them to what came in would make a refund read as income
     */
    netAmount: sumWhere((key) => settled(key) && INFLOW_TYPES.includes(key.type ?? ''), 'amount') -
      sumWhere((key) => settled(key) && !INFLOW_TYPES.includes(key.type ?? ''), 'amount'),
    failedAmount: sumWhere((key) => key.status === PaymentStatusEnum.FAILED, 'amount'),
    byStatus: Object.fromEntries(
      Object.values(PaymentStatusEnum).map((status) => [
        status,
        sumWhere((key) => key.status === status, 'count'),
      ])
    ),
    /*
     * every status, not just the settled ones: the tab shows how many collections there are to
     * work through, and the failed ones are the whole reason anyone opens it
     */
    byType: Object.fromEntries(
      LEDGER_TYPES.map((type) => [type, sumWhere((key) => key.type === type, 'count')])
    ),
    byService: buildServiceHealth(serviceGroups),
    failureReasons,
  };
};
