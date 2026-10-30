import { useTheme } from '@mui/material/styles';
import { getCurrencySymbol } from '@shared/utils';
import { useTranslation } from 'react-i18next';

import DonutChart from '@/components/DonutChart';
import EmptyData from '@/components/EmptyData';
import HorizontalBarList from '@/components/HorizontalBarList';
import PeriodComparisonChip from '@/components/PeriodComparisonChip';
import StackedBarChart from '@/components/StackedBarChart';
import TrendLineChart from '@/components/TrendLineChart';
import { UNKNOWN_PAYMENT_SERVICE } from '@/constants/_core/statistics.constants';
import PendingPayoutList from '@/containers/_core/statistics/PendingPayoutList';
import StatisticsBlock, {
  StatisticsBlocksSkeleton, StatisticsEmptyBlock,
} from '@/containers/_core/statistics/StatisticsBlock';
import { IPaymentsStatistics, StatisticsPeriod } from '@/types/_core/statistics.type';
import {
  formatChartNumber, formatChartPercent, formatCompactChartNumber, getChartPalette,
} from '@/utils/_core/chart.utils';
import { exportRows } from '@/utils/_core/export.utils';
import {
  exportStatisticsSeries, formatStatisticsBucketLabel,
} from '@/utils/_core/statistics.utils';

type Props = {
  payments: IPaymentsStatistics | null;
  loading: boolean;
  period?: StatisticsPeriod;
  // draws the previous period behind each trend line
  isComparing?: boolean;
};

const PaymentsStatisticsSection = ({
  payments, loading, period, isComparing = false,
}: Props) => {
  const { t } = useTranslation(['statistics', 'user']);
  const theme = useTheme();

  if (loading) return <StatisticsBlocksSkeleton />;

  const points = payments?.points ?? [];
  const hasData = points.some((point) => point.revenue > 0 || point.paymentsTotal > 0);

  if (!payments || !hasData) return <StatisticsEmptyBlock />;

  const {
    comparisons, byService, pendingPayouts, previousPoints,
  } = payments;
  const dates = points.map((point) => point.date);
  const labels = dates.map((date) => formatStatisticsBucketLabel(date, period));
  const palette = getChartPalette(theme);
  // the unit every money figure of the page is written in — never assumed to be the ariary
  const currencySymbol = getCurrencySymbol(payments.currency);

  const revenueSeries = [
    {
      data: points.map((point) => point.revenue),
      previousData: previousPoints?.map((point) => point.revenue),
      label: t('statistics:revenueLegend', { currency: currencySymbol }),
      color: theme.palette.warning.main,
    },
  ];
  const grossVsCommissionSeries = [
    {
      data: points.map((point) => point.revenue),
      previousData: previousPoints?.map((point) => point.revenue),
      label: t('statistics:grossRevenueLegend', { currency: currencySymbol }),
      color: theme.palette.warning.main,
    },
    {
      data: points.map((point) => point.commission),
      previousData: previousPoints?.map((point) => point.commission),
      label: t('statistics:commissionLegend', { currency: currencySymbol }),
      color: theme.palette.primary.main,
    },
  ];
  const averageBasketSeries = [
    {
      data: points.map((point) => point.averageBasket),
      previousData: previousPoints?.map((point) => point.averageBasket),
      label: t('statistics:averageBasketLegend', { currency: currencySymbol }),
      color: theme.palette.info.main,
    },
  ];
  const failureRateSeries = [
    {
      data: points.map((point) => point.failureRate),
      previousData: previousPoints?.map((point) => point.failureRate),
      label: t('statistics:failureRate'),
      color: theme.palette.error.main,
    },
  ];
  const refundsSeries = [
    { data: points.map((point) => point.refunds), label: t('statistics:refunds'), color: theme.palette.warning.main },
  ];
  const collectionDelaySeries = [
    {
      data: points.map((point) => point.averageCollectionDays),
      previousData: previousPoints?.map((point) => point.averageCollectionDays),
      label: t('statistics:averageCollectionDays'),
      color: theme.palette.info.main,
    },
  ];
  const daysUnit = t('statistics:daysUnit');

  const formatDays = (value: number): string => `${formatChartNumber(value)} ${daysUnit}`;

  const getServiceLabel = (service: string): string => (
    service === UNKNOWN_PAYMENT_SERVICE
      ? t('statistics:unknownService')
      : t(`user:payments.services.${service}`)
  );

  const serviceSlices = byService
    .filter((share) => share.count > 0)
    .map((share, index) => ({
      id: share.service,
      label: getServiceLabel(share.service),
      value: share.count,
      color: palette[index % palette.length],
    }));

  // a bar is as long as the operator's failure rate; the count of payments it rests on sits beside it
  const operatorRows = byService
    .filter((share) => share.count > 0)
    .map((share) => ({
      key: share.service,
      label: getServiceLabel(share.service),
      value: share.failureRate,
      valueLabel: formatChartPercent(share.failureRate),
      extra: t('statistics:transactionsCount', { count: share.count }),
    }));

  const handleExportOperators = async (): Promise<void> => {
    await exportRows(
      byService,
      [
        { header: t('statistics:service'), getValue: (share) => getServiceLabel(share.service) },
        { header: t('statistics:paymentsTotal'), getValue: (share) => share.count },
        { header: t('statistics:paymentsFailed'), getValue: (share) => share.failed },
        { header: t('statistics:failureRate'), getValue: (share) => share.failureRate },
      ],
      'payments-failure-by-operator',
      'csv'
    );
  };

  const handleExportServices = async (): Promise<void> => {
    await exportRows(
      byService,
      [
        { header: t('statistics:service'), getValue: (share) => getServiceLabel(share.service) },
        { header: t('statistics:paymentsCount'), getValue: (share) => share.count },
        { header: t('statistics:amount'), getValue: (share) => share.amount },
      ],
      'payments-by-service',
      'csv'
    );
  };

  const handleExportPayouts = async (): Promise<void> => {
    await exportRows(
      pendingPayouts,
      [
        { header: t('statistics:driver'), getValue: (payout) => payout.fullName },
        { header: t('statistics:ridesCount'), getValue: (payout) => payout.ridesCount },
        { header: t('statistics:amount'), getValue: (payout) => payout.amount },
        { header: t('statistics:oldestRide'), getValue: (payout) => payout.oldestAt },
      ],
      'payments-pending-payouts',
      'csv'
    );
  };

  return (
    <>
      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.revenue} />}
        onExportCsv={() => exportStatisticsSeries('payments-revenue', dates, revenueSeries)}
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
        onExportCsv={() => exportStatisticsSeries('payments-failure-rate', dates, failureRateSeries)}
        title={t('statistics:failureRatePerMonth')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.failureRate}
            format="difference"
            higherIsBetter={false}
            unit={t('statistics:pointsUnit')}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={failureRateSeries}
          showPrevious={isComparing}
          valueFormatter={formatChartPercent}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={serviceSlices.length > 0 ? handleExportServices : undefined}
        title={t('statistics:paymentMethods')}
      >
        {serviceSlices.length > 0 ? <DonutChart data={serviceSlices} /> : <EmptyData />}
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('payments-collection-delay', dates, collectionDelaySeries)}
        title={t('statistics:averageCollectionTime')}
        comparison={(
          <PeriodComparisonChip
            withContext
            comparison={comparisons.averageCollectionDays}
            format="difference"
            higherIsBetter={false}
            unit={daysUnit}
          />
        )}
      >
        <TrendLineChart
          labels={labels}
          series={collectionDelaySeries}
          showPrevious={isComparing}
          valueFormatter={formatDays}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={() => exportStatisticsSeries('payments-refunds', dates, refundsSeries)}
        title={t('statistics:refunds')}
        comparison={(
          <PeriodComparisonChip withContext comparison={comparisons.refunds} higherIsBetter={false} />
        )}
      >
        <StackedBarChart labels={labels} series={refundsSeries} />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={operatorRows.length > 0 ? handleExportOperators : undefined}
        title={t('statistics:failureRateByOperator')}
      >
        {operatorRows.length > 0 ? <HorizontalBarList rows={operatorRows} /> : <EmptyData />}
      </StatisticsBlock>

      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.revenue} />}
        onExportCsv={() => exportStatisticsSeries('payments-gross-vs-commission', dates, grossVsCommissionSeries)}
        title={t('statistics:grossVsCommission')}
      >
        <TrendLineChart
          labels={labels}
          series={grossVsCommissionSeries}
          showPrevious={isComparing}
          valueFormatter={formatCompactChartNumber}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        comparison={<PeriodComparisonChip withContext comparison={comparisons.averageBasket} />}
        onExportCsv={() => exportStatisticsSeries('payments-average-basket', dates, averageBasketSeries)}
        title={t('statistics:averageBasket')}
      >
        <TrendLineChart
          labels={labels}
          series={averageBasketSeries}
          showPrevious={isComparing}
          valueFormatter={formatCompactChartNumber}
          yAxisMin={0}
        />
      </StatisticsBlock>

      <StatisticsBlock
        onExportCsv={pendingPayouts.length > 0 ? handleExportPayouts : undefined}
        title={t('statistics:pendingPayouts')}
      >
        <PendingPayoutList currency={payments.currency} payouts={pendingPayouts} />
      </StatisticsBlock>
    </>
  );
};

export default PaymentsStatisticsSection;
