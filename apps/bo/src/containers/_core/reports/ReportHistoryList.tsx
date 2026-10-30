import { type Theme } from '@emotion/react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type KeyboardEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  REPORT_FILE_HISTORY_GAP, REPORT_FILE_HISTORY_LINE_GAP, REPORT_FILE_CHIP_GAP,
  REPORT_FILE_HISTORY_PADDING_X, REPORT_FILE_HISTORY_PADDING_Y,
} from '@/constants/_core/ui/inbox.constants';
import { RADIUS, SKELETON_ENTRY_COUNT, SKELETON_ENTRY_HEIGHT } from '@/constants/_core/ui/ui.constants';
import ReportReasonCell from '@/containers/_core/reports/ReportReasonCell';
import ReportStatusChip from '@/containers/_core/reports/ReportStatusChip';
import { IReport } from '@/types/_core/report.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${REPORT_FILE_HISTORY_GAP}px`,
  },
  /*
   * each past report keeps its own edge instead of being separated by a rule: the list is read to
   * count how many of these there are, and a bordered block is countable at a glance where a run of
   * divided paragraphs is not. The edge is the light one — this is context, not the case at hand.
   */
  entry: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${REPORT_FILE_HISTORY_LINE_GAP}px`,
    padding: `${REPORT_FILE_HISTORY_PADDING_Y}px ${REPORT_FILE_HISTORY_PADDING_X}px`,
    border: `1px solid ${getDesignTokens(theme).borderLight}`,
    borderRadius: RADIUS,
  }),
  // an entry that can be opened says so on hover and keyboard focus, the way a row of a list does
  openable: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      cursor: 'pointer',
      '&:hover': { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
      '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -1 },
    };
  },
  reporter: { fontWeight: 500, verticalAlign: 'baseline' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: `${REPORT_FILE_HISTORY_LINE_GAP}px`,
  },
  chips: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${REPORT_FILE_CHIP_GAP}px`,
  },
  // the signature and what can be done to the entry share one line, wrapping on a narrow sheet
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: `${REPORT_FILE_HISTORY_LINE_GAP}px`,
  },
  meta: (theme: Theme) => ({
    color: getDesignTokens(theme).textMuted,
    whiteSpace: 'nowrap' as const,
  }),
  empty: (theme: Theme) => ({
    padding: `${REPORT_FILE_HISTORY_PADDING_Y * 2}px ${REPORT_FILE_HISTORY_PADDING_X}px`,
    textAlign: 'center' as const,
    color: getDesignTokens(theme).textMuted,
  }),
};

type Props = {
  reports: IReport[];
  loading: boolean;
  /*
   * what the band says when there is nothing to list. It defaults to the wording of a report file,
   * where this list is the target's *other* reports — a screen showing every report on one thing
   * passes its own, since "no other report" would be wrong there
   */
  emptyLabel?: string;
  // opens one of these reports as the subject of the file — omitted where entries are only read
  onSelect?: (report: IReport) => void;
  // opens the account that filed an entry, from its signature
  onOpenReporter?: (userId: string) => void;
  // what can be done to one entry, drawn at the end of its signature line — nothing when omitted
  renderActions?: (report: IReport) => ReactNode;
};

/**
 * Everything else that has been filed against the same target, newest first. It is what a
 * suspension is actually weighed against: one complaint about a driver says very little, four
 * complaints from four different passengers about the same thing say almost everything, and
 * without this the operator would have to go and search the queue for them.
 */
const ReportHistoryList = ({
  reports, loading, emptyLabel, onSelect, onOpenReporter, renderActions,
}: Props) => {
  const { t } = useTranslation(['user']);

  if (loading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: SKELETON_ENTRY_COUNT }).map((_, index) => (

          <Skeleton height={SKELETON_ENTRY_HEIGHT} key={index} variant="rounded" />
        ))}
      </Stack>
    );
  }

  if (reports.length === 0) {
    return (
      <Typography css={classes.empty} variant="body2">
        {emptyLabel ?? t('user:reports.noOtherReportOnTarget')}
      </Typography>
    );
  }

  return (
    <Box css={classes.list}>
      {reports.map((report: IReport) => {
        const reporterId = report.reportedBy?.id ?? report.reportedBy?.objectId;
        const reporterName = report.isAnonymous
          ? t('user:reports.anonymous')
          : getUserFullName(report.reportedBy);
        const canOpenReporter = !!onOpenReporter && !report.isAnonymous && !!reporterId;

        return (
          <Box
            css={[classes.entry, onSelect && classes.openable]}
            key={report.id}
            onClick={onSelect && (() => onSelect(report))}
            role={onSelect && 'button'}
            tabIndex={onSelect && 0}
            onKeyDown={onSelect && ((event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(report);
              }
            })}
          >
            <Box css={classes.header}>
              <Box css={classes.chips}>
                <ReportReasonCell reason={report.reason} />
                <ReportStatusChip status={report.status} />
              </Box>
              <Typography css={classes.meta} variant="caption">
                {displayDate(report.createdAt, true)}
              </Typography>
            </Box>
            {report.details && <Typography variant="body2">{report.details}</Typography>}
            {/*
            * who filed it is what turns a run of complaints into a pattern — four reports from one
            * passenger and four from four are the same count and a different decision
            */}
            <Box css={classes.footer}>
              <Typography css={classes.meta} variant="caption">
                {t('user:reports.reportedBy')}
                {' '}
                {canOpenReporter
                  ? (
                    <Link
                      component="button"
                      css={classes.reporter}
                      type="button"
                      onClick={(event) => {
                      // the entry itself opens the report, so the name must not fire both
                        event.stopPropagation();
                        onOpenReporter(reporterId);
                      }}
                    >
                      {reporterName}
                    </Link>
                  )
                  : reporterName}
              </Typography>
              {renderActions?.(report)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ReportHistoryList;
