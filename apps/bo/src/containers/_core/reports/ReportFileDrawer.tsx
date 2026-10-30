import { type Theme } from '@emotion/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

import { REPORT_PATTERN_THRESHOLD } from '@/constants/_core/report.constants';
import {
  REPORT_FILE_ACTIONS_GAP, REPORT_FILE_CARD_GAP, REPORT_FILE_CHIP_GAP,
  REPORT_FILE_DRAWER_BODY_PADDING_Y, REPORT_FILE_DRAWER_FOOTER_PADDING_Y,
  REPORT_FILE_DRAWER_HEADER_PADDING_RIGHT, REPORT_FILE_DRAWER_HEADER_PADDING_Y,
  REPORT_FILE_DRAWER_PADDING_X, REPORT_FILE_DRAWER_SECTION_GAP, REPORT_FILE_DRAWER_WIDTH,
  REPORT_FILE_NAV_BUTTON_SIZE, REPORT_FILE_NAV_ICON_SIZE, REPORT_FILE_RESOLUTION_ROWS,
} from '@/constants/_core/ui/inbox.constants';
import { DIALOG_TITLE_LINE_GAP } from '@/constants/_core/ui/ui.constants';
import ReportDecisionActions from '@/containers/_core/reports/ReportDecisionActions';
import ReportFileCard from '@/containers/_core/reports/ReportFileCard';
import ReportHistoryList from '@/containers/_core/reports/ReportHistoryList';
import ReportResolution from '@/containers/_core/reports/ReportResolution';
import { useReportDecisionForm } from '@/hooks/_core/useReportDecisionForm';
import {
  IReport, ReportResolutionInput, ReportStatusEnum, ReportTargetTypeEnum,
} from '@/types/_core/report.type';
import {
  displayReportTarget, getReportTargetTypeLabelByValue, isOpenReportStatus, isReportTargetOpenable,
} from '@/utils/_core/report.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  paper: {
    width: REPORT_FILE_DRAWER_WIDTH,
    // full width on a phone, where a side sheet would leave a sliver of list nobody can use
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${DIALOG_TITLE_LINE_GAP}px`,
    // the close button sits close to the edge, so the right side is tighter than the left
    paddingBlock: `${REPORT_FILE_DRAWER_HEADER_PADDING_Y}px`,
    paddingLeft: `${REPORT_FILE_DRAWER_PADDING_X}px`,
    paddingRight: `${REPORT_FILE_DRAWER_HEADER_PADDING_RIGHT}px`,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  /*
   * the header states what the file is about before it states anything about the report: the kind
   * of thing, its name, and how many complaints it has already drawn — the fact the decision
   * under it turns on
   */
  title: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: `${DIALOG_TITLE_LINE_GAP}px`,
    flex: 1,
    minWidth: 0,
  },
  overline: (theme: Theme) => ({ color: getDesignTokens(theme).textMuted }),
  target: {
    textAlign: 'left' as const,
    textWrap: 'pretty' as const,
    color: 'text.primary',
    typography: 'h5',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${REPORT_FILE_CHIP_GAP}px`,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  navButton: (theme: Theme) => ({
    width: REPORT_FILE_NAV_BUTTON_SIZE,
    height: REPORT_FILE_NAV_BUTTON_SIZE,
    color: getDesignTokens(theme).textMuted,
  }),
  position: (theme: Theme) => ({
    color: getDesignTokens(theme).textMuted,
    whiteSpace: 'nowrap' as const,
  }),
  body: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${REPORT_FILE_DRAWER_SECTION_GAP}px`,
    padding: `${REPORT_FILE_DRAWER_BODY_PADDING_Y}px ${REPORT_FILE_DRAWER_PADDING_X}px`,
  },
  history: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${REPORT_FILE_CARD_GAP}px`,
  },
  historyTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: `${REPORT_FILE_CHIP_GAP}px`,
  },
  /*
   * the decision stays in reach however far the body has been scrolled: a long history must not
   * push the way out of the file below the fold
   */
  footer: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${REPORT_FILE_ACTIONS_GAP}px`,
    flexShrink: 0,
    padding: `${REPORT_FILE_DRAWER_FOOTER_PADDING_Y}px ${REPORT_FILE_DRAWER_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
};

type Props = {
  report: IReport | null;
  // the other reports on the same target — what a ruling is weighed against
  history: IReport[];
  isHistoryLoading: boolean;
  // where the open report stands among the ones being worked through, when it is one of them
  position?: { current: number; total: number };
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onOpenAsPage: (report: IReport) => void;
  onOpenTarget: (report: IReport) => void;
  onOpenReporter: (userId: string) => void;
  onSelectHistory: (report: IReport) => void;
  onResolve: (
    values: ReportResolutionInput,
    status: typeof ReportStatusEnum.RESOLVED | typeof ReportStatusEnum.DISMISSED
  ) => void;
  onSuspend: (values: ReportResolutionInput) => void;
  onStartReview: (report: IReport) => void;
};

/**
 * The file of one report, read and ruled on from the side of the queue it came from: what was
 * reported, why, by whom, and everything else that target has drawn — with the decision taken from
 * the same place it is read.
 *
 * It is a side sheet rather than a dialog because the queue is worked through, not visited: the
 * way to the previous and the next report is in its header, so one ruling leads to the next file
 * without going back to the list. The history sits under the report instead of in a tab of its own
 * — a ruling is weighed against it, so it must not be one click away from the decision.
 */
const ReportFileDrawer = ({
  report, history, isHistoryLoading, position, onClose, onPrevious, onNext, onOpenAsPage,
  onOpenTarget, onOpenReporter, onSelectHistory, onResolve, onSuspend, onStartReview,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  const {
    methods, handleResolve, handleDismiss, handleSuspend,
  } = useReportDecisionForm({ resetKey: report?.id, onResolve, onSuspend });

  if (!report) return null;

  const totalReports = report.targetReportsCount ?? 1;
  const isOpen = isOpenReportStatus(report.status);
  // only an account can be blocked from signing in — a ride or a vehicle is not something to suspend
  const canSuspend = isOpen && report.targetType === ReportTargetTypeEnum.USER;
  const targetLabel = displayReportTarget(report.targetLabel, report.targetId);

  return (
    <FormProvider {...methods}>
      {/* a panel announced as a dialog has to say what it is about before anything inside it */}
      <Drawer
        anchor="right"
        aria-label={t('user:reports.reportFile')}
        onClose={onClose}
        open={!!report}
        slotProps={{ paper: { sx: classes.paper } }}
      >
        <Box css={classes.header}>
          <Box css={classes.title}>
            <Typography css={classes.overline} variant="overline">
              {t('user:reports.reportFile')}
            </Typography>
            {isReportTargetOpenable(report.targetType)
              ? (
                <Link
                  component="button"
                  onClick={() => onOpenTarget(report)}
                  sx={classes.target}
                  type="button"
                  underline="hover"
                >
                  {targetLabel}
                </Link>
              )
              : <Typography sx={classes.target} variant="h5">{targetLabel}</Typography>}
            <Box css={classes.badges}>
              <Chip
                label={getReportTargetTypeLabelByValue(report.targetType)}
                size="small"
                variant="outlined"
              />
              {/*
                * how many complaints the target has drawn in total, in the louder tone once that
                * count is a pattern rather than a repeat
                */}
              <Chip
                label={t('user:reports.totalReportsOnTargetWithCount', { count: totalReports })}
                size="small"
                variant="outlined"
                color={totalReports >= REPORT_PATTERN_THRESHOLD
                  ? 'error'
                  : 'warning'}
              />
            </Box>
            <Link
              component="button"
              onClick={() => onOpenAsPage(report)}
              type="button"
              variant="body2"
            >
              {t('user:reports.openAsPage')}
            </Link>
          </Box>
          <Box css={classes.nav}>
            {position && (
              <>
                <IconButton
                  aria-label={t('common:previous')}
                  css={classes.navButton}
                  disabled={!onPrevious}
                  onClick={onPrevious}
                >
                  <FiChevronLeft size={REPORT_FILE_NAV_ICON_SIZE} />
                </IconButton>
                <Typography css={classes.position} variant="body2">
                  {t('user:reports.positionOf', { position: position.current, count: position.total })}
                </Typography>
                <IconButton
                  aria-label={t('common:next')}
                  css={classes.navButton}
                  disabled={!onNext}
                  onClick={onNext}
                >
                  <FiChevronRight size={REPORT_FILE_NAV_ICON_SIZE} />
                </IconButton>
              </>
            )}
            <IconButton aria-label={t('common:close')} css={classes.navButton} onClick={onClose}>
              <FiX size={REPORT_FILE_NAV_ICON_SIZE + 1} />
            </IconButton>
          </Box>
        </Box>

        <Box css={classes.body}>
          <ReportFileCard report={report} />
          <ReportResolution isOpen={isOpen} report={report} rows={REPORT_FILE_RESOLUTION_ROWS} />
          <Box css={classes.history}>
            <Box css={classes.historyTitle}>
              <Typography variant="h6">{t('user:reports.history')}</Typography>
              {!isHistoryLoading && <Chip label={history.length} size="small" variant="outlined" />}
            </Box>
            <ReportHistoryList
              loading={isHistoryLoading}
              onOpenReporter={onOpenReporter}
              onSelect={onSelectHistory}
              reports={history}
            />
          </Box>
        </Box>

        {isOpen && (
          <Box css={classes.footer}>
            <ReportDecisionActions
              onDismiss={handleDismiss}
              onResolve={handleResolve}
              onStartReview={report.status === ReportStatusEnum.PENDING
                ? () => onStartReview(report)
                : undefined}
              onSuspend={canSuspend
                ? handleSuspend
                : undefined}
            />
          </Box>
        )}
      </Drawer>
    </FormProvider>
  );
};

export default ReportFileDrawer;
