import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import ReportsStatisticsSection from '@/containers/_core/statistics/ReportsStatisticsSection';
import StatisticsLayout from '@/containers/_core/statistics/StatisticsLayout';
import { useStatisticsNav } from '@/hooks/_core/useStatisticsNav';
import { goToReport } from '@/redux/actions/_core/report.action';
import {
  getReportsStatisticsSelector,
  getStatisticsLoadingSelector,
} from '@/redux/reducers/_core/statistics.reducer';
import { statisticsReportsRoute } from '@/routes/protected/_core/statistics.routes';
import { ExportFormat, IPeriodSearchParams } from '@/types/_core/app.type';
import { StatisticsViewEnum } from '@/types/_core/statistics.type';
import { exportRows } from '@/utils/_core/export.utils';
import { getReportsStatisticsExportColumns } from '@/utils/_core/statistics.utils';

const Reports = () => {
  const { t } = useTranslation(['statistics']);
  const navigate = useNavigate();
  const { period, isComparing }: IPeriodSearchParams = statisticsReportsRoute.useSearch();
  const { navItems, onNavigate } = useStatisticsNav(period, isComparing);

  const reports = useSelector(getReportsStatisticsSelector);
  const loading = useSelector(getStatisticsLoadingSelector);

  const handleOpenReport = (reportId: string): void => {
    navigate(goToReport(reportId));
  };

  const handleExport = async (format: ExportFormat): Promise<void> => {
    await exportRows(
      reports?.points ?? [],
      getReportsStatisticsExportColumns(t),
      'reports-statistics',
      format
    );
  };

  return (
    <StatisticsLayout
      withPeriod
      activeView={StatisticsViewEnum.REPORTS}
      exportDisabled={loading || !reports}
      isComparing={isComparing}
      navItems={navItems}
      onExport={handleExport}
      onNavigate={onNavigate}
      period={period}
      viewTitle={t('statistics:reports')}
    >
      <ReportsStatisticsSection
        isComparing={isComparing}
        loading={loading && !reports}
        onOpenReport={handleOpenReport}
        period={period}
        reports={reports}
      />
    </StatisticsLayout>
  );
};

export default Reports;
