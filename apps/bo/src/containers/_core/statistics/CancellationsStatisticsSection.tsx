import { useTheme } from '@mui/material/styles';
import { getCurrencySymbol } from '@shared/utils';
import { useTranslation } from 'react-i18next';

import PeriodComparisonChip from '@/components/PeriodComparisonChip';
import StackedBarChart from '@/components/StackedBarChart';
import TrendLineChart from '@/components/TrendLineChart';
import { CANCELLATION_RATE_TARGET_PERCENT } from '@/constants/_core/statistics.constants';
import CancellationReasonList from '@/containers/_core/statistics/CancellationReasonList';
import StatisticsBlock, {
  StatisticsBlockBodySkeleton, StatisticsBlocksSkeleton, StatisticsEmptyBlock,
} from '@/containers/_core/statistics/StatisticsBlock';
import SuspendedUserList from '@/containers/_core/statistics/SuspendedUserList';
import {
  ICancellationReasonPoint, ICancellationStatistics, ISuspendedUserPoint, StatisticsPeriod,
} from '@/types/_core/statistics.type';
import { formatChartPercent, formatCompactChartNumber } from '@/utils/_core/chart.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { exportStatisticsSeries, formatStatisticsBucketLabel } from '@/utils/_core/statistics.utils';

type Props = {
  cancellations: ICancellationStatistics | null;
  reasons: ICancellationReasonPoint[] | null;
  suspendedUsers: ISuspendedUserPoint[] | null;
  loading: boolean;
  // the suspended accounts are read beside the figures, so their card fills in once the rest is drawn
  suspendedUsersLoading?: boolean;
  period?: StatisticsPeriod;
  // draws the previous period behind each trend line
  isComparing?: boolean;
  /** Lifts a suspension the cancellation policy applied automatically — see `SuspendedUserList`. */
  onClearSuspension?: (userId: string, withPenalty: boolean, reason: string) => void;
};

const CancellationsStatisticsSection = ({
  cancellations, reasons, suspendedUsers, loading, suspendedUsersLoading = false, period, isComparing = false,
  onClearSuspension,
}: Props) => {
  const { t } = useTranslation(['statistics', 'user']);
  const theme = useTheme();

  if (loading) return <StatisticsBlocksSkeleton />;

  const points = cancellations?.points ?? [];
  const hasData = points.some((point) => point.confirmedCohort > 0 || point.requestsTotal > 0);

  if (!cancellations || !hasData) return <StatisticsEmptyBlock />;

  const { comparisons, previousPoints } = cancellations;
  const dates = points.map((point) => point.date);
  const labels = dates.map((date) => formatStatisticsBucketLabel(date, period));
  const reasonRows = reasons ?? [];
  const suspendedRows = suspendedUsers ?? [];

  const byAuthorSeries = [
    {
      data: points.map((point) => point.canceledByDriver),
      label: t('statistics:canceledByDriver'),
      color: theme.palette.error.main,
    },
    {
      data: points.map((point) => point.canceledByPassenger),
      label: t('statistics:canceledByPassenger'),
      color: theme.palette.warning.main,
    },
  ];
  /*
   * one line, not two: nobody is refused before a booking is confirmed any more, so a refusal rate
   * would read zero on every bucket. What is left is the rate that says whether instant booking is
   * holding — a driver who cannot turn a passenger away before the booking can still cancel after.
   */
  const ratesSeries = [
    {
      data: points.map((point) => point.cancellationRate),
      previousData: previousPoints?.map((point) => point.cancellationRate),
      label: t('statistics:cancellationRate'),
      color: theme.palette.primary.main,
    },
  ];
  const byLeadTimeSeries = [
    { data: points.map((point) => point.canceledEarly), label: t('statistics:canceledEarly'), color: theme.palette.primary.main },
    { data: points.map((point) => point.canceledMid), label: t('statistics:canceledMid'), color: theme.palette.warning.main },
    { data: points.map((point) => point.canceledLate), label: t('statistics:canceledLate'), color: theme.palette.error.main },
  ];
  const noShowRateSeries = [
    {
      data: points.map((point) => point.noShowRate),
      previousData: previousPoints?.map((point) => point.noShowRate),
      label: t('statistics:noShowRate'),
      color: theme.palette.error.main,
    },
  ];
  const lostRevenueSeries = [
    {
      data: points.map((point) => point.lostRevenue),
      previousData: previousPoints?.map((point) => point.lostRevenue),
      label: t('statistics:lostRevenue', { currency: getCurrencySymbol(cancellations.currency) }),
      color: theme.palette.warning.main,
    },
  ];

  const handleExportReasons = async (): Promise<void> => {
    await exportRows(
      reasonRows,
      [
        { header: t('statistics:cancellationReasons'), getValue: (point) => point.reason },
        { header: t('statistics:occurrences'), getValue: (point) => point.count },
      ],
      'cancellations-reasons',
      'csv'
    );
  };

  const handleExportSuspendedUsers = async (): Promise<void> => {
    await exportRows(
      suspendedRows,
      [
        { header: t('user:user'), getValue: (user) => user.fullName },
        { header: t('statistics:suspendedUntil'), getValue: (user) => user.suspendedUntil },
        { header: t('statistics:cancellationsInWindow'), getValue: (user) => user.cancellationsInWindow },
        { header: t('statistics:pendingPenalty'), getValue: (user) => user.pendingPenalty },
      ],
      'cancellations-suspended-users',
      'csv'
    );
  };

  // the lead-time bars stack the same cancellations as the by-author ones, so they move by the same change
  const canceledComparison = (
    <PeriodComparisonChip withContext comparison={comparisons.canceled} higherIsBetter={false} />
  );

  return (
    <>
      <StatisticsBlock
        comparison={canceledComparison}
        onExportCsv={() => exportStatisticsSeries('cancellations-by-author', dates, byAuthorSeries)}
        title={t('statistics:cancellationsByAuthor')}
      >
        <StackedBarChart labels={labels} series={byAuthorSeries} />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('cancellations-rates', dates, ratesSeries)}
        title={t('statistics:cancellationRatePerPeriod')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.cancellationRate}
            format="difference"
            higherIsBetter={false}
            unit={t('statistics:pointsUnit')}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          referenceLabel={t('statistics:cancellationRateTarget')}
          referenceValue={CANCELLATION_RATE_TARGET_PERCENT}
          series={ratesSeries}
          showPrevious={isComparing}
          valueFormatter={formatChartPercent}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={reasonRows.length > 0 ? handleExportReasons : undefined}
        title={t('statistics:cancellationReasons')}
      >
        <CancellationReasonList reasons={reasonRows} />
      </StatisticsBlock>

      <StatisticsBlock
        title={t('statistics:suspendedUsers')}
        onExportCsv={!suspendedUsersLoading && suspendedRows.length > 0
          ? handleExportSuspendedUsers
          : undefined}
      >
        {suspendedUsersLoading
          ? <StatisticsBlockBodySkeleton />
          : <SuspendedUserList onClearSuspension={onClearSuspension} users={suspendedRows} />}
      </StatisticsBlock>

      <StatisticsBlock
        comparison={canceledComparison}
        onExportCsv={() => exportStatisticsSeries('cancellations-by-lead-time', dates, byLeadTimeSeries)}
        title={t('statistics:cancellationsByLeadTime')}
      >
        <StackedBarChart labels={labels} series={byLeadTimeSeries} />
      </StatisticsBlock>

      {/*
        * the passengers who neither cancelled nor came: established absences over the confirmed
        * bookings of rides that left — a contest still under examination is not counted as one
        */}
      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('cancellations-no-show-rate', dates, noShowRateSeries)}
        title={t('statistics:noShowRatePerPeriod')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.noShowRate}
            format="difference"
            higherIsBetter={false}
            unit={t('statistics:pointsUnit')}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={noShowRateSeries}
          showPrevious={isComparing}
          valueFormatter={formatChartPercent}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('cancellations-lost-revenue', dates, lostRevenueSeries)}
        title={t('statistics:lostRevenuePerPeriod')}
        comparison={(
          <PeriodComparisonChip withContext comparison={comparisons.lostRevenue} higherIsBetter={false} />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={lostRevenueSeries}
          showPrevious={isComparing}
          valueFormatter={formatCompactChartNumber}
          yAxisMin={0}
        />
      </StatisticsBlock>
    </>
  );
};

export default CancellationsStatisticsSection;
