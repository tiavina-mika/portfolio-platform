import i18n from '@/config/i18n';
import {
  COLLECTIONS, DEFAULT_PAGINATION, EXPORT_MAX_ROWS, PAGINATION,
} from '@/constants/_core/app.constants';
import {
  REPORT_AGE_OVERDUE_VALUE, REPORT_LIST_DEFAULT_SORT, reportsTabOptions,
} from '@/constants/_core/report.constants';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { setInfoMessageSlice, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  clearReportsCountSlice, clearReportsSlice, clearReportSummarySlice,
  clearReportTargetHistorySlice, loadReportSlice, loadReportsSlice, loadReportSummarySlice,
  loadReportTargetHistorySlice, setReportsCountSlice, setReportTargetHistoryLoadingSlice,
  updateReportInListSlice,
} from '@/redux/reducers/_core/report.reducer';
import { AppDispatch } from '@/redux/store';
import {
  dismissReports, fetchReport, fetchReports, fetchReportSummary, fetchReportTargetHistory,
  resolveReport, startReportReview, suspendReportedUser,
} from '@/services/_core/report.service';
import { ExportFormat, IExportColumn, IQueriesInput } from '@/types/_core/app.type';
import {
  IReport, ReportStatusEnum, ReportTargetType,
} from '@/types/_core/report.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { exportRows } from '@/utils/_core/export.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import {
  displayReportTarget, getReportAgeInDays, getReportReasonLabelByValue,
  getReportStatusLabelByValue, getReportTargetTypeLabelByValue,
} from '@/utils/_core/report.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const collection = COLLECTIONS.report;

const reportExportColumns: IExportColumn<IReport>[] = [
  {
    header: i18n.t('user:reports.target'),
    getValue: (report) => displayReportTarget(report.targetLabel, report.targetId),
  },
  {
    header: i18n.t('user:reports.targetType'),
    getValue: (report) => getReportTargetTypeLabelByValue(report.targetType),
  },
  {
    header: i18n.t('user:reports.reason'),
    getValue: (report) => getReportReasonLabelByValue(report.reason),
  },
  { header: i18n.t('user:reports.details'), getValue: (report) => report.details ?? '' },
  {
    header: i18n.t('user:reports.reportedBy'),
    getValue: (report) => (report.isAnonymous
      ? i18n.t('user:reports.anonymous')
      : getUserFullName(report.reportedBy)),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (report) => displayDate(report.createdAt, true, false),
  },
  {
    header: i18n.t('user:reports.age'),
    getValue: (report) => getReportAgeInDays(report.createdAt),
  },
  {
    header: i18n.t('user:reports.status'),
    getValue: (report) => getReportStatusLabelByValue(report.status),
  },
  {
    header: i18n.t('user:reports.totalReportsOnTarget'),
    getValue: (report) => report.targetReportsCount ?? 1,
  },
];

/**
 * Turns what the filter panel and the tab strip hold into the flat parameters `getReports` reads.
 * The age control is the one that is not a straight rename: its first step means "past the dispute
 * deadline", which is a state of the report and not a number of days, so it becomes the `overdue`
 * filter rather than an age.
 * @param queries the list's current filters, search and page
 * @returns the cloud function's parameters
 */
const toFetchReportsInput = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = REPORT_LIST_DEFAULT_SORT.orderBy,
  order = REPORT_LIST_DEFAULT_SORT.order,
  filters,
  search,
}: IQueriesInput) => {
  const [createdAtFrom, createdAtTo] = search?.createdAt ?? [];
  const age = search?.minAgeDays;

  return {
    // the tab strip scopes the queue by what was reported
    targetType: filters?.targetType as ReportTargetType | undefined,
    /*
     * set only when another screen linked here with a subject already in hand (the review being
     * moderated, say) — it arrives as a URL parameter, not from the filter panel
     */
    targetId: filters?.targetId as string | undefined,
    statuses: search?.statuses,
    targetTypes: search?.targetTypes,
    reasons: search?.reasons,
    target: search?.target,
    reportedBy: search?.reportedBy,
    countries: search?.countries,
    createdAtFrom: createdAtFrom ? new Date(createdAtFrom).toISOString() : undefined,
    createdAtTo: createdAtTo ? new Date(createdAtTo).toISOString() : undefined,
    overdue: age === REPORT_AGE_OVERDUE_VALUE ? true : undefined,
    minAgeDays: age && age !== REPORT_AGE_OVERDUE_VALUE ? Number(age) : undefined,
    urgent: filters?.urgent === true ? true : undefined,
    limit,
    skip,
    orderBy,
    order,
  };
};

/*
 * hand-written instead of `createCrudThunks` (crudThunks.factory.ts): `getReports` takes flat
 * `status`/`targetType`/`reason` params, not the nested `filters` object every other domain's
 * list cloud function reads — and Report has no `seen` field/recycle-bin tab to toggle, so the
 * factory's assumptions (deleted-field toggle, bulk mark-as-seen) don't fit this entity
 */
export const loadReports = (queries: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await fetchReports(toFetchReportsInput(queries));

    dispatch(loadReportsSlice(result.results));
    dispatch(setReportsCountSlice(result.count));
    rememberListQuery(loadReportsSlice, queries);
  });
};

/*
 * loaded apart from the list and never inside its loader: the figures describe the whole
 * collection, so narrowing the rows must not move them — and a failure here must not take the
 * queue itself down with it
 */
export const loadReportSummary = (): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    try {
      const summary = await fetchReportSummary();

      dispatch(loadReportSummarySlice(summary));
    } catch {
      // the summary is secondary to the queue — the rows stay usable without it
      dispatch(clearReportSummarySlice());
    }
  };
};

export const onReportsEnter = (route?: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      ...REPORT_LIST_DEFAULT_SORT,
    };

    values.filters = convertSearchParamsToFilters({
      tabs: reportsTabOptions,
      searchParams: route.search,
      filters: {},
    });

    dispatch(clearListUnlessLoadedWith(
      loadReportsSlice, values, [clearReportsSlice(), clearReportsCountSlice()]
    ));
    dispatch(loadReports(values));
    dispatch(loadReportSummary());
  },
  { collection, action: 'find' });
};

/*
 * the queue and its figures are kept for the next visit, which shows them while it reads them
 * again — only the history of the report whose file was open goes: it describes one record, and
 * the next file opened must not show it while its own is being read
 */
export const onReportsLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearReportTargetHistorySlice());
  };
};

/**
 * Loads what else has been filed against the target of the report whose file was just opened.
 * @param report the report the file is open on
 * @returns the thunk loading its target's other reports
 */
export const loadReportTargetHistory = (report: IReport): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    dispatch(setReportTargetHistoryLoadingSlice(true));

    try {
      const history = await fetchReportTargetHistory({
        targetType: report.targetType,
        targetId: report.targetId,
        excludeReportId: report.id,
      });

      dispatch(loadReportTargetHistorySlice(history));
    } catch {
      /*
       * the file's own report is what the operator came for — a history that failed to load must
       * leave the decision buttons usable rather than blocking the whole dialog
       */
      dispatch(clearReportTargetHistorySlice());
    } finally {
      dispatch(setReportTargetHistoryLoadingSlice(false));
    }
  };
};

/**
 * Loads the report a page at its own address is about, and what else its target has drawn.
 * @param route the route being entered, holding the report's id
 * @returns the thunk reading them
 */
export const onReportEnter = (route?: any): any => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params?.id) return;

    const report = await fetchReport(route.params.id);

    dispatch(loadReportSlice(report));
    // not awaited: the history draws its own skeleton, the decision does not wait on it
    dispatch(loadReportTargetHistory(report));
  },
  { collection, action: 'get' });
};

export const goToReport = (id: string): any => ({ to: PATH_NAMES.reports + '/$id', params: { id } });

export const clearReportTargetHistory = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearReportTargetHistorySlice());
  };
};

/**
 * resolves or dismisses a pending/under-review report — Report has no soft-delete/bulk-toggle
 * workflow like other entities, it moves through `resolveReport` (server-side) instead
 */
export const resolveReportAction = (input: {
  reportId: string;
  status: typeof ReportStatusEnum.RESOLVED | typeof ReportStatusEnum.DISMISSED;
  resolution: string;
}): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedReport = await resolveReport(input);

    dispatch(updateReportInListSlice(updatedReport));
    dispatch(setMessageSlice(i18n.t('user:reports.resolvedSuccessfully')));
    dispatch(loadReportSummary());
  },
  { collection, action: 'update' });
};

/**
 * Takes a pending report in charge — it moves to under review under the operator's name, without
 * being ruled on.
 * @param reportId the report to take
 * @returns the thunk taking it
 */
export const startReportReviewAction = (reportId: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedReport = await startReportReview(reportId);

    dispatch(updateReportInListSlice(updatedReport));
    dispatch(setMessageSlice(i18n.t('user:reports.reviewStartedSuccessfully')));
    dispatch(loadReportSummary());
  },
  { collection, action: 'update' });
};

/**
 * Closes the ticked reports without action taken. Reports somebody already ruled on are left
 * untouched server-side, so the count reported back is the one the operator actually changed.
 * @param input the reports to close and why
 * @returns the thunk closing them
 */
export const dismissReportsAction = (input: {
  reportIds: string[];
  resolution: string;
}): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedReports = await dismissReports(input);

    updatedReports.forEach((report) => dispatch(updateReportInListSlice(report)));
    dispatch(setMessageSlice(
      i18n.t('user:reports.dismissedSuccessfully', { count: updatedReports.length })
    ));
    dispatch(loadReportSummary());
  },
  { collection, action: 'update' });
};

/**
 * Suspends the reported account and closes the report in one step.
 * @param input the report the decision was made from, and why
 * @returns the thunk applying it
 */
export const suspendReportedUserAction = (input: {
  reportId: string;
  resolution: string;
}): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedReport = await suspendReportedUser(input);

    dispatch(updateReportInListSlice(updatedReport));
    dispatch(setMessageSlice(i18n.t('user:reports.suspendedSuccessfully')));
    dispatch(loadReportSummary());
  },
  { collection, action: 'update' });
};

/**
 * Writes the queue out as a file, over the scope the reader picked in the export menu: everything
 * the current filters match, the page on screen, or only the rows they ticked.
 * @param queries the list's current filters, already narrowed to that scope
 * @param format csv or xlsx
 * @returns the thunk producing the file
 */
export const exportReports = (queries: IQueriesInput, format: ExportFormat): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const { ids, ...listQueries } = queries;

    const result = await fetchReports(toFetchReportsInput({
      ...listQueries,
      limit: listQueries.limit ?? EXPORT_MAX_ROWS,
    }));

    const rows = ids?.length
      ? result.results.filter((report: IReport) => ids.includes(report.id))
      : result.results;

    await exportRows(rows, reportExportColumns, 'reports', format);

    // only an unpaginated export can hit the cap — a scoped one asked for a page it already sees
    if (!listQueries.limit && result.count > EXPORT_MAX_ROWS) {
      dispatch(setInfoMessageSlice(
        i18n.t('common:exportTruncatedWarning', { max: EXPORT_MAX_ROWS, total: result.count })
      ));
    }
  },
  { collection, action: 'find' });
};
