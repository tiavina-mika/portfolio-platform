import { useNavigate } from '@tanstack/react-router';
import {
  ReactNode, useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import ListScopeAlert from '@/components/ListScopeAlert';
import List from '@/components/table/List';
import i18n from '@/config/i18n';
import {
  REPORT_LIST_DEFAULT_SORT, REPORT_TARGET_COLUMN_WIDTH, reportsTabOptions,
} from '@/constants/_core/report.constants';
import ReportAgeCell from '@/containers/_core/reports/ReportAgeCell';
import ReportDetailsCell from '@/containers/_core/reports/ReportDetailsCell';
import ReportFileDrawer from '@/containers/_core/reports/ReportFileDrawer';
import ReportPriorityToggle from '@/containers/_core/reports/ReportPriorityToggle';
import ReportReasonCell from '@/containers/_core/reports/ReportReasonCell';
import ReportRowActions from '@/containers/_core/reports/ReportRowActions';
import ReportStatusChip from '@/containers/_core/reports/ReportStatusChip';
import ReportTargetCell from '@/containers/_core/reports/ReportTargetCell';
import SearchReports from '@/containers/_core/reports/SearchReports';
import { useReportNavigation } from '@/hooks/useReportNavigation';
import {
  clearReportTargetHistory, dismissReportsAction, exportReports, loadReports,
  loadReportTargetHistory, resolveReportAction, startReportReviewAction, suspendReportedUserAction,
} from '@/redux/actions/_core/report.action';
import {
  getReportCountSelector, getReportReportsSelector, getReportSummarySelector,
  getReportTargetHistoryLoadingSelector, getReportTargetHistorySelector,
} from '@/redux/reducers/_core/report.reducer';
import { reportsRoute } from '@/routes/protected/_core/report.routes';
import {
  ExportFormat, IListTabCounts, IQueriesInput, IRenderSearchProps,
  ITableHeadCell,
} from '@/types/_core/app.type';
import {
  IReport, IReportSearchParams, ReportResolutionInput, ReportStatusEnum,
} from '@/types/_core/report.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { isOpenReportStatus } from '@/utils/_core/report.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

interface IData {
  target: ReactNode;
  reason: ReactNode;
  details: ReactNode;
  reportedBy: string;
  age: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

/*
 * The columns answer, in order, the questions an operator asks of a report: what it is about, why
 * it was filed, what was actually said, who said it, how long it has been waiting, and where it
 * stands. The kind of target and how many times it has been reported fold into the target cell, so
 * that reads as one fact instead of three columns that only make sense next to each other.
 */
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'target',
    label: i18n.t('user:reports.target'),
    width: REPORT_TARGET_COLUMN_WIDTH,
    /*
     * the name of what was reported is resolved per page from four different classes — the report
     * itself only stores an id, so there is no field the queue can be ordered on
     */
    disableSorting: true,
  },
  { id: 'reason', label: i18n.t('user:reports.reason') },
  {
    id: 'details',
    label: i18n.t('user:reports.details'),
    // free text: ordering a queue alphabetically by what people wrote answers no question
    disableSorting: true,
  },
  { id: 'reportedBy', label: i18n.t('user:reports.reportedBy'), disableSorting: true },
  {
    id: 'age',
    label: i18n.t('user:reports.age'),
    align: 'right',
    // age is how old `createdAt` is — sorting on it is sorting on the date it is derived from
    sortFields: [{ id: 'createdAt', label: i18n.t('common:createdAt') }],
  },
  { id: 'status', label: i18n.t('user:reports.status') },
  { id: 'actions', label: 'Actions', align: 'right', disableSorting: true },
];

const Reports = () => {
  const dispatch = useDispatch();
  const reports = useSelector(getReportReportsSelector);
  const count = useSelector(getReportCountSelector);
  const summary = useSelector(getReportSummarySelector);
  const targetHistory = useSelector(getReportTargetHistorySelector);
  const isTargetHistoryLoading = useSelector(getReportTargetHistoryLoadingSelector);
  const searchParams: IReportSearchParams = reportsRoute.useSearch();
  const navigate = useNavigate();
  const { openTarget, openUser, openReport } = useReportNavigation();
  const { t } = useTranslation(['user']);

  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  /*
   * held here rather than in the filter panel: it is a scope the page is put into from its header,
   * the way a tab is, and it has to survive the panel being reset
   */
  const [isPriorityOnly, setIsPriorityOnly] = useState(false);
  const [queries, setQueries] = useState<IQueriesInput>({});

  const handleOpenPreview = useCallback((report: IReport) => {
    setSelectedReport(report);
    dispatch(loadReportTargetHistory(report));
  }, [dispatch]);

  /*
   * where the open file stands among the reports on screen — the way through the queue is the
   * list the operator is looking at, so a file opened from somewhere else (a history entry from
   * another page of the queue) has no position and offers none
   */
  const selectedIndex = selectedReport
    ? reports.findIndex((report: IReport) => report.id === selectedReport.id)
    : -1;
  const position = selectedIndex === -1
    ? undefined
    : { current: selectedIndex + 1, total: reports.length };

  const handleOpenQueued = (offset: number) => {
    const queued = reports[(selectedIndex + offset + reports.length) % reports.length];

    if (queued) handleOpenPreview(queued);
  };

  /*
   * a history entry opens as the subject of the file. It was read for its target's history, so it
   * does not carry the target's name or report count — those are the same as the file it was
   * listed under, and are carried over rather than read again
   */
  const handleSelectHistory = (entry: IReport) => {
    if (!selectedReport) return;

    handleOpenPreview(reports.find((report: IReport) => report.id === entry.id) ?? {
      ...entry,
      targetLabel: selectedReport.targetLabel,
      targetReportsCount: selectedReport.targetReportsCount,
    });
  };

  const handleRowClick = useCallback((id: string) => {
    const clickedReport = reports.find((report: IReport) => report.id === id);

    if (!clickedReport) return;

    handleOpenPreview(clickedReport);
  }, [handleOpenPreview, reports]);

  /*
   * closing a report from its row goes through the same action as the bulk one — a single id is a
   * selection of one, and both write the same note saying the decision was taken from the queue
   */
  const handleRowDismiss = useCallback((report: IReport) => {
    dispatch(dismissReportsAction({
      reportIds: [report.id],
      resolution: t('user:reports.listDismissResolution'),
    }));
  }, [dispatch, t]);

  const dataTable = useMemo((): IData[] => {
    return reports.map((report: IReport) => ({
      id: report.id, // required even if not displayed
      target: <ReportTargetCell report={report} />,
      reason: <ReportReasonCell reason={report.reason} />,
      details: <ReportDetailsCell details={report.details} />,
      reportedBy: report.isAnonymous
        ? t('user:reports.anonymous')
        : getUserFullName(report.reportedBy),
      age: <ReportAgeCell createdAt={report.createdAt} status={report.status} />,
      status: <ReportStatusChip status={report.status} />,
      actions: (
        <ReportRowActions
          onDismiss={handleRowDismiss}
          onPreview={handleOpenPreview}
          report={report}
        />
      ),
    } as IData));
  }, [reports, t, handleRowDismiss, handleOpenPreview]);

  /*
   * the queue keeps the last filters it was loaded with so the header's priority toggle and the
   * bulk actions can re-run the same query — neither of them goes through the list's own toolbar
   */
  const loadWith = useCallback((newQueries: IQueriesInput, priorityOnly: boolean) => {
    const merged: IQueriesInput = {
      ...newQueries,
      filters: { ...newQueries.filters, urgent: priorityOnly },
    };

    setQueries(merged);
    dispatch(loadReports(merged));
  }, [dispatch]);

  const handleUpdateData = (newQueries: IQueriesInput) => loadWith(newQueries, isPriorityOnly);

  const handleTogglePriority = (active: boolean) => {
    setIsPriorityOnly(active);
    loadWith({ ...queries, skip: 0 }, active);
  };

  const handleExport = (format: ExportFormat, exportQueries: IQueriesInput) => {
    dispatch(exportReports({
      ...exportQueries,
      filters: { ...exportQueries.filters, urgent: isPriorityOnly },
    }, format));
  };

  /*
   * leaving the scope means leaving the URL that carries it — the queue is reloaded by the route,
   * the same way switching tab is, rather than by unsetting a filter the panel never held
   */
  const handleClearTargetScope = () => {
    navigate({ to: PATH_NAMES.reports, search: { tab: searchParams.tab } } as any);
  };

  const handleClosePreviewDialog = () => {
    setSelectedReport(null);
    dispatch(clearReportTargetHistory());
  };

  /*
   * ruling on a report leads to the next one still owing a decision, after it in the queue and then
   * from the top: the file is worked through, so closing the sheet after every ruling would make
   * the operator reopen it a hundred times. When nothing is left to rule on, it closes.
   */
  const handleOpenNextOpenReport = () => {
    const following = selectedIndex === -1
      ? []
      : [...reports.slice(selectedIndex + 1), ...reports.slice(0, selectedIndex)];
    const nextOpenReport = following.find((report: IReport) => isOpenReportStatus(report.status));

    if (nextOpenReport) {
      handleOpenPreview(nextOpenReport);
    } else {
      handleClosePreviewDialog();
    }
  };

  const handleResolve = (
    values: ReportResolutionInput,
    status: typeof ReportStatusEnum.RESOLVED | typeof ReportStatusEnum.DISMISSED
  ) => {
    if (!selectedReport) return;

    dispatch(resolveReportAction({ reportId: selectedReport.id, status, resolution: values.resolution }));
    handleOpenNextOpenReport();
  };

  const handleSuspend = (values: ReportResolutionInput) => {
    if (!selectedReport) return;

    dispatch(suspendReportedUserAction({
      reportId: selectedReport.id,
      resolution: values.resolution,
    }));
    handleOpenNextOpenReport();
  };

  const handleStartReview = (report: IReport) => {
    dispatch(startReportReviewAction(report.id));
  };

  const handleDismissSelected = (ids: string[]) => {
    dispatch(dismissReportsAction({
      reportIds: ids,
      resolution: t('user:reports.listDismissResolution'),
    }));
  };

  /*
   * `all` is the whole collection rather than the sum of the four scopes — they are exhaustive
   * today, but a target type added later must not silently make the unscoped tab under-count
   */
  const tabCounts: IListTabCounts | undefined = summary
    ? { all: summary.total, ...summary.byTargetType }
    : undefined;

  const description = summary
    ? t('user:reports.reportsWithCount', { count: summary.total })
    : undefined;

  return (
    <>
      <Head title={t('user:reports.reports')} />
      <PageHeader
        description={description}
        title={t('user:reports.reports')}
        actions={(
          <ReportPriorityToggle
            active={isPriorityOnly}
            onToggle={handleTogglePriority}
            summary={summary}
          />
        )}
      />
      {!!searchParams.targetId && (
        <ListScopeAlert
          clearLabel={t('user:reports.seeAllReports')}
          onClear={handleClearTargetScope}
          message={reports[0]?.targetLabel
            ? t('user:reports.scopedToTargetWithName', { value: reports[0].targetLabel })
            : t('user:reports.scopedToTarget')}
        />
      )}
      <List<IData>
        count={count}
        defaultFilters={searchParams} // @see private.routes.tsx
        defaultOrder={REPORT_LIST_DEFAULT_SORT.order}
        defaultOrderBy={REPORT_LIST_DEFAULT_SORT.orderBy}
        disableRowClickEvent={false}
        headCells={headCells}
        items={dataTable}
        listId="reports"
        onExport={handleExport}
        onRowClick={handleRowClick}
        onUpdateData={handleUpdateData}
        renderFilter={(prop: IRenderSearchProps) => <SearchReports {...prop} />}
        tabCounts={tabCounts}
        tabs={reportsTabOptions}
        selectionOptions={[
          {
            label: t('user:reports.dismiss'),
            onClick: handleDismissSelected,
            destructive: true,
            display: true,
          },
        ]}
      />
      <ReportFileDrawer
        history={targetHistory}
        isHistoryLoading={isTargetHistoryLoading}
        onClose={handleClosePreviewDialog}
        onNext={() => handleOpenQueued(1)}
        onOpenAsPage={(report: IReport) => openReport(report.id)}
        onOpenReporter={openUser}
        onOpenTarget={openTarget}
        onPrevious={() => handleOpenQueued(-1)}
        onResolve={handleResolve}
        onSelectHistory={handleSelectHistory}
        onStartReview={handleStartReview}
        onSuspend={handleSuspend}
        position={position}
        // the row in the list, not the copy taken when the file was opened: it carries the take-over
        report={selectedIndex === -1 ? selectedReport : reports[selectedIndex]}
      />
    </>
  );
};

export default Reports;
