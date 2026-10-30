import {
  Box, Card, Skeleton, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import EmptyData from '@/components/EmptyData';
import KpiGrid from '@/components/KpiGrid';
import PeriodComparisonChip from '@/components/PeriodComparisonChip';
import SectionLoadError from '@/components/SectionLoadError';
import StatCard, { StatCardSkeleton } from '@/components/StatCard';
import TrendLineChart from '@/components/TrendLineChart';
import {
  FINANCE_CHART_CARD_GAP, FINANCE_CHART_CARD_PADDING_BOTTOM, FINANCE_CHART_CARD_PADDING_TOP,
  FINANCE_CHART_CARD_PADDING_X, FINANCE_CHART_HEIGHT, FINANCE_OVERVIEW_GAP,
  FINANCE_OVERVIEW_KPI_COLUMNS, FINANCE_OVERVIEW_SIDE_WIDTH, FINANCE_QUEUE_SKELETON_ROWS,
} from '@/constants/_core/ui.constants';
import { DashboardListCardSkeleton } from '@/containers/_core/dashboard/DashboardListCard';
import OverduePendingPaymentsCard from '@/containers/_core/finance/OverduePendingPaymentsCard';
import { IFinanceOverview, IOverduePendingPayment } from '@/types/_core/finance.type';
import { StatisticsPeriod } from '@/types/_core/statistics.type';
import { formatCompactChartNumber } from '@/utils/_core/chart.utils';
import { formatStatisticsBucketLabel } from '@/utils/_core/statistics.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  // the figures and their chart on one side, the payments to chase on the other: stacked on a narrow screen
  layout: {
    display: 'grid',
    alignItems: 'start',
    gap: `${FINANCE_OVERVIEW_GAP}px`,
    gridTemplateColumns: { xs: '1fr', lg: `minmax(0, 1fr) ${FINANCE_OVERVIEW_SIDE_WIDTH}px` },
  },
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FINANCE_OVERVIEW_GAP}px`,
    minWidth: 0,
  },
  chartCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FINANCE_CHART_CARD_GAP}px`,
    padding: `${FINANCE_CHART_CARD_PADDING_TOP}px ${FINANCE_CHART_CARD_PADDING_X}px` +
      ` ${FINANCE_CHART_CARD_PADDING_BOTTOM}px`,
  },
};

type Props = {
  overview: IFinanceOverview | null;
  overduePendingPayments: IOverduePendingPayment[] | null;
  loading: boolean;
  period?: StatisticsPeriod;
  /** the read failed — stated as such, never drawn as a period with no activity */
  loadError?: boolean;
  onRetry?: () => void;
  /** payments the operator was already asked about again during this visit */
  recheckedIds?: string[];
  /** a question to the operator is in flight */
  isRechecking?: boolean;
  onRecheck?: (paymentId: string) => void;
};

const FinanceOverviewSection = ({
  overview, overduePendingPayments, loading, period, loadError = false, onRetry,
  recheckedIds = [], isRechecking = false, onRecheck,
}: Props) => {
  const { t } = useTranslation(['finance', 'statistics', 'common', 'user']);
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={classes.layout}>
        <Box sx={classes.column}>
          <KpiGrid columns={FINANCE_OVERVIEW_KPI_COLUMNS}>
            {[...Array(FINANCE_OVERVIEW_KPI_COLUMNS)].map((_, index) => <StatCardSkeleton key={index} />)}
          </KpiGrid>
          <Skeleton height={FINANCE_CHART_HEIGHT} variant="rounded" />
        </Box>
        <DashboardListCardSkeleton rows={FINANCE_QUEUE_SKELETON_ROWS} />
      </Box>
    );
  }

  /*
   * a failed read and an empty period are not the same answer. Both drew the same "no data"
   * before, so an operator whose request had failed read it as a quiet month and looked away.
   */
  if (loadError) return <SectionLoadError onRetry={onRetry} />;

  if (!overview) return <EmptyData />;

  const {
    points, gmvComparison, netRevenueComparison, pendingOverdueCount,
  } = overview;
  const labels = points.map((point) => formatStatisticsBucketLabel(point.date, period));

  return (
    <Box sx={classes.layout}>
      <Box sx={classes.column}>
        <KpiGrid columns={FINANCE_OVERVIEW_KPI_COLUMNS}>
          <StatCard
            label={t('finance:gmv')}
            sub={t('finance:gmvDescription')}
            value={formatPriceWithCurrency(gmvComparison.currentTotal, overview.currency)}
          >
            <PeriodComparisonChip withContext comparison={gmvComparison} />
          </StatCard>
          <StatCard
            label={t('finance:netRevenue')}
            sub={t('finance:netRevenueDescription')}
            value={formatPriceWithCurrency(netRevenueComparison.currentTotal, overview.currency)}
          >
            <PeriodComparisonChip withContext comparison={netRevenueComparison} />
          </StatCard>
        </KpiGrid>

        <Card sx={classes.chartCard}>
          <Typography component="h3" variant="h6">{t('finance:gmvVsNetRevenuePerPeriod')}</Typography>
          <TrendLineChart
            height={FINANCE_CHART_HEIGHT}
            labels={labels}
            valueFormatter={formatCompactChartNumber}
            yAxisMin={0}
            series={[
              { data: points.map((p) => p.gmv), label: t('finance:gmv'), color: theme.palette.info.main },
              {
                data: points.map((p) => p.netRevenue),
                label: t('finance:netRevenue'),
                color: theme.palette.warning.main,
              },
            ]}
          />
        </Card>
      </Box>

      <OverduePendingPaymentsCard
        count={pendingOverdueCount}
        loading={isRechecking}
        onRecheck={(paymentId) => onRecheck?.(paymentId)}
        payments={overduePendingPayments ?? []}
        recheckedIds={recheckedIds}
      />
    </Box>
  );
};

export default FinanceOverviewSection;
