import { getDisplayContacts } from '@shared/utils';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { DASHBOARD_DATE_FORMAT } from '@/constants/_core/dashboard.constants';
import { DASHBOARD_ACTIVITY_SKELETON_ROWS } from '@/constants/_core/ui/chart.constants';
import DashboardListCard, {
  DashboardActivityRow, DashboardListCardSkeleton, DashboardRowMeta,
} from '@/containers/_core/dashboard/DashboardListCard';
import DashboardSection from '@/containers/_core/dashboard/DashboardSection';
import { goToList } from '@/redux/actions/_core/util.action';
import { IDashboardRecent } from '@/types/_core/dashboard.type';
import { IUser } from '@/types/_core/user.type';
import { getDashboardRecentColumns } from '@/utils/_core/dashboard.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

type UsersColumnProps = {
  users: IUser[];
  // this week's signups, which is what the link under the column offers to open
  newUsersCount: number;
};

const RecentUsersColumn = ({ users, newUsersCount }: UsersColumnProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <DashboardListCard
      emptyDescription={t('dashboard:noNewUsers')}
      isEmpty={users.length === 0}
      onFooterClick={() => navigate(goToList('users'))}
      title={t('dashboard:newUsers')}
      variant="activity"
      footerLabel={newUsersCount > 0
        ? t('dashboard:seeNewUsers', { count: newUsersCount })
        : t('dashboard:seeAllUsers')}
    >
      {users.map((user) => {
        // a signup that came by phone has no email and no name yet: the number names it, and is not repeated
        const title = getUserFullName(user, t('user:unnamedMember'));
        const contact = getDisplayContacts(user).find((value) => value !== title);

        return (
          <DashboardActivityRow key={user.objectId ?? user.id} title={title}>
            {contact && <DashboardRowMeta>{contact}</DashboardRowMeta>}
            <DashboardRowMeta isMuted>{dayjs(user.createdAt).format(DASHBOARD_DATE_FORMAT)}</DashboardRowMeta>
          </DashboardActivityRow>
        );
      })}
    </DashboardListCard>
  );
};

type Props = {
  recent: IDashboardRecent | null;
  newUsersCount: number;
  loading: boolean;
};

const RecentSection = ({ recent, newUsersCount, loading }: Props) => {
  const { t } = useTranslation();

  if (!loading && !recent) return null;

  const isPending = loading || !recent;
  /*
   * every column a domain registers, plus the signups column this generic section owns — once the
   * rows are in, only the columns that were sent: rows the account may not read are left out
   */
  const columns = getDashboardRecentColumns()
    .filter((column) => isPending || recent[column.field] !== undefined);
  const hasUsersColumn = isPending || recent.users !== undefined;
  const columnsCount = columns.length + (hasUsersColumn ? 1 : 0);

  if (!columnsCount) return null;

  return (
    <DashboardSection columns={columnsCount} title={t('dashboard:recentActivity')}>
      {isPending
        ? Array.from({ length: columnsCount }, (_, index) => (
          <DashboardListCardSkeleton key={index} rows={DASHBOARD_ACTIVITY_SKELETON_ROWS} />
        ))
        : (
          <>
            {columns.map((column) => {
              const { Component } = column;

              // registered columns are lazy: the skeleton holds the column's slot while its chunk loads
              return (
                <Suspense
                  fallback={<DashboardListCardSkeleton rows={DASHBOARD_ACTIVITY_SKELETON_ROWS} />}
                  key={column.key}
                >
                  <Component recent={recent} />
                </Suspense>
              );
            })}
            {recent.users && <RecentUsersColumn newUsersCount={newUsersCount} users={recent.users} />}
          </>
        )}
    </DashboardSection>
  );
};

export default RecentSection;
