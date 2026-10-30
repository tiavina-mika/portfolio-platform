import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import OverviewStatisticsSection from '@/containers/_core/statistics/OverviewStatisticsSection';
import StatisticsLayout from '@/containers/_core/statistics/StatisticsLayout';
import { useStatisticsNav } from '@/hooks/_core/useStatisticsNav';
import {
  getOverviewStatisticsSelector,
  getStatisticsLoadingSelector,
} from '@/redux/reducers/_core/statistics.reducer';
import { statisticsOverviewRoute } from '@/routes/protected/_core/statistics.routes';
import { ExportFormat, IPeriodSearchParams } from '@/types/_core/app.type';
import { StatisticsViewEnum } from '@/types/_core/statistics.type';
import { exportRows } from '@/utils/_core/export.utils';
import { getOverviewStatisticsExportColumns } from '@/utils/_core/statistics.utils';

const Overview = () => {
  const { t } = useTranslation(['statistics']);
  const { isComparing }: IPeriodSearchParams = statisticsOverviewRoute.useSearch();
  const { navItems, onNavigate } = useStatisticsNav(undefined, isComparing);

  const overview = useSelector(getOverviewStatisticsSelector);
  const loading = useSelector(getStatisticsLoadingSelector);

  const handleExport = async (format: ExportFormat): Promise<void> => {
    await exportRows(
      overview?.points ?? [],
      getOverviewStatisticsExportColumns(t),
      'overview-statistics',
      format
    );
  };

  return (
    <StatisticsLayout
      activeView={StatisticsViewEnum.OVERVIEW}
      exportDisabled={loading || !overview}
      isComparing={isComparing}
      navItems={navItems}
      onExport={handleExport}
      onNavigate={onNavigate}
      viewTitle={t('statistics:overview')}
    >
      <OverviewStatisticsSection
        isComparing={isComparing}
        loading={loading && !overview}
        overview={overview}
      />
    </StatisticsLayout>
  );
};

export default Overview;
