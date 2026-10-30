import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { REPORT_PATTERN_THRESHOLD } from '@/constants/_core/report.constants';
import { REPORT_FILE_CHIP_GAP } from '@/constants/_core/ui/inbox.constants';
import { IReport } from '@/types/_core/report.type';
import {
  displayReportTarget, getReportTargetPersonRoleLabel, getReportTargetSubtitle,
  getReportTargetTypeLabelByValue, isReportTargetOpenable,
} from '@/utils/_core/report.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: `${REPORT_FILE_CHIP_GAP}px`,
  },
  name: {
    textAlign: 'left' as const,
    textWrap: 'pretty' as const,
    overflowWrap: 'anywhere' as const,
    typography: 'subtitle1',
  },
  person: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap' as const,
    gap: `${REPORT_FILE_CHIP_GAP}px`,
  },
};

type Props = {
  report: IReport;
  onOpenTarget: (report: IReport) => void;
  onOpenPerson: (userId: string) => void;
};

/**
 * What the report is about, stated apart from the complaint: the kind of thing, its name — a way
 * into its own page while there is one — the few facts that tell it from another of its kind, how
 * many times it has been reported, and the person behind it. The ruling turns on who and what, so it
 * is read next to the ruling rather than rebuilt from the complaint.
 *
 * A target that is gone says so instead of linking to a page that would not open: reports outlive
 * what they were filed against, and the file of a deleted ride is still one to rule on.
 */
const ReportTargetCard = ({ report, onOpenTarget, onOpenPerson }: Props) => {
  const { t } = useTranslation(['user']);

  const details = report.targetDetails;
  const person = details?.person;
  const totalReports = report.targetReportsCount ?? 1;
  const targetLabel = displayReportTarget(report.targetLabel, report.targetId);
  const canOpenTarget = isReportTargetOpenable(report.targetType) && details?.exists !== false;
  const subtitle = getReportTargetSubtitle(report.targetType, details);

  return (
    <Box css={classes.root}>
      <Chip
        label={getReportTargetTypeLabelByValue(report.targetType)}
        size="small"
        variant="outlined"
      />
      {canOpenTarget
        ? (
          <Link
            component="button"
            onClick={() => onOpenTarget(report)}
            sx={classes.name}
            type="button"
            underline="hover"
          >
            {targetLabel}
          </Link>
        )
        : <Typography sx={classes.name} variant="subtitle1">{targetLabel}</Typography>}
      {subtitle && <Typography variant="body2">{subtitle}</Typography>}
      <Chip
        label={t('user:reports.totalReportsOnTargetWithCount', { count: totalReports })}
        size="small"
        variant="outlined"
        color={totalReports >= REPORT_PATTERN_THRESHOLD
          ? 'error'
          : 'warning'}
      />
      {person && (
        <Box css={classes.person}>
          <Typography variant="body2">{getReportTargetPersonRoleLabel(person.role)}</Typography>
          <Link
            component="button"
            onClick={() => onOpenPerson(person.id)}
            sx={{ fontWeight: 500 }}
            type="button"
            underline="hover"
          >
            {person.name}
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default ReportTargetCard;
