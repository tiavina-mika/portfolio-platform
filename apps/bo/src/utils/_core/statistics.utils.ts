import { getCurrencySymbol } from '@shared/utils';
import dayjs from 'dayjs';
import last from 'lodash/last';
import nth from 'lodash/nth';

import type { TFunction } from 'i18next';

import i18n from '@/config/i18n';
import { STATISTICS_VIEWS } from '@/constants/_core/statistics.constants';
import { IExportColumn } from '@/types/_core/app.type';
import {
  ICancellationStatisticsPoint,
  IOverviewStatisticsPoint,
  INullablePeriodComparison,
  IPaymentStatisticsPoint,
  IReportStatisticsPoint,
  IRideStatisticsPoint,
  IUserStatisticsPoint,
  IVehicleStatisticsPoint,
  StatisticsComparisonFormat,
  StatisticsPeriod,
  StatisticsViewEnum,
} from '@/types/_core/statistics.type';
import { formatChartNumber, formatCompactChartNumber } from '@/utils/_core/chart.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';

// the figures themselves are rounded to one decimal, so a difference between two of them is too
const DIFFERENCE_PRECISION = 10;
const PERCENT = 100;

export const isDayGranularityPeriod = (period?: StatisticsPeriod): boolean => period !== '12m';

export const getStatisticsViewPath = (view: StatisticsViewEnum): string => {
  switch (view) {
    case StatisticsViewEnum.USERS:
      return PATH_NAMES.statistics.users;
    case StatisticsViewEnum.RIDES:
      return PATH_NAMES.statistics.rides;
    case StatisticsViewEnum.PAYMENTS:
      return PATH_NAMES.statistics.payments;
    case StatisticsViewEnum.VEHICLES:
      return PATH_NAMES.statistics.vehicles;
    case StatisticsViewEnum.CANCELLATIONS:
      return PATH_NAMES.statistics.cancellations;
    case StatisticsViewEnum.REPORTS:
      return PATH_NAMES.statistics.reports;
    default:
      return PATH_NAMES.statistics.root;
  }
};

/**
 * Open registry: the statistics views a business domain adds to the generic navigation (rides,
 * vehicles), each with the right that opens it and its place among the core views.
 */
export type StatisticsViewEntry = {
  view: StatisticsViewEnum;
  labelKey: string;
  className?: string;
  uiRight?: string;
  order: number;
};

const statisticsViewExtensions: StatisticsViewEntry[] = [];

export const registerStatisticsView = (entry: StatisticsViewEntry): void => {
  statisticsViewExtensions.push(entry);
};

// the core views and the registered ones, in the order the navigation lists them
export const getStatisticsViews = (): StatisticsViewEntry[] => (
  [...STATISTICS_VIEWS, ...statisticsViewExtensions].sort((a, b) => a.order - b.order)
);

// an amount in a table cell, in the currency it is stored in: "486 000 Ar"
export const formatStatisticsAmount = (amount: number, currency?: string | null): string => (
  `${formatChartNumber(amount, 0)} ${getCurrencySymbol(currency)}`
);

// an amount standing next to another figure, where only its magnitude matters: "32,4 M Ar"
export const formatCompactStatisticsAmount = (amount: number, currency?: string | null): string => (
  `${formatCompactChartNumber(amount)} ${getCurrencySymbol(currency)}`
);

/**
 * Formats a bucket key ('YYYY-MM-DD' for the day-granularity presets, 'YYYY-MM' for the
 * 12-month one) into a short chart-axis label.
 */
export const formatStatisticsBucketLabel = (date: string, period?: StatisticsPeriod): string => (
  isDayGranularityPeriod(period)
    ? dayjs(date, 'YYYY-MM-DD').format('D MMM')
    : dayjs(date, 'YYYY-MM').format('MMM YY')
);

/**
 * The signed change a comparison states: the server's relative change for a count or an amount,
 * the plain difference between the two periods for a rate or a duration. Null when there is no
 * previous figure to measure the change against.
 */
export const getComparisonChange = (
  comparison: INullablePeriodComparison,
  format: StatisticsComparisonFormat
): number | null => {
  if (format === 'percent') return comparison.changePercent;
  if (comparison.currentTotal === null || comparison.previousTotal === null) return null;

  const difference = comparison.currentTotal - comparison.previousTotal;

  return Math.round(difference * DIFFERENCE_PRECISION) / DIFFERENCE_PRECISION;
};

/**
 * How the last bucket of a series moved against the one before it: the "key indicators" read a
 * month against the month before, whereas the chart cards read a whole period against the previous
 * one. A bucket with nothing to measure on either side states no change rather than a false zero.
 */
export const getLastBucketComparison = (values: (number | null)[]): INullablePeriodComparison => {
  const currentTotal = last(values) ?? null;
  const previousTotal = nth(values, -2) ?? null;
  const canCompare = currentTotal !== null && previousTotal !== null && previousTotal !== 0;

  return {
    currentTotal,
    previousTotal,
    changePercent: canCompare
      ? Math.round(((currentTotal - previousTotal) / previousTotal) * PERCENT * DIFFERENCE_PRECISION) /
        DIFFERENCE_PRECISION
      : null,
  };
};

export type StatisticsExportSeries = {
  label: string;
  data: (number | null)[];
};

/**
 * One chart card's figures, written to a CSV file: a row per bucket keyed by its raw date — a
 * spreadsheet sorts "2026-09", it cannot sort "sept. 26" — and a column per series of the chart.
 */
export const exportStatisticsSeries = async (
  fileName: string,
  dates: string[],
  series: StatisticsExportSeries[]
): Promise<void> => {
  const columns: IExportColumn<number>[] = [
    { header: i18n.t('common:date'), getValue: (index) => dates[index] },
    ...series.map(({ label, data }) => ({ header: label, getValue: (index: number) => data[index] })),
  ];

  await exportRows(dates.map((_, index) => index), columns, fileName, 'csv');
};

export const getOverviewStatisticsExportColumns = (
  t: TFunction
): IExportColumn<IOverviewStatisticsPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.month },
  { header: t('statistics:newUsers'), getValue: (point) => point.newUsers },
  { header: t('statistics:ridesPublished'), getValue: (point) => point.ridesPublished },
  { header: t('statistics:requestsConfirmed'), getValue: (point) => point.requestsConfirmed },
  { header: t('statistics:revenue'), getValue: (point) => point.revenue },
  { header: t('statistics:fillRateLegend'), getValue: (point) => point.fillRate },
  { header: t('statistics:activeDrivers'), getValue: (point) => point.activeDrivers },
  { header: t('statistics:activePassengers'), getValue: (point) => point.activePassengers },
  { header: t('statistics:ratingLegend'), getValue: (point) => point.averageRating },
];

export const getUsersStatisticsExportColumns = (t: TFunction): IExportColumn<IUserStatisticsPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.date },
  { header: t('statistics:newUsers'), getValue: (point) => point.newUsers },
  { header: t('statistics:totalUsers'), getValue: (point) => point.totalUsers },
  { header: t('statistics:activeUsers'), getValue: (point) => point.activeUsers },
  { header: t('statistics:retention30'), getValue: (point) => point.retention30 },
  { header: t('statistics:retention90'), getValue: (point) => point.retention90 },
  { header: t('statistics:conversionRate'), getValue: (point) => point.conversionRate },
  { header: t('statistics:ratingLegend'), getValue: (point) => point.averageRating },
];

export const getRidesStatisticsExportColumns = (t: TFunction): IExportColumn<IRideStatisticsPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.date },
  { header: t('statistics:ridesPublished'), getValue: (point) => point.ridesPublished },
  { header: t('statistics:requestsConfirmed'), getValue: (point) => point.requestsConfirmed },
  { header: t('statistics:requestsTotal'), getValue: (point) => point.requestsTotal },
  { header: t('statistics:emptyRidesRate'), getValue: (point) => point.emptyRidesRate },
  { header: t('statistics:seatsOffered'), getValue: (point) => point.seatsOffered },
  { header: t('statistics:seatsBooked'), getValue: (point) => point.seatsBooked },
];

export const getPaymentsStatisticsExportColumns = (
  t: TFunction,
  currency?: string
): IExportColumn<IPaymentStatisticsPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.date },
  { header: t('statistics:revenue'), getValue: (point) => point.revenue },
  { header: t('statistics:paymentsFailed'), getValue: (point) => point.paymentsFailed },
  { header: t('statistics:paymentsTotal'), getValue: (point) => point.paymentsTotal },
  { header: t('statistics:failureRate'), getValue: (point) => point.failureRate },
  { header: t('statistics:refunds'), getValue: (point) => point.refunds },
  { header: t('statistics:refundedAmount'), getValue: (point) => point.refundedAmount },
  { header: t('statistics:averageCollectionDays'), getValue: (point) => point.averageCollectionDays },
  {
    header: t('statistics:commissionLegend', { currency: getCurrencySymbol(currency) }),
    getValue: (point) => point.commission,
  },
  {
    header: t('statistics:averageBasketLegend', { currency: getCurrencySymbol(currency) }),
    getValue: (point) => point.averageBasket,
  },
];

export const getVehiclesStatisticsExportColumns = (
  t: TFunction
): IExportColumn<IVehicleStatisticsPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.date },
  { header: t('statistics:vehiclesAdded'), getValue: (point) => point.vehiclesAdded },
  { header: t('statistics:averageFleetAge'), getValue: (point) => point.averageFleetAge },
  { header: t('statistics:averageReviewHours'), getValue: (point) => point.averageReviewHours },
];

export const getCancellationStatisticsExportColumns = (
  t: TFunction,
  currency?: string
): IExportColumn<ICancellationStatisticsPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.date },
  { header: t('statistics:confirmedCohort'), getValue: (point) => point.confirmedCohort },
  { header: t('statistics:canceledByDriver'), getValue: (point) => point.canceledByDriver },
  { header: t('statistics:canceledByPassenger'), getValue: (point) => point.canceledByPassenger },
  { header: t('statistics:cancellationRate'), getValue: (point) => point.cancellationRate },
  { header: t('statistics:canceledEarly'), getValue: (point) => point.canceledEarly },
  { header: t('statistics:canceledMid'), getValue: (point) => point.canceledMid },
  { header: t('statistics:canceledLate'), getValue: (point) => point.canceledLate },
  {
    header: t('statistics:lostRevenue', { currency: getCurrencySymbol(currency) }),
    getValue: (point) => point.lostRevenue,
  },
  { header: t('statistics:departedBookings'), getValue: (point) => point.departed },
  { header: t('statistics:noShows'), getValue: (point) => point.noShow },
  { header: t('statistics:noShowRate'), getValue: (point) => point.noShowRate },
];

export const getReportsStatisticsExportColumns = (
  t: TFunction
): IExportColumn<IReportStatisticsPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.date },
  { header: t('statistics:reportsReceivedLegend'), getValue: (point) => point.received },
  { header: t('statistics:reportsHandlingHoursLegend'), getValue: (point) => point.averageHandlingHours },
];
