import { useTheme } from '@mui/material/styles';
import { getCurrencySymbol } from '@shared/utils';
import dayjs from 'dayjs';
import last from 'lodash/last';
import { useTranslation } from 'react-i18next';

import PeriodComparisonChip from '@/components/PeriodComparisonChip';
import StackedBarChart from '@/components/StackedBarChart';
import TrendLineChart from '@/components/TrendLineChart';
import { OVERVIEW_STATISTICS_PERIOD, PERCENT_MAX, RATING_MAX } from '@/constants/_core/statistics.constants';
import KeyIndicatorList from '@/containers/_core/statistics/KeyIndicatorList';
import StatisticsBlock, {
  StatisticsBlocksSkeleton, StatisticsEmptyBlock,
} from '@/containers/_core/statistics/StatisticsBlock';
import { IOverviewStatistics } from '@/types/_core/statistics.type';
import { formatChartNumber, formatChartPercent, formatCompactChartNumber } from '@/utils/_core/chart.utils';
import {
  exportStatisticsSeries, formatCompactStatisticsAmount, formatStatisticsBucketLabel,
  getLastBucketComparison,
} from '@/utils/_core/statistics.utils';

type Props = {
  overview: IOverviewStatistics | null;
  loading: boolean;
  // draws the previous period behind each trend line
  isComparing?: boolean;
};

const OverviewStatisticsSection = ({ overview, loading, isComparing = false }: Props) => {
  const { t } = useTranslation(['statistics']);
  const theme = useTheme();

  if (loading) return <StatisticsBlocksSkeleton />;

  const points = overview?.points ?? [];
  const hasData = points.some((point) => (
    point.newUsers > 0 ||
    point.ridesPublished > 0 ||
    point.requestsConfirmed > 0 ||
    point.revenue > 0
  ));

  if (!overview || !hasData) return <StatisticsEmptyBlock />;

  const { comparisons, previousPoints } = overview;
  // the unit every money figure of the page is written in — never assumed to be the ariary
  const currencySymbol = getCurrencySymbol(overview.currency);
  const dates = points.map((point) => point.month);
  const labels = dates.map((date) => formatStatisticsBucketLabel(date, OVERVIEW_STATISTICS_PERIOD));
  const pointsUnit = t('statistics:pointsUnit');
  const lastMonth = dayjs(last(dates), 'YYYY-MM').format('MMM YY');

  const newUsersSeries = [
    {
      data: points.map((point) => point.newUsers),
      previousData: previousPoints?.map((point) => point.newUsers),
      label: t('statistics:newUsers'),
      color: theme.palette.primary.main,
    },
  ];
  const ridesSeries = [
    {
      data: points.map((point) => point.ridesPublished),
      label: t('statistics:ridesPublished'),
      color: theme.palette.info.main,
    },
    {
      data: points.map((point) => point.requestsConfirmed),
      label: t('statistics:requestsConfirmed'),
      color: theme.palette.primary.main,
    },
  ];
  const revenueSeries = [
    {
      data: points.map((point) => point.revenue),
      previousData: previousPoints?.map((point) => point.revenue),
      label: t('statistics:revenueLegend', { currency: currencySymbol }),
      color: theme.palette.warning.main,
    },
  ];
  const fillRateSeries = [
    {
      data: points.map((point) => point.fillRate),
      previousData: previousPoints?.map((point) => point.fillRate),
      label: t('statistics:fillRateLegend'),
      color: theme.palette.primary.main,
    },
  ];
  const activeUsersSeries = [
    {
      data: points.map((point) => point.activePassengers),
      previousData: previousPoints?.map((point) => point.activePassengers),
      label: t('statistics:activePassengers'),
      color: theme.palette.info.main,
    },
    {
      data: points.map((point) => point.activeDrivers),
      previousData: previousPoints?.map((point) => point.activeDrivers),
      label: t('statistics:activeDrivers'),
      color: theme.palette.primary.main,
    },
  ];

  // the key indicators read the latest month against the one before it
  const latest = last(points);
  const latestRating = latest?.averageRating ?? null;
  const keyIndicators = [
    {
      key: 'ridesPublished',
      label: t('statistics:ridesPublished'),
      value: formatChartNumber(latest?.ridesPublished ?? 0, 0),
      change: (
        <PeriodComparisonChip
          comparison={getLastBucketComparison(points.map((point) => point.ridesPublished))}
        />
      ),
    },
    {
      key: 'revenue',
      label: t('statistics:revenue'),
      value: formatCompactStatisticsAmount(latest?.revenue ?? 0, overview.currency),
      change: (
        <PeriodComparisonChip
          comparison={getLastBucketComparison(points.map((point) => point.revenue))}
        />
      ),
    },
    {
      key: 'activeUsers',
      label: t('statistics:activeUsers'),
      value: formatChartNumber(
        (latest?.activeDrivers ?? 0) + (latest?.activePassengers ?? 0),
        0
      ),
      change: (
        <PeriodComparisonChip
          comparison={getLastBucketComparison(
            points.map((point) => point.activeDrivers + point.activePassengers)
          )}
        />
      ),
    },
    {
      key: 'averageRating',
      label: t('statistics:averageRating'),
      value: latestRating === null ? '—' : `${formatChartNumber(latestRating)} / ${RATING_MAX}`,
      change: (
        <PeriodComparisonChip
          comparison={getLastBucketComparison(points.map((point) => point.averageRating))}
          format="difference"
          unit={pointsUnit}
        />
      ),
    },
  ];

  return (
    <>
      <StatisticsBlock title={t('statistics:keyIndicators', { month: lastMonth })}>
        <KeyIndicatorList indicators={keyIndicators} />
      </StatisticsBlock>

      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.newUsers} />}
        onExportCsv={() => exportStatisticsSeries('overview-new-users', dates, newUsersSeries)}
        title={t('statistics:newUsersPerMonth')}
      >
        <TrendLineChart
          labels={labels}
          series={newUsersSeries}
          showPrevious={isComparing}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.ridesPublished} />}
        onExportCsv={() => exportStatisticsSeries('overview-rides-requests', dates, ridesSeries)}
        title={t('statistics:ridesAndRequestsPerMonth')}
      >
        <StackedBarChart labels={labels} series={ridesSeries} stacked={false} />
      </StatisticsBlock>

      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.revenue} />}
        onExportCsv={() => exportStatisticsSeries('overview-revenue', dates, revenueSeries)}
        title={t('statistics:revenuePerMonth', { currency: currencySymbol })}
      >
        <TrendLineChart
          labels={labels}
          series={revenueSeries}
          showPrevious={isComparing}
          valueFormatter={formatCompactChartNumber}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('overview-fill-rate', dates, fillRateSeries)}
        title={t('statistics:fillRatePerMonth')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.fillRate}
            format="difference"
            unit={pointsUnit}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={fillRateSeries}
          showPrevious={isComparing}
          valueFormatter={formatChartPercent}
          yAxisMax={PERCENT_MAX}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.activeUsers} />}
        onExportCsv={() => exportStatisticsSeries('overview-active-users', dates, activeUsersSeries)}
        title={t('statistics:activeDriversVsPassengers')}
      >
        <TrendLineChart
          labels={labels}
          series={activeUsersSeries}
          showPrevious={isComparing}
          yAxisMin={0}
        />
      </StatisticsBlock>
    </>
  );
};

export default OverviewStatisticsSection;
