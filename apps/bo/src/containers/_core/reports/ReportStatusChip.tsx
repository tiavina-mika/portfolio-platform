import { ChipProps } from '@mui/material';
import Chip from '@mui/material/Chip';

import { ReportStatus, ReportStatusEnum } from '@/types/_core/report.type';
import { getReportStatusLabelByValue } from '@/utils/_core/report.utils';

/*
 * The queue is worked open-first, so the two states that still owe someone a decision carry the
 * warmer tints: pending is untouched and reads as the debt it is, under review is already claimed
 * and only needs to be told apart from it. Resolved keeps a green that says the outcome was a
 * decision, and dismissed drops to neutral — a report closed without action is the one state the
 * eye can skip.
 */
const getStatusChipColor = (status: ReportStatus): ChipProps['color'] => {
  switch (status) {
    case ReportStatusEnum.PENDING:
      return 'error';
    case ReportStatusEnum.UNDER_REVIEW:
      return 'warning';
    case ReportStatusEnum.RESOLVED:
      return 'success';
    case ReportStatusEnum.DISMISSED:
    default:
      return 'default';
  }
};

type Props = {
  status: ReportStatus;
};

const ReportStatusChip = ({
  status,
}: Props) => (
  <Chip color={getStatusChipColor(status)} label={getReportStatusLabelByValue(status)} size="small" />
);

export default ReportStatusChip;
