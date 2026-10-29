import { type Theme } from '@emotion/react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useNavigate } from '@tanstack/react-router';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import RouteLink from '@/components/Link';
import { reportsTabOptions } from '@/constants/_core/report.constants';
import {
  REPORT_PAGE_GAP, REPORT_PAGE_RESOLUTION_ROWS, REPORT_PAGE_SIDE_COLUMN_WIDTH,
} from '@/constants/_core/ui/inbox.constants';
import ReportDecisionActions from '@/containers/_core/reports/ReportDecisionActions';
import ReportDetailCard from '@/containers/_core/reports/ReportDetailCard';
import ReportFileCard from '@/containers/_core/reports/ReportFileCard';
import ReportHistoryList from '@/containers/_core/reports/ReportHistoryList';
import ReportPageMeta from '@/containers/_core/reports/ReportPageMeta';
import ReportPageTitle from '@/containers/_core/reports/ReportPageTitle';
import ReportQueueNavigation from '@/containers/_core/reports/ReportQueueNavigation';
import ReportResolution from '@/containers/_core/reports/ReportResolution';
import ReportTargetCard from '@/containers/_core/reports/ReportTargetCard';
import { useReportDecisionForm } from '@/hooks/_core/useReportDecisionForm';
import { useReportNavigation } from '@/hooks/useReportNavigation';
import {
  resolveReportAction, startReportReviewAction, suspendReportedUserAction,
} from '@/redux/actions/_core/report.action';
import {
  getReportReportSelector, getReportReportsSelector, getReportTargetHistoryLoadingSelector,
  getReportTargetHistorySelector,
} from '@/redux/reducers/_core/report.reducer';
import { reportRoute } from '@/routes/protected/_core/report.routes';
import {
  IReport, ReportResolutionInput, ReportStatusEnum, ReportTargetTypeEnum,
} from '@/types/_core/report.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { displayReportTarget, isOpenReportStatus } from '@/utils/_core/report.utils';

/*
 * The complaint and what the target has drawn take the wide column, what the ruling turns on — the
 * target and the ruling itself — the narrow one. Below the breakpoint the two columns dissolve into
 * one list, and `order` puts the target first: it is the question the other three are answered
 * against, so it is read before them on a screen too narrow to show them side by side.
 */
const classes = {
  grid: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: `${REPORT_PAGE_GAP}px`,
    alignItems: 'start',
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: `minmax(0, 1fr) ${REPORT_PAGE_SIDE_COLUMN_WIDTH}px`,
    },
  }),
  column: (theme: Theme) => ({
    display: 'contents',
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: `${REPORT_PAGE_GAP}px`,
      minWidth: 0,
    },
  }),
  target: { order: 1 },
  complaint: { order: 2 },
  history: { order: 3 },
  resolution: { order: 4 },
};

const Report = () => {
  const { id } = reportRoute.useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(['user']);

  const report = useSelector(getReportReportSelector);
  const queue = useSelector(getReportReportsSelector);
  const history = useSelector(getReportTargetHistorySelector);
  const isHistoryLoading = useSelector(getReportTargetHistoryLoadingSelector);
  const { openTarget, openUser, openReport } = useReportNavigation();

  const handleResolve = (
    values: ReportResolutionInput,
    status: typeof ReportStatusEnum.RESOLVED | typeof ReportStatusEnum.DISMISSED
  ) => {
    if (!report) return;

    dispatch(resolveReportAction({ reportId: report.id, status, resolution: values.resolution }));
  };

  const handleSuspend = (values: ReportResolutionInput) => {
    if (!report) return;

    dispatch(suspendReportedUserAction({ reportId: report.id, resolution: values.resolution }));
  };

  const handleStartReview = () => {
    if (!report) return;

    dispatch(startReportReviewAction(report.id));
  };

  const {
    methods, handleResolve: submitResolve, handleDismiss, handleSuspend: submitSuspend,
  } = useReportDecisionForm({ resetKey: report?.id, onResolve: handleResolve, onSuspend: handleSuspend });

  // a report read earlier is still in the store while this one loads — it is never drawn as this one
  if (report?.id !== id) return null;

  const isOpen = isOpenReportStatus(report.status);
  // only an account can be blocked from signing in — a ride or a vehicle is not something to suspend
  const canSuspend = isOpen && report.targetType === ReportTargetTypeEnum.USER;

  /*
   * the queue is the page of reports the operator came from, which the store still holds: reaching
   * this page from a link or a refresh finds the report outside of it, and a position in a queue
   * the operator is not in would be a number with nothing behind it
   */
  const queueIndex = queue.findIndex((queued: IReport) => queued.id === report.id);
  const position = queueIndex === -1
    ? undefined
    : { current: queueIndex + 1, total: queue.length };

  const openQueued = (offset: number) => {
    const target = queue[(queueIndex + offset + queue.length) % queue.length];

    if (target) openReport(target.id);
  };

  /*
   * back to the queue scoped to this target, the way another screen hands one over: the tab says
   * which class the id belongs to, since an object id is only unique within its own class
   */
  const handleViewInList = () => {
    navigate({
      to: PATH_NAMES.reports,
      search: {
        tab: reportsTabOptions.find((option) => option.value === report.targetType)?.tab,
        targetId: report.targetId,
      },
    } as any);
  };

  return (
    <Layout
      description={<ReportPageMeta position={position} report={report} />}
      isCard={false}
      title={<ReportPageTitle onOpenTarget={openTarget} report={report} />}
      actions={(position?.total ?? 0) > 1
        ? <ReportQueueNavigation onNext={() => openQueued(1)} onPrevious={() => openQueued(-1)} />
        : undefined}
    >
      <Head title={`${t('user:reports.report')} - ${displayReportTarget(report.targetLabel, report.targetId)}`} />
      <FormProvider {...methods}>
        <Box css={classes.grid}>
          <Box css={classes.column}>
            <Box css={classes.complaint}>
              <ReportDetailCard
                title={t('user:reports.report')}
                action={report.ticket
                  ? (
                    <RouteLink
                      params={{ id: report.ticket.objectId }}
                      to={`${PATH_NAMES.contacts}/$id`}
                      variant="body2"
                    >
                      {t('user:reports.openConversation')}
                    </RouteLink>
                  )
                  : undefined}
              >
                <ReportFileCard
                  isPlain
                  onOpenConcerned={openUser}
                  onOpenReporter={openUser}
                  report={report}
                />
              </ReportDetailCard>
            </Box>
            <Box css={classes.history}>
              <ReportDetailCard
                count={isHistoryLoading ? undefined : history.length}
                title={t('user:reports.history')}
                action={(
                  <Link
                    component="button"
                    onClick={handleViewInList}
                    type="button"
                    variant="body2"
                  >
                    {t('user:reports.viewInList')}
                  </Link>
                )}
              >
                <ReportHistoryList
                  loading={isHistoryLoading}
                  onOpenReporter={openUser}
                  onSelect={(entry: IReport) => openReport(entry.id)}
                  reports={history}
                />
              </ReportDetailCard>
            </Box>
          </Box>
          <Box css={classes.column}>
            <Box css={classes.target}>
              <ReportDetailCard title={t('user:reports.target')}>
                <ReportTargetCard onOpenPerson={openUser} onOpenTarget={openTarget} report={report} />
              </ReportDetailCard>
            </Box>
            <Box css={classes.resolution}>
              <ReportDetailCard title={t('user:reports.resolution')}>
                <ReportResolution
                  hasTitle={false}
                  isOpen={isOpen}
                  report={report}
                  rows={REPORT_PAGE_RESOLUTION_ROWS}
                />
                {isOpen && (
                  <ReportDecisionActions
                    onDismiss={handleDismiss}
                    onResolve={submitResolve}
                    onStartReview={report.status === ReportStatusEnum.PENDING
                      ? handleStartReview
                      : undefined}
                    onSuspend={canSuspend
                      ? submitSuspend
                      : undefined}
                  />
                )}
              </ReportDetailCard>
            </Box>
          </Box>
        </Box>
      </FormProvider>
    </Layout>
  );
};

export default Report;
