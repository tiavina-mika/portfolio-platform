import Link from '@mui/material/Link';
import { useTranslation } from 'react-i18next';

import ReportStatusChip from '@/containers/_core/reports/ReportStatusChip';
import { IReport } from '@/types/_core/report.type';
import { displayReportTarget, isReportTargetOpenable } from '@/utils/_core/report.utils';

type Props = {
  report: IReport;
  onOpenTarget: (report: IReport) => void;
};

/**
 * The heading of a report's page: what it is about — a way into the thing itself while it exists —
 * and where the report stands, in the badge the page head keeps beside every entity's name.
 */
const ReportPageTitle = ({ report, onOpenTarget }: Props) => {
  const { t } = useTranslation(['user']);

  const targetLabel = displayReportTarget(report.targetLabel, report.targetId);
  const canOpenTarget = isReportTargetOpenable(report.targetType) && report.targetDetails?.exists !== false;

  return (
    <>
      <span>
        {t('user:reports.reportOn')}
        {' '}
        {canOpenTarget
          ? (
            <Link
              color="inherit"
              component="button"
              onClick={() => onOpenTarget(report)}
              sx={{ font: 'inherit', textAlign: 'left', verticalAlign: 'baseline' }}
              type="button"
              underline="hover"
            >
              {targetLabel}
            </Link>
          )
          : targetLabel}
      </span>
      <ReportStatusChip status={report.status} />
    </>
  );
};

export default ReportPageTitle;
