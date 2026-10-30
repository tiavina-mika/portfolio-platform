import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import DonutChart from '@/components/DonutChart';
import PeriodComparisonChip from '@/components/PeriodComparisonChip';
import StackedBarChart from '@/components/StackedBarChart';
import TrendLineChart from '@/components/TrendLineChart';
import { PERCENT_MAX, RATING_MAX } from '@/constants/_core/statistics.constants';
import StatisticsBlock, {
  StatisticsBlocksSkeleton, StatisticsEmptyBlock,
} from '@/containers/_core/statistics/StatisticsBlock';
import { IUsersStatistics, StatisticsPeriod } from '@/types/_core/statistics.type';
import { formatChartNumber, formatChartPercent } from '@/utils/_core/chart.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { exportStatisticsSeries, formatStatisticsBucketLabel } from '@/utils/_core/statistics.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  users: IUsersStatistics | null;
  loading: boolean;
  period?: StatisticsPeriod;
  // draws the previous period behind each trend line
  isComparing?: boolean;
};

const UsersStatisticsSection = ({
  users, loading, period, isComparing = false,
}: Props) => {
  const { t } = useTranslation(['statistics', 'user']);
  const theme = useTheme();

  if (loading) return <StatisticsBlocksSkeleton />;

  const points = users?.points ?? [];
  const hasData = points.some((point) => (
    point.newUsers > 0 || point.totalUsers > 0 || point.activeUsers > 0
  ));

  if (!users || !hasData) return <StatisticsEmptyBlock />;

  const {
    comparisons, roleSplit, verificationSplit, accountSplit, previousPoints,
  } = users;
  const dates = points.map((point) => point.date);
  const labels = dates.map((date) => formatStatisticsBucketLabel(date, period));
  const pointsUnit = t('statistics:pointsUnit');
  const greyTone = getDesignTokens(theme).textDisabled;

  const registrationsSeries = [
    { data: points.map((point) => point.newUsers), label: t('statistics:newUsers'), color: theme.palette.primary.main },
  ];
  const activeUsersSeries = [
    {
      data: points.map((point) => point.totalUsers),
      previousData: previousPoints?.map((point) => point.totalUsers),
      label: t('statistics:totalUsers'),
      color: theme.palette.info.main,
    },
    {
      data: points.map((point) => point.activeUsers),
      previousData: previousPoints?.map((point) => point.activeUsers),
      label: t('statistics:activeUsers'),
      color: theme.palette.primary.main,
    },
  ];
  const retentionSeries = [
    {
      data: points.map((point) => point.retention30),
      previousData: previousPoints?.map((point) => point.retention30),
      label: t('statistics:retention30'),
      color: theme.palette.primary.main,
    },
    {
      data: points.map((point) => point.retention90),
      previousData: previousPoints?.map((point) => point.retention90),
      label: t('statistics:retention90'),
      color: theme.palette.info.main,
    },
  ];
  const conversionSeries = [
    {
      data: points.map((point) => point.conversionRate),
      previousData: previousPoints?.map((point) => point.conversionRate),
      label: t('statistics:conversionRate'),
      color: theme.palette.warning.main,
    },
  ];
  const ratingSeries = [
    {
      data: points.map((point) => point.averageRating),
      previousData: previousPoints?.map((point) => point.averageRating),
      label: t('statistics:ratingLegend'),
      color: theme.palette.warning.main,
    },
  ];
  const verificationSlices = [
    {
      id: 'verified', label: t('statistics:verified'), value: verificationSplit.verified,
      color: theme.palette.primary.main,
    },
    {
      id: 'pending', label: t('statistics:verificationPending'), value: verificationSplit.pending,
      color: theme.palette.warning.main,
    },
    { id: 'unverified', label: t('statistics:unverified'), value: verificationSplit.unverified, color: greyTone },
  ];
  const accountSlices = [
    { id: 'active', label: t('statistics:accountActive'), value: accountSplit.active, color: theme.palette.primary.main },
    {
      id: 'suspended', label: t('statistics:accountSuspended'), value: accountSplit.suspended,
      color: theme.palette.warning.main,
    },
    { id: 'banned', label: t('statistics:accountBanned'), value: accountSplit.banned, color: theme.palette.error.main },
  ];
  const roleSlices = [
    {
      id: 'passengers',
      label: t('statistics:passengers'),
      value: roleSplit.passengers,
      color: theme.palette.primary.main,
    },
    { id: 'drivers', label: t('statistics:drivers'), value: roleSplit.drivers, color: theme.palette.info.main },
  ];

  const handleExportSlices = (
    fileName: string,
    header: string,
    slices: typeof roleSlices
  ) => async (): Promise<void> => {
    await exportRows(
      slices,
      [
        { header, getValue: (slice) => slice.label },
        { header: t('user:users'), getValue: (slice) => slice.value },
      ],
      fileName,
      'csv'
    );
  };

  return (
    <>
      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.newUsers} />}
        onExportCsv={() => exportStatisticsSeries('users-registrations', dates, registrationsSeries)}
        title={t('statistics:registrationsPerMonth')}
      >
        <StackedBarChart labels={labels} series={registrationsSeries} />
      </StatisticsBlock>

      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.activeUsers} />}
        onExportCsv={() => exportStatisticsSeries('users-active-vs-total', dates, activeUsersSeries)}
        title={t('statistics:activeVsTotalUsersPerMonth')}
      >
        <TrendLineChart
          labels={labels}
          series={activeUsersSeries}
          showPrevious={isComparing}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('users-retention', dates, retentionSeries)}
        title={t('statistics:retentionPerPeriod')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.retention30}
            format="difference"
            unit={pointsUnit}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={retentionSeries}
          showPrevious={isComparing}
          valueFormatter={formatChartPercent}
          yAxisMax={PERCENT_MAX}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('users-conversion', dates, conversionSeries)}
        title={t('statistics:conversionPerPeriod')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.conversionRate}
            format="difference"
            unit={pointsUnit}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={conversionSeries}
          showPrevious={isComparing}
          valueFormatter={formatChartPercent}
          yAxisMax={PERCENT_MAX}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock onExportCsv={handleExportSlices('users-role-split', t('statistics:profile'), roleSlices)} title={t('statistics:roleSplit')}>
        <DonutChart data={roleSlices} />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={handleExportSlices('users-verification-status', t('statistics:status'), verificationSlices)}
        title={t('statistics:verificationStatus')}
      >
        <DonutChart data={verificationSlices} />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={handleExportSlices('users-account-status', t('statistics:status'), accountSlices)}
        title={t('statistics:accountStatus')}
      >
        <DonutChart data={accountSlices} />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('users-rating', dates, ratingSeries)}
        title={t('statistics:averageRating')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.averageRating}
            format="difference"
            unit={pointsUnit}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={ratingSeries}
          showPrevious={isComparing}
          valueFormatter={formatChartNumber}
          yAxisMax={RATING_MAX}
          yAxisMin={0}
        />
      </StatisticsBlock>
    </>
  );
};

export default UsersStatisticsSection;
