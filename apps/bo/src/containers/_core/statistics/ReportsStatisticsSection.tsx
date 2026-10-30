import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import DonutChart from '@/components/DonutChart';
import EmptyData from '@/components/EmptyData';
import PeriodComparisonChip from '@/components/PeriodComparisonChip';
import StackedBarChart from '@/components/StackedBarChart';
import TrendLineChart from '@/components/TrendLineChart';
import OldestOpenReportList from '@/containers/_core/statistics/OldestOpenReportList';
import StatisticsBlock, {
  StatisticsBlocksSkeleton, StatisticsEmptyBlock,
} from '@/containers/_core/statistics/StatisticsBlock';
import { IReportsStatistics, StatisticsPeriod } from '@/types/_core/statistics.type';
import { formatChartNumber, getChartPalette } from '@/utils/_core/chart.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { exportStatisticsSeries, formatStatisticsBucketLabel } from '@/utils/_core/statistics.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Props = {
  reports: IReportsStatistics | null;
  loading: boolean;
  period?: StatisticsPeriod;
  // draws the previous period behind each trend line
  isComparing?: boolean;
  onOpenReport: (reportId: string) => void;
};

const ReportsStatisticsSection = ({
  reports, loading, period, isComparing = false, onOpenReport,
}: Props) => {
  const { t } = useTranslation(['statistics', 'user']);
  const theme = useTheme();

  if (loading) return <StatisticsBlocksSkeleton />;

  const points = reports?.points ?? [];
  const hasData = points.some((point) => point.received > 0) || (reports?.oldestOpen ?? []).length > 0;

  if (!reports || !hasData) return <StatisticsEmptyBlock />;

  const {
    comparisons, byReason, byStatus, oldestOpen, previousPoints,
  } = reports;
  const dates = points.map((point) => point.date);
  const labels = dates.map((date) => formatStatisticsBucketLabel(date, period));
  const palette = getChartPalette(theme);
  const hoursUnit = t('statistics:hoursUnit');

  const receivedSeries = [
    {
      data: points.map((point) => point.received),
      label: t('statistics:reportsReceivedLegend'),
      color: theme.palette.error.main,
    },
  ];
  const handlingSeries = [
    {
      data: points.map((point) => point.averageHandlingHours),
      previousData: previousPoints?.map((point) => point.averageHandlingHours),
      label: t('statistics:reportsHandlingHoursLegend'),
      color: theme.palette.info.main,
    },
  ];
  const reasonSlices = byReason
    .filter((slice) => slice.count > 0)
    .map((slice, index) => ({
      id: slice.reason,
      label: t(`user:reports.reasons.${slice.reason}`),
      value: slice.count,
      color: palette[index % palette.length],
    }));
  const statusTones: Record<string, string> = {
    resolved: theme.palette.primary.main,
    under_review: theme.palette.warning.main,
    pending: theme.palette.error.main,
    dismissed: getDesignTokens(theme).textDisabled,
  };
  const statusSlices = byStatus
    .filter((slice) => slice.count > 0)
    .map((slice, index) => ({
      id: slice.status,
      label: t(`user:reports.statuses.${slice.status}`),
      value: slice.count,
      color: statusTones[slice.status] ?? palette[index % palette.length],
    }));

  const formatHours = (value: number): string => `${formatChartNumber(value)} ${hoursUnit}`;

  const handleExportSlices = (
    fileName: string,
    header: string,
    slices: typeof reasonSlices
  ) => async (): Promise<void> => {
    await exportRows(
      slices,
      [
        { header, getValue: (slice) => slice.label },
        { header: t('statistics:reportsCount'), getValue: (slice) => slice.value },
      ],
      fileName,
      'csv'
    );
  };

  const handleExportOldest = async (): Promise<void> => {
    await exportRows(
      oldestOpen,
      [
        { header: t('user:reports.reason'), getValue: (report) => t(`user:reports.reasons.${report.reason}`) },
        { header: t('statistics:reportTarget'), getValue: (report) => t(`user:reports.targetTypes.${report.targetType}`) },
        { header: t('statistics:receivedOn'), getValue: (report) => report.createdAt },
        { header: t('user:reports.age'), getValue: (report) => report.ageDays },
        { header: t('user:reports.status'), getValue: (report) => t(`user:reports.statuses.${report.status}`) },
      ],
      'reports-oldest-open',
      'csv'
    );
  };

  return (
    <>
      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('reports-received', dates, receivedSeries)}
        title={t('statistics:reportsReceived')}
        comparison={(
          <PeriodComparisonChip withContext comparison={comparisons.received} higherIsBetter={false} />
        )}
      >
        <StackedBarChart labels={labels} series={receivedSeries} />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('reports-handling-time', dates, handlingSeries)}
        title={t('statistics:reportsHandlingTime')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.averageHandlingHours}
            format="difference"
            higherIsBetter={false}
            unit={hoursUnit}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={handlingSeries}
          showPrevious={isComparing}
          valueFormatter={formatHours}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        title={t('statistics:reportsByReason')}
        onExportCsv={reasonSlices.length > 0
          ? handleExportSlices('reports-by-reason', t('user:reports.reason'), reasonSlices)
          : undefined}
      >
        {reasonSlices.length > 0 ? <DonutChart data={reasonSlices} /> : <EmptyData />}
      </StatisticsBlock>

      <StatisticsBlock
        title={t('statistics:reportsByStatus')}
        onExportCsv={statusSlices.length > 0
          ? handleExportSlices('reports-by-status', t('user:reports.status'), statusSlices)
          : undefined}
      >
        {statusSlices.length > 0 ? <DonutChart data={statusSlices} /> : <EmptyData />}
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={oldestOpen.length > 0 ? handleExportOldest : undefined}
        title={t('statistics:oldestOpenReports')}
      >
        <OldestOpenReportList onOpen={onOpenReport} reports={oldestOpen} />
      </StatisticsBlock>
    </>
  );
};

export default ReportsStatisticsSection;
