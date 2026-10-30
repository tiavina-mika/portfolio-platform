import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { REPORT_REPEAT_THRESHOLD, REPORT_TARGET_COLUMN_WIDTH } from '@/constants/_core/report.constants';
import { TABLE_CELL_INLINE_GAP, TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { IReport } from '@/types/_core/report.type';
import { displayReportTarget, getReportTargetTypeLabelByValue } from '@/utils/_core/report.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    minWidth: 0,
    // the cell is what holds the column to its declared width — see REPORT_TARGET_COLUMN_WIDTH
    maxWidth: REPORT_TARGET_COLUMN_WIDTH,
  },
  line: {
    display: 'flex',
    alignItems: 'center',
    gap: `${TABLE_CELL_INLINE_GAP}px`,
    minWidth: 0,
  },
};

type Props = {
  report: IReport;
};

/**
 * What the report is about, in one cell: the name of what was reported, whether it has been
 * reported before, and which kind of thing it is.
 *
 * The repeat count is what turns a queue of complaints into a queue of cases — the same name
 * appearing for the fourth time is a different decision from the same name appearing once, and
 * nothing else in the row would say so. The kind sits underneath as a quiet label rather than
 * beside the name: it qualifies the target, it is not a second fact competing with it.
 */
const ReportTargetCell = ({ report }: Props) => {
  const { t } = useTranslation(['user']);

  const repeatCount = report.targetReportsCount ?? 1;
  // truncated to the column's width, so the name it stands for has to stay readable somewhere
  const targetLabel = displayReportTarget(report.targetLabel, report.targetId);

  return (
    <Box css={classes.root}>
      <Box css={classes.line}>
        <Tooltip title={targetLabel}>
          <Typography noWrap variant="subtitle1">{targetLabel}</Typography>
        </Tooltip>
        {repeatCount >= REPORT_REPEAT_THRESHOLD && (
          <Tooltip title={t('user:reports.totalReportsOnTargetWithCount', { count: repeatCount })}>
            <Chip
              color="error"
              label={t('user:reports.repeatReportsWithCount', { count: repeatCount })}
              size="small"
            />
          </Tooltip>
        )}
      </Box>
      <Typography noWrap variant="body2">
        {getReportTargetTypeLabelByValue(report.targetType)}
      </Typography>
    </Box>
  );
};

export default ReportTargetCell;
