import Chip from '@mui/material/Chip';

import { ReportReason } from '@/types/_core/report.type';
import { getReportReasonLabelByValue, isUrgentReportReason } from '@/utils/_core/report.utils';

type Props = {
  reason: ReportReason;
};

/**
 * Why the report was filed. Only the reasons that touch someone's safety or money are filled in —
 * the rest stay neutral outlines. A queue where every reason is tinted says nothing about which
 * ones to open first; here the two or three that are is exactly the signal.
 */
const ReportReasonCell = ({ reason }: Props) => (
  <Chip
    label={getReportReasonLabelByValue(reason)}
    size="small"
    color={isUrgentReportReason(reason)
      ? 'error'
      : 'default'}
    variant={isUrgentReportReason(reason)
      ? 'filled'
      : 'outlined'}
  />
);

export default ReportReasonCell;
