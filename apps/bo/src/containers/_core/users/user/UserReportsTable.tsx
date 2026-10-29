import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SectionFooter from '@/components/SectionFooter';
import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import ReportAgeCell from '@/containers/_core/reports/ReportAgeCell';
import ReportDetailsCell from '@/containers/_core/reports/ReportDetailsCell';
import ReportReasonCell from '@/containers/_core/reports/ReportReasonCell';
import ReportStatusChip from '@/containers/_core/reports/ReportStatusChip';
import ReportTargetCell from '@/containers/_core/reports/ReportTargetCell';
import UserIdentityCell from '@/containers/_core/users/UserIdentityCell';
import { IReport } from '@/types/_core/report.type';

type Props = {
  reports: IReport[];
  count: number;
  // against: the reports filed about the member; made: the ones the member filed
  direction: 'against' | 'made';
  // the report queue scoped to the member — absent where the queue cannot be narrowed that way yet
  onViewAll?: () => void;
};

/**
 * The latest reports filed about the member, or by them. Against the member, who filed each one
 * matters — the same reporter again and again is a dispute, not a pattern; by the member, what they
 * reported matters — a member reporting everyone they ride with is a signal of its own.
 */
const UserReportsTable = ({
  reports, count, direction, onViewAll,
}: Props) => {
  const { t } = useTranslation(['user']);
  const isAgainst = direction === 'against';

  const partyColumn: CompactTableColumn<IReport> = isAgainst
    ? {
      id: 'reportedBy',
      label: t('user:detail.reports.reportedBy'),
      render: (report) => (report.isAnonymous || !report.reportedBy
        ? t('user:detail.reports.anonymous')
        : <UserIdentityCell user={report.reportedBy} />),
    }
    : {
      id: 'target',
      label: t('user:detail.reports.against'),
      render: (report) => <ReportTargetCell report={report} />,
    };

  const columns: CompactTableColumn<IReport>[] = [
    {
      id: 'reason',
      label: t('user:detail.reports.reason'),
      render: (report) => <ReportReasonCell reason={report.reason} />,
    },
    partyColumn,
    {
      id: 'details',
      label: t('common:details'),
      render: (report) => <ReportDetailsCell details={report.details} />,
    },
    {
      id: 'age',
      label: t('user:detail.reports.age'),
      nowrap: true,
      render: (report) => <ReportAgeCell createdAt={report.createdAt} status={report.status} />,
    },
    {
      id: 'status',
      label: t('user:detail.reports.status'),
      render: (report) => <ReportStatusChip status={report.status} />,
    },
  ];

  return (
    <Stack>
      <CompactTable
        columns={columns}
        rows={reports}
        emptyTitle={isAgainst
          ? t('user:detail.reports.emptyAgainst')
          : t('user:detail.reports.emptyMade')}
      />
      {onViewAll && count > reports.length && (
        <SectionFooter actionLabel={t('user:detail.viewAll')} onAction={onViewAll} />
      )}
    </Stack>
  );
};

export default UserReportsTable;
