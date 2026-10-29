import {
  formatInZone, shiftInZone, startOfInZone,
} from '@shared/utils';

import { STATISTICS_TIME_ZONE } from '@/constants/_core/statistics.constants';
import { resolveScopedCountry } from '@/utils/_core/agent-context.utils';
import { type NullablePeriodComparison } from '@/utils/_core/period.utils';

export interface IStatisticsContext {
  months: number;
  /** first day of the oldest month shown */
  since: Date;
  /** first day of the window of the same length right before `since` — the comparison baseline */
  previousSince: Date;
  /** the months of the previous window, month i being the one `months` before the i-th month shown */
  previousMonths: string[];
  /** ISO 3166-1 alpha-2 code of the country every figure of the overview is read for */
  country: string;
  /** ISO 4217 code the money figures are summed in: amounts of two currencies are never added up */
  currency: string;
}

export type StatisticsPoint = {
  month: string;
  [metric: string]: number | string | null;
};

/**
 * What one domain adds to the overview: a point for every month of the window, each of its metrics
 * filled (0, or null for a rate with nothing to measure), and its period-over-period comparisons
 * keyed by metric name.
 */
export type OverviewStatisticsContribution = {
  points: StatisticsPoint[];
  /** the same metrics for the months of the previous window, aligned by index with `points` */
  previousPoints: StatisticsPoint[];
  comparisons: Record<string, NullablePeriodComparison>;
};

export type OverviewStatistics = OverviewStatisticsContribution & {
  /** ISO 4217 code the money figures are in */
  currency: string;
};

type OverviewStatisticsProvider = (context: IStatisticsContext) => Promise<OverviewStatisticsContribution>;

const overviewStatisticsProviders: OverviewStatisticsProvider[] = [];

/**
 * Lets each business domain (users, rides/requests, payments, ...) contribute its own
 * monthly time-series points and headline comparisons to the "overview" statistics page, without
 * this generic service knowing about domain-specific types.
 */
export const registerOverviewStatisticsProvider = (provider: OverviewStatisticsProvider): void => {
  overviewStatisticsProviders.push(provider);
};

/**
 * Ordered list of 'YYYY-MM' months from oldest to newest, ending on the current month.
 * Shared by every domain statistics page so each month bucket lines up the same way.
 */
export const buildEmptyMonthRange = (months: number): string[] => {
  const range: string[] = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    range.push(formatInZone(shiftInZone(new Date(), STATISTICS_TIME_ZONE, -i, 'month'), STATISTICS_TIME_ZONE, 'YYYY-MM'));
  }

  return range;
};

/**
 * Ordered 'YYYY-MM' months of the window right before the one `buildEmptyMonthRange` returns, aligned
 * by index with it.
 */
export const buildPreviousMonthRange = (months: number): string[] => (
  buildEmptyMonthRange(months).map((_month, index) => formatInZone(
    shiftInZone(new Date(), STATISTICS_TIME_ZONE, -(months + (months - 1 - index)), 'month'),
    STATISTICS_TIME_ZONE,
    'YYYY-MM'
  ))
);

const mergeStatisticsPoints = (monthRange: string[], results: StatisticsPoint[][]): StatisticsPoint[] => {
  const pointsByMonth = new Map<string, StatisticsPoint>(
    monthRange.map((month) => [month, { month }])
  );

  for (const points of results) {
    for (const point of points) {
      const existingPoint = pointsByMonth.get(point.month);

      if (existingPoint) Object.assign(existingPoint, point);
    }
  }

  return Array.from(pointsByMonth.values());
};

/**
 * Aggregates the monthly points and comparisons contributed by every registered provider into a
 * single time series (one point per month) plus one comparison per headline metric, for the BO
 * "Statistics / Overview" page. The comparisons set the `months` shown against the `months` before.
 */
export const getOverviewStatistics = async (
  months: number,
  country?: string
): Promise<OverviewStatistics> => {
  const since = startOfInZone(
    shiftInZone(new Date(), STATISTICS_TIME_ZONE, -(months - 1), 'month'),
    STATISTICS_TIME_ZONE,
    'month'
  );
  const { code, currency } = resolveScopedCountry(country);
  const context: IStatisticsContext = {
    months,
    since,
    previousSince: shiftInZone(since, STATISTICS_TIME_ZONE, -months, 'month'),
    previousMonths: buildPreviousMonthRange(months),
    country: code,
    currency,
  };

  const contributions = await Promise.all(overviewStatisticsProviders.map((provider) => provider(context)));

  return {
    currency: context.currency,
    points: mergeStatisticsPoints(buildEmptyMonthRange(months), contributions.map((c) => c.points)),
    previousPoints: mergeStatisticsPoints(context.previousMonths, contributions.map((c) => c.previousPoints)),
    comparisons: contributions.reduce<Record<string, NullablePeriodComparison>>(
      (comparisons, contribution) => ({ ...comparisons, ...contribution.comparisons }),
      {}
    ),
  };
};
