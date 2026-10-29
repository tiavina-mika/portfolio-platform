import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import StatisticsLayout from '@/containers/_core/statistics/StatisticsLayout';
import UsersStatisticsSection from '@/containers/_core/statistics/UsersStatisticsSection';
import { useStatisticsNav } from '@/hooks/_core/useStatisticsNav';
import {
  getStatisticsLoadingSelector,
  getUsersStatisticsSelector,
} from '@/redux/reducers/_core/statistics.reducer';
import { statisticsUsersRoute } from '@/routes/protected/_core/statistics.routes';
import { ExportFormat, IPeriodSearchParams } from '@/types/_core/app.type';
import { StatisticsViewEnum } from '@/types/_core/statistics.type';
import { exportRows } from '@/utils/_core/export.utils';
import { getUsersStatisticsExportColumns } from '@/utils/_core/statistics.utils';

const Users = () => {
  const { t } = useTranslation(['user', 'statistics']);
  const { period, isComparing }: IPeriodSearchParams = statisticsUsersRoute.useSearch();
  const { navItems, onNavigate } = useStatisticsNav(period, isComparing);

  const users = useSelector(getUsersStatisticsSelector);
  const loading = useSelector(getStatisticsLoadingSelector);

  const handleExport = async (format: ExportFormat): Promise<void> => {
    await exportRows(users?.points ?? [], getUsersStatisticsExportColumns(t), 'users-statistics', format);
  };

  return (
    <StatisticsLayout
      withPeriod
      activeView={StatisticsViewEnum.USERS}
      exportDisabled={loading || !users}
      isComparing={isComparing}
      navItems={navItems}
      onExport={handleExport}
      onNavigate={onNavigate}
      period={period}
      viewTitle={t('user:users')}
    >
      <UsersStatisticsSection
        isComparing={isComparing}
        loading={loading && !users}
        period={period}
        users={users}
      />
    </StatisticsLayout>
  );
};

export default Users;
