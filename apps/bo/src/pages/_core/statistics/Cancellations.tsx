import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import CancellationsStatisticsSection from '@/containers/_core/statistics/CancellationsStatisticsSection';
import StatisticsLayout from '@/containers/_core/statistics/StatisticsLayout';
import { useStatisticsNav } from '@/hooks/_core/useStatisticsNav';
import { clearUserSuspension } from '@/redux/actions/_core/statistics.action';
import {
  getCancellationReasonsSelector,
  getCancellationStatisticsSelector,
  getStatisticsLoadingSelector,
  getSuspendedUsersLoadingSelector,
  getSuspendedUsersSelector,
} from '@/redux/reducers/_core/statistics.reducer';
import { statisticsCancellationsRoute } from '@/routes/protected/_core/statistics.routes';
import { ExportFormat, IPeriodSearchParams } from '@/types/_core/app.type';
import { StatisticsViewEnum } from '@/types/_core/statistics.type';
import { exportRows } from '@/utils/_core/export.utils';
import { getCancellationStatisticsExportColumns } from '@/utils/_core/statistics.utils';

const Cancellations = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['statistics']);
  const { period, isComparing }: IPeriodSearchParams = statisticsCancellationsRoute.useSearch();
  const { navItems, onNavigate } = useStatisticsNav(period, isComparing);

  const cancellations = useSelector(getCancellationStatisticsSelector);
  const reasons = useSelector(getCancellationReasonsSelector);
  const suspendedUsers = useSelector(getSuspendedUsersSelector);
  const loading = useSelector(getStatisticsLoadingSelector);
  const isSuspendedUsersLoading = useSelector(getSuspendedUsersLoadingSelector);

  const handleClearSuspension = (userId: string, withPenalty: boolean, reason: string): void => {
    dispatch(clearUserSuspension(userId, withPenalty, period, reason));
  };

  const handleExport = async (format: ExportFormat): Promise<void> => {
    await exportRows(
      cancellations?.points ?? [],
      getCancellationStatisticsExportColumns(t, cancellations?.currency),
      'cancellation-statistics',
      format
    );
  };

  return (
    <StatisticsLayout
      withPeriod
      activeView={StatisticsViewEnum.CANCELLATIONS}
      exportDisabled={loading || !cancellations}
      isComparing={isComparing}
      navItems={navItems}
      onExport={handleExport}
      onNavigate={onNavigate}
      period={period}
      viewTitle={t('statistics:cancellations')}
    >
      <CancellationsStatisticsSection
        cancellations={cancellations}
        isComparing={isComparing}
        loading={loading && !cancellations}
        onClearSuspension={handleClearSuspension}
        period={period}
        reasons={reasons}
        suspendedUsers={suspendedUsers}
        suspendedUsersLoading={isSuspendedUsersLoading && !suspendedUsers}
      />
    </StatisticsLayout>
  );
};

export default Cancellations;
