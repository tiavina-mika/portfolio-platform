import { type Theme } from '@emotion/react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import ImageAttachments from '@/components/ImageAttachments';
import {
  REPORT_FILE_CARD_GAP, REPORT_FILE_CARD_PADDING, REPORT_FILE_HISTORY_LINE_GAP,
} from '@/constants/_core/ui/inbox.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import ReportReasonCell from '@/containers/_core/reports/ReportReasonCell';
import ReportStatusChip from '@/containers/_core/reports/ReportStatusChip';
import { IReport } from '@/types/_core/report.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${REPORT_FILE_CARD_GAP}px`,
  },
  // quoted on the recessed ground inside its own edge, so it reads as the thing being judged
  framed: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      padding: REPORT_FILE_CARD_PADDING,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
    };
  },
  /*
   * why it was filed and where it stands sit at the two ends of the same line: they are the two
   * halves of one sentence — this is the complaint, this is what has been done about it
   */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: `${REPORT_FILE_HISTORY_LINE_GAP}px`,
  },
  details: (theme: Theme) => ({ color: getDesignTokens(theme).text }),
  signature: (theme: Theme) => ({ color: getDesignTokens(theme).textMuted }),
  reporter: { fontWeight: 500, verticalAlign: 'baseline' },
};

type Props = {
  report: IReport;
  /*
   * drawn without its frame and without the status, for a page that already states both around it:
   * a card header above and the status in the page's own heading
   */
  isPlain?: boolean;
  // makes the reporter's name a way into their account — omitted where the file is only read
  onOpenReporter?: (userId: string) => void;
  // same for the person the report names
  onOpenConcerned?: (userId: string) => void;
};

/**
 * The complaint itself, quoted: why it was filed, in the reporter's own words, signed with their
 * name and the moment it was written.
 *
 * It is drawn as a block on the recessed ground rather than as a list of labelled fields because
 * that is what it is — someone else's statement, which the operator is reading to judge, not data
 * the back-office is stating about a record it owns.
 */
const ReportFileCard = ({
  report, isPlain = false, onOpenReporter, onOpenConcerned,
}: Props) => {
  const { t } = useTranslation(['user']);

  const reportedByLabel = report.isAnonymous
    ? t('user:reports.anonymous')
    : getUserFullName(report.reportedBy);
  const reporterId = report.reportedBy?.id ?? report.reportedBy?.objectId;
  const canOpenReporter = !!onOpenReporter && !report.isAnonymous && !!reporterId;
  const concerned = report.concernedUser;
  const concernedId = concerned?.id ?? concerned?.objectId;
  const attachments = (report.attachments ?? []).map((attachment, index, all) => ({
    url: attachment.url,
    label: t('user:reports.attachment', { current: index + 1, total: all.length }),
  }));

  return (
    <Box css={[classes.root, !isPlain && classes.framed]}>
      <Box css={classes.header}>
        <ReportReasonCell reason={report.reason} />
        {!isPlain && <ReportStatusChip status={report.status} />}
      </Box>

      {report.details && (
        <Typography css={classes.details} variant="body1">{report.details}</Typography>
      )}

      {!!concerned && (
        <Typography css={classes.details} variant="body2">
          {t('user:reports.concerns')}
          {' '}
          {onOpenConcerned && concernedId
            ? (
              <Link
                component="button"
                css={classes.reporter}
                onClick={() => onOpenConcerned(concernedId)}
                type="button"
              >
                {getUserFullName(concerned)}
              </Link>
            )
            : <strong>{getUserFullName(concerned)}</strong>}
        </Typography>
      )}

      {attachments.length > 0 && <ImageAttachments attachments={attachments} />}

      <Typography css={classes.signature} variant="caption">
        {canOpenReporter
          ? (
            <>
              {t('user:reports.reportedBy')}
              {' '}
              <Link
                component="button"
                css={classes.reporter}
                onClick={() => onOpenReporter(reporterId)}
                type="button"
              >
                {reportedByLabel}
              </Link>
              {` · ${displayDate(report.createdAt, true)}`}
            </>
          )
          : `${t('user:reports.reportedByValue', { value: reportedByLabel })} · ${displayDate(report.createdAt, true)}`}
      </Typography>
    </Box>
  );
};

export default ReportFileCard;
