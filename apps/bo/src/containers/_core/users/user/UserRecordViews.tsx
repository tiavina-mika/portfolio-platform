import { useTranslation } from 'react-i18next';

import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import { IUser } from '@/types/_core/user.type';
import { DateType } from '@/types/_core/utils.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

type Props = {
  user: IUser;
  // the administrator reading the page, named "(you)" in the rows they appear in
  currentUserId?: string;
};

type ViewRow = {
  id: string;
  event: string;
  admin?: IUser;
  date: DateType;
};

/**
 * Who in the team opened this record: the first opening (the one that took the account out of the
 * queue), the latest one, and the last time it was put back in the queue. Only those three moments
 * are kept on the record — not a line per visit — so the count of visits is stated apart.
 */
const UserRecordViews = ({ user, currentUserId }: Props) => {
  const { t } = useTranslation(['user']);
  // the pointers arrive as the JSON of the account they point at, not as Parse objects
  const asUser = (pointer: unknown): IUser | undefined => pointer as IUser | undefined;

  const rows: ViewRow[] = [
    {
      id: 'first', event: t('user:detail.views.firstView'), admin: asUser(user.seenBy), date: user.seenAt,
    },
    {
      id: 'last', event: t('user:detail.views.lastView'), admin: asUser(user.lastSeenBy), date: user.lastSeenAt,
    },
    {
      id: 'unseen',
      event: t('user:detail.views.markedUnseen'),
      admin: asUser(user.unseenBy),
      date: user.unseenAt,
    },
  ].filter((row) => !!row.date);

  const renderAdmin = (row: ViewRow): string => {
    if (!row.admin) return '—';

    const name = getUserFullName(row.admin);

    return row.admin.id === currentUserId ? `${name} ${t('user:detail.views.you')}` : name;
  };

  const columns: CompactTableColumn<ViewRow>[] = [
    { id: 'event', label: t('user:detail.views.event'), render: (row) => row.event },
    { id: 'admin', label: t('user:detail.views.admin'), render: renderAdmin },
    {
      id: 'date', label: t('user:detail.views.date'), nowrap: true, render: (row) => displayDate(row.date),
    },
  ];

  return <CompactTable columns={columns} emptyTitle={t('user:detail.views.empty')} rows={rows} />;
};

export default UserRecordViews;
