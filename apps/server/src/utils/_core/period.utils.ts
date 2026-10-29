import {
  endOfInZone, formatInZone, shiftInZone, startOfInZone, zonedTimeToInstant,
} from '@shared/utils';
import sumBy from 'lodash/sumBy.js';

import { STATISTICS_TIME_ZONE } from '@/constants/_core/statistics.constants';

export const STATISTICS_PERIODS = ['7d', '30d', '90d', '12m'] as const;
export type StatisticsPeriod = typeof STATISTICS_PERIODS[number];
export type StatisticsGranularity = 'day' | 'month';

export type StatisticsRange = {
  since: Date;
  granularity: StatisticsGranularity;
  bucketCount: number;
};

const STATISTICS_RANGE_BY_PERIOD: Record<
  StatisticsPeriod,
  { granularity: StatisticsGranularity; bucketCount: number }
> = {
  '7d': { granularity: 'day', bucketCount: 7 },
  '30d': { granularity: 'day', bucketCount: 30 },
  '90d': { granularity: 'day', bucketCount: 90 },
  '12m': { granularity: 'month', bucketCount: 12 },
};

/**
 * Resolves a URL-facing period preset into a concrete date range plus a bucket granularity
 * (day buckets for the short presets, month buckets for the 12-month one) and bucket count.
 * Days and months are the ones of `timeZone`, so a ride at 01:00 local counts on its own day.
 * @param period the preset
 * @param timeZone IANA zone the days/months are counted on
 * @param now the instant the range ends on (injectable for tests)
 */
export const resolveStatisticsPeriod = (
  period: StatisticsPeriod,
  timeZone: string = STATISTICS_TIME_ZONE,
  now: Date = new Date()
): StatisticsRange => {
  const { granularity, bucketCount } = STATISTICS_RANGE_BY_PERIOD[period];
  const oldestBucket = shiftInZone(now, timeZone, -(bucketCount - 1), granularity);

  return { since: startOfInZone(oldestBucket, timeZone, granularity), granularity, bucketCount };
};

export const bucketDateFormat = (granularity: StatisticsGranularity): string => (
  granularity === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM'
);

/**
 * Ordered list of bucket keys ('YYYY-MM-DD' or 'YYYY-MM') from oldest to newest, ending on
 * the current day/month of `timeZone` — shared by every domain statistics page so bucket keys line up.
 */
export const buildEmptyBucketRange = (
  { granularity, bucketCount }: StatisticsRange,
  timeZone: string = STATISTICS_TIME_ZONE,
  now: Date = new Date()
): string[] => {
  const format = bucketDateFormat(granularity);
  const range: string[] = [];

  for (let i = bucketCount - 1; i >= 0; i -= 1) {
    range.push(formatInZone(shiftInZone(now, timeZone, -i, granularity), timeZone, format));
  }

  return range;
};

export type StatisticsPreviousRange = { since: Date; until: Date };

/**
 * The period immediately preceding the current one, with the same length (7d -> previous 7d,
 * 12m -> previous 12m) — used to compute period-over-period comparisons.
 */
export const resolvePreviousStatisticsPeriod = (
  period: StatisticsPeriod,
  timeZone: string = STATISTICS_TIME_ZONE,
  now: Date = new Date()
): StatisticsPreviousRange => {
  const current = resolveStatisticsPeriod(period, timeZone, now);

  return {
    since: shiftInZone(current.since, timeZone, -current.bucketCount, current.granularity),
    until: current.since,
  };
};

export type StatisticsWindow = {
  range: StatisticsRange;
  previousRange: StatisticsPreviousRange;
  buckets: string[];
  /** bucket keys of the previous period, bucket i being the one a period before `buckets[i]` */
  previousBuckets: string[];
};

/**
 * Ordered bucket keys of the previous period, aligned by index with the current ones.
 * @param range the current range
 * @param previousRange the period right before it
 */
export const buildPreviousBucketRange = (
  range: StatisticsRange,
  previousRange: StatisticsPreviousRange,
  timeZone: string = STATISTICS_TIME_ZONE
): string[] => {
  const format = bucketDateFormat(range.granularity);

  return Array.from({ length: range.bucketCount }, (_, i) => formatInZone(
    shiftInZone(previousRange.since, timeZone, i, range.granularity),
    timeZone,
    format
  ));
};

/**
 * Everything a period statistics page needs at once: the current range, the previous range of the
 * same length it is compared with, and the ordered bucket keys of the chart.
 */
export const resolveStatisticsWindow = (
  period: StatisticsPeriod,
  timeZone: string = STATISTICS_TIME_ZONE,
  now: Date = new Date()
): StatisticsWindow => {
  const range = resolveStatisticsPeriod(period, timeZone, now);

  const previousRange = resolvePreviousStatisticsPeriod(period, timeZone, now);

  return {
    range,
    previousRange,
    buckets: buildEmptyBucketRange(range, timeZone, now),
    previousBuckets: buildPreviousBucketRange(range, previousRange, timeZone),
  };
};

/**
 * Last instant of a bucket — what a "state at the end of the bucket" metric (fleet age) is
 * measured at.
 * @param bucket a 'YYYY-MM-DD' or 'YYYY-MM' bucket key
 * @param granularity the granularity the key was built with
 * @param timeZone IANA zone the key was built on
 * @returns the end of that day or month, on the clock of `timeZone`
 */
export const bucketEndDate = (
  bucket: string,
  granularity: StatisticsGranularity,
  timeZone: string = STATISTICS_TIME_ZONE
): Date => {
  const firstInstant = zonedTimeToInstant(
    granularity === 'day' ? `${bucket} 00:00:00` : `${bucket}-01 00:00:00`,
    timeZone
  );

  return endOfInZone(firstInstant, timeZone, granularity);
};

export type PeriodComparison = {
  currentTotal: number;
  previousTotal: number;
  changePercent: number | null;
};

/**
 * changePercent is null when there is no previous-period baseline to compare against
 * (previousTotal === 0) — dividing by zero is meaningless, so the BO renders a "new activity"
 * state instead of a percentage in that case.
 */
export const buildPeriodComparison = (currentTotal: number, previousTotal: number): PeriodComparison => ({
  currentTotal,
  previousTotal,
  changePercent: previousTotal === 0
    ? null
    : Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10,
});

/**
 * Same fields as `PeriodComparison`, for a rate or an average that has no value at all when its
 * denominator is empty (no seat offered, no signup old enough to measure a retention on).
 */
export type NullablePeriodComparison = {
  currentTotal: number | null;
  previousTotal: number | null;
  changePercent: number | null;
};

/**
 * A missing side stays null instead of being read as 0: a retention nobody could be measured on is
 * not a 0 % retention, and a 0 would render as a fake drop of the whole previous value.
 */
export const buildNullablePeriodComparison = (
  currentTotal: number | null,
  previousTotal: number | null
): NullablePeriodComparison => {
  if (currentTotal === null || previousTotal === null) {
    return { currentTotal, previousTotal, changePercent: null };
  }

  return buildPeriodComparison(currentTotal, previousTotal);
};

/**
 * Percentage with one decimal, 0 when the denominator is empty — an empty bucket must render as
 * a flat 0 on the chart, never as NaN.
 */
export const toPercentRate = (numerator: number, denominator: number): number => (
  denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(1)) : 0
);

/**
 * Percentage with one decimal, null when the denominator is empty — for the rates whose "nothing to
 * measure" must stay distinguishable from a real 0 % (fill rate, retention, conversion).
 */
export const toPercentRateOrNull = (numerator: number, denominator: number): number | null => (
  denominator > 0 ? toPercentRate(numerator, denominator) : null
);

export const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;

/** Mean with one decimal, null when there is nothing to average. */
export const averageOrNull = (total: number, count: number): number | null => (
  count > 0 ? roundToOneDecimal(total / count) : null
);

/**
 * MongoDB `$dateToString` format matching `bucketDateFormat` for the same granularity, so a
 * statistics query that buckets in the database produces exactly the keys
 * `buildEmptyBucketRange` fills in.
 * @param granularity day or month buckets
 * @returns the Mongo date format string
 */
export const mongoBucketDateFormat = (granularity: StatisticsGranularity): string => (
  granularity === 'day' ? '%Y-%m-%d' : '%Y-%m'
);

/**
 * `$dateToString` expression turning a date column into the bucket key `buildEmptyBucketRange`
 * builds. The time zone is passed explicitly: bucket keys are formatted on the country's clock,
 * and Mongo defaults to UTC — a row saved just after local midnight would land a day early.
 * @param granularity day or month buckets
 * @param dateField `$`-prefixed storage path of the date column, e.g. `$_created_at`
 * @returns the Mongo expression
 */
export const mongoBucketDateExpression = (
  granularity: StatisticsGranularity,
  dateField: string
): Record<string, unknown> => ({
  $dateToString: {
    format: mongoBucketDateFormat(granularity),
    date: dateField,
    timezone: STATISTICS_TIME_ZONE,
  },
});

export type BucketPartition<T> = {
  /** rows of the buckets the chart shows, by bucket key */
  byBucket: Map<string, T>;
  /** rows of the previous period's buckets, by bucket key */
  previousByBucket: Map<string, T>;
  current: T[];
  previous: T[];
};

/**
 * Splits rows grouped by bucket key over [previous period start, now) into the buckets the chart
 * shows and the rows of the period before. Keys sort chronologically as strings, so any key older
 * than the first shown bucket belongs to the previous period — one aggregate then feeds both the
 * chart and its comparison instead of a second query per metric.
 * @param rows aggregate rows whose `_id` is a bucket key
 * @param buckets the ordered bucket keys of the current period
 * @returns the rows split between the two periods
 */
export const partitionBucketRows = <T extends { _id: string | null }>(
  rows: T[],
  buckets: string[]
): BucketPartition<T> => {
  const shownBuckets = new Set(buckets);
  const firstBucket = buckets[0] ?? '';
  const byBucket = new Map<string, T>();
  const previous: T[] = [];
  const previousByBucket = new Map<string, T>();

  for (const row of rows) {
    if (row._id === null) continue;

    if (shownBuckets.has(row._id)) byBucket.set(row._id, row);
    else if (row._id < firstBucket) {
      previous.push(row);
      previousByBucket.set(row._id, row);
    }
  }

  return { byBucket, previousByBucket, current: Array.from(byBucket.values()), previous };
};

/** Sum of one field over each side of a partition. */
export const sumPartition = <T>(
  partition: BucketPartition<T>,
  pick: (row: T) => number
): { current: number; previous: number } => ({
  current: sumBy(partition.current, pick),
  previous: sumBy(partition.previous, pick),
});
