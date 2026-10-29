import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { ReportStatus } from '@/types/_core/report.type';
import { getReportAgeInDays, isReportOverdue } from '@/utils/_core/report.utils';

type Props = {
  createdAt: string;
  status: ReportStatus;
};

/**
 * How long the report has been waiting, in days, called out in red once an open one has passed the
 * dispute deadline. This is what keeps a hard case from sinking down a queue and never coming back
 * up: the age of a row it was easier to skip keeps growing until the column says so.
 *
 * A closed report's age stays plain text however large it gets — it is then a record of how long
 * the decision took, not a debt still owed.
 */
const ReportAgeCell = ({ createdAt, status }: Props) => {
  const { t } = useTranslation(['user']);

  const ageInDays = getReportAgeInDays(createdAt);
  const label = t('user:reports.ageInDays', { count: ageInDays });

  if (!isReportOverdue(createdAt, status)) {
    return <Typography component="span" variant="body1">{label}</Typography>;
  }

  return (
    <Tooltip title={t('user:reports.overdueTooltip')}>
      <Chip
        color="error"
        component="span"
        label={label}
        size="small"
      />
    </Tooltip>
  );
};

export default ReportAgeCell;
