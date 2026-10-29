import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import PaymentsStatisticsSection from '@/containers/_core/statistics/PaymentsStatisticsSection';
import StatisticsLayout from '@/containers/_core/statistics/StatisticsLayout';
import { useStatisticsNav } from '@/hooks/_core/useStatisticsNav';
import {
  getPaymentsStatisticsSelector,
  getStatisticsLoadingSelector,
} from '@/redux/reducers/_core/statistics.reducer';
import { statisticsPaymentsRoute } from '@/routes/protected/_core/statistics.routes';
import { ExportFormat, IPeriodSearchParams } from '@/types/_core/app.type';
import { StatisticsViewEnum } from '@/types/_core/statistics.type';
import { exportRows } from '@/utils/_core/export.utils';
import { getPaymentsStatisticsExportColumns } from '@/utils/_core/statistics.utils';

const Payments = () => {
  const { t } = useTranslation(['user', 'statistics']);
  const { period, isComparing }: IPeriodSearchParams = statisticsPaymentsRoute.useSearch();
  const { navItems, onNavigate } = useStatisticsNav(period, isComparing);

  const payments = useSelector(getPaymentsStatisticsSelector);
  const loading = useSelector(getStatisticsLoadingSelector);

  const handleExport = async (format: ExportFormat): Promise<void> => {
    await exportRows(
      payments?.points ?? [],
      getPaymentsStatisticsExportColumns(t, payments?.currency),
      'payments-statistics',
      format
    );
  };

  return (
    <StatisticsLayout
      withPeriod
      activeView={StatisticsViewEnum.PAYMENTS}
      exportDisabled={loading || !payments}
      isComparing={isComparing}
      navItems={navItems}
      onExport={handleExport}
      onNavigate={onNavigate}
      period={period}
      viewTitle={t('user:payments.payments')}
    >
      <PaymentsStatisticsSection
        isComparing={isComparing}
        loading={loading && !payments}
        payments={payments}
        period={period}
      />
    </StatisticsLayout>
  );
};

export default Payments;
