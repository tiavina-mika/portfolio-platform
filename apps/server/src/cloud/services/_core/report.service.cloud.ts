import { DISPUTE_SLA_HOURS } from '@shared/domain-constants';
import { SuspensionSourceEnum } from '@shared/types';
import dayjs from 'dayjs';
import compact from 'lodash/compact.js';
import countBy from 'lodash/countBy.js';

import type { Locale } from '@/types/app.type';
import type { ReportReason, ReportStatus, ReportTargetType } from '@/types/report.type';

import { getMongoCollection } from '@/cloud/utils/_core/db.utils.cloud';
import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import {
  collections,
  OPEN_REPORT_STATUSES,
  REPORT_ADMIN_NOTIFICATION_THRESHOLD,
  REPORT_BO_PATH,
  REPORT_AUTO_SUSPENSION_DAYS,
  REPORT_AUTO_SUSPENSION_THRESHOLD,
  REPORT_DUPLICATE_WINDOW_HOURS,
  REPORT_MANUAL_SUSPENSION_DAYS,
  UNRESOLVED_REPORTS_SCAN_LIMIT,
  URGENT_REPORT_REASONS,
  USE_MASTER_KEY,
} from '@/constants/_core/constants';
import {
  REPORT_RECEIVED_STATUS, REPORT_RESOLVED_STATUS, TICKET_NOTIFICATION_TYPE,
} from '@/constants/_core/notification.constants';
import { SLACK_ALERT_ICONS } from '@/constants/_core/slack.constants';
import { ReportReasonEnum, ReportStatusEnum, ReportTargetTypeEnum } from '@/types/report.type';
import { scopeCountries } from '@/utils/_core/agent-context.utils';
import { logger } from '@/utils/_core/logger';
import { consumeReportQuota } from '@/utils/_core/rate-limit.utils';
import { escapeText, getServerUrl, setValues } from '@/utils/_core/utils';

import { createNotification } from './notification.service.cloud';
import { attachReportListFields, findTargetIdsMatchingText, getReportTarget } from './report-list.service.cloud';
import { suspendUserForDays } from './user.service.cloud';
import { getUsersFromRoles } from './userRole.service.cloud';
import { sendEmailToUser } from '../../utils/_core/email.utils.cloud';
import { convertIdToPointer } from '../../utils/_core/parse.utils.cloud';
import { alertStaff } from '../../utils/_core/staff-alert.utils.cloud';
import { getUserPhoneSearchQueries } from '../../utils/_core/user-search.utils.cloud';

export const Report = Parse.Object.extend('Report');

const REPORT_PROPERTIES = [
  'reportedBy', 'targetType', 'targetId', 'reason', 'details', 'isAnonymous', 'status', 'attachments',
  'concernedUser',
];

/**
 * What a business domain does when a report on one of its entities is filed or ruled on — holding a
 * pending payout while support looks into it, say. A registry, so this generic service never has to
 * know which entities can be reported or what a report on them sets in motion.
 */
type ReportLifecycleHook = {
  onReportCreated?: (report: Parse.Object, locale: Locale) => Promise<void>;
  onReportStatusChanged?: (report: Parse.Object) => Promise<void>;
};

const reportLifecycleHooks: ReportLifecycleHook[] = [];

export const registerReportLifecycleHook = (hook: ReportLifecycleHook): void => {
  reportLifecycleHooks.push(hook);
};

const runReportCreatedHooks = async (report: Parse.Object, locale: Locale): Promise<void> => {
  for (const hook of reportLifecycleHooks) {
    await hook.onReportCreated?.(report, locale);
  }
};

const runReportStatusChangedHooks = async (reports: Parse.Object[]): Promise<void> => {
  for (const report of reports) {
    for (const hook of reportLifecycleHooks) {
      await hook.onReportStatusChanged?.(report);
    }
  }
};

type CreateReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  isAnonymous?: boolean;
  /** the photos that back the message, already uploaded */
  attachments?: { publicId: string; url: string }[];
  /** the person of the reported ride the report is about: its driver, or one of its passengers */
  concernedUserId?: string;
};

const checkNoDuplicateReport = async (
  reportedById: string,
  targetType: ReportTargetType,
  targetId: string,
  locale: Locale
): Promise<void> => {
  const since = dayjs().subtract(REPORT_DUPLICATE_WINDOW_HOURS, 'hour').toDate();

  const existingReport = await new Parse.Query(collections.Report)
    .equalTo('reportedBy', convertIdToPointer(collections.User, reportedById))
    .equalTo('targetType', targetType)
    .equalTo('targetId', targetId)
    .greaterThanOrEqualTo('createdAt', since)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  if (existingReport) {
    throw new Error(translate('error.reportAlreadySubmitted', locale));
  }
};

/**
 * Whether this reporter already filed a report on that very thing, whatever became of it. A
 * screen that offers a report needs it to say "already reported" instead of offering it again:
 * a second one is refused anyway, and the refusal would come after the form was filled in.
 *
 * Reads the same rows as the `isReportedByMe` of a page of reviews, one target at a time — a
 * screen showing a single thing has no page to group the read over.
 */
export const hasReportedTargetService = async (
  reporterId: string,
  targetType: ReportTargetType,
  targetId: string
): Promise<boolean> => {
  const existingReport = await new Parse.Query(collections.Report)
    .equalTo('reportedBy', convertIdToPointer(collections.User, reporterId))
    .equalTo('targetType', targetType)
    .equalTo('targetId', targetId)
    .equalTo('deleted', false)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  return !!existingReport;
};

export type GetReportsFilters = {
  status?: ReportStatus;
  /** several statuses at once — the BO filter panel lets the operator tick more than one */
  statuses?: ReportStatus[];
  targetType?: ReportTargetType;
  /** several target types at once — same reason as `statuses` */
  targetTypes?: ReportTargetType[];
  /**
   * every report filed against one particular thing. It is how another screen hands the queue a
   * subject it already has in hand — the review being moderated, say — instead of making the
   * operator search the queue for a name they are already looking at.
   */
  targetId?: string;
  reason?: ReportReason;
  /** several reasons at once — used by the BO "disputes" tab and the filter panel */
  reasons?: ReportReason[];
  /** still unresolved past the dispute SLA — used by the BO "overdue" tab */
  overdue?: boolean;
  /** open reports on a safety or money reason only — the BO "handle first" toggle */
  urgent?: boolean;
  /** free text matched against the name of what was reported */
  target?: string;
  /** free text matched against the name or email of whoever filed the report */
  reportedBy?: string;
  /** the reports one account filed, named by id — read from that account's own page */
  reporterId?: string;
  /** countries (ISO alpha-2) the reports were filed from — the country of the reporter, stamped at creation */
  countries?: string[];
  createdAtFrom?: string | Date;
  createdAtTo?: string | Date;
  /** only reports left unhandled for at least this many days */
  minAgeDays?: number;
  limit: number;
  skip: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
};

const REPORT_LIST_FIELDS = [
  'reportedBy', 'targetType', 'targetId', 'reason', 'details',
  'status', 'isAnonymous', 'reviewedBy', 'reviewStartedAt', 'resolvedBy', 'resolvedAt', 'resolution',
  'createdAt',
];

/** How many reporters one search of the queue by reporter name may resolve to. */
const REPORTER_SEARCH_LIMIT = 200;

/**
 * Whoever filed a report is a pointer, so a search by reporter name has to become a set of users
 * before it can be a query term.
 * @param text what the operator typed in the "reported by" field
 * @returns the matching users — an empty array means the search matched nobody
 */
const findReportersMatchingText = async (text: string): Promise<Parse.User[]> => {
  const searched = text.trim();

  if (!searched) return [];

  const pattern = escapeText(searched);
  const fields = ['firstName', 'lastName', 'email'];
  const queries = [
    ...fields.map((field) => new Parse.Query(Parse.User).matches(field, pattern)),
    // a reporter who signed up by phone has no email: their number is what finds them
    ...getUserPhoneSearchQueries(searched),
  ];

  return Parse.Query.or(...queries)
    .select(['objectId'])
    .limit(REPORTER_SEARCH_LIMIT)
    .find(USE_MASTER_KEY);
};

type ResolvedTextFilters = {
  targetIds?: string[];
  reporters?: Parse.User[];
};

/**
 * Turns the queue's filters into the terms every query below shares. Built fresh on each call
 * rather than reused: the priority ordering runs the same filters over several disjoint slices of
 * the collection, and a Parse.Query accumulates its constraints.
 * @param filters the queue's filters
 * @param resolved the text filters already turned into ids, when the operator typed any
 * @returns a query carrying every filter but the page and the ordering
 */
const buildReportsQuery = (
  filters: GetReportsFilters,
  resolved: ResolvedTextFilters
): Parse.Query => {
  const query = new Parse.Query(collections.Report)
    .equalTo('deleted', false)
    .select(REPORT_LIST_FIELDS)
    .include(['reportedBy', 'resolvedBy', 'reviewedBy']);

  if (filters.status) query.equalTo('status', filters.status);
  if (filters.statuses?.length) query.containedIn('status', filters.statuses);
  if (filters.targetType) query.equalTo('targetType', filters.targetType);
  if (filters.targetTypes?.length) query.containedIn('targetType', filters.targetTypes);
  /*
   * an object id is only unique within its own class, so this is meant to travel with the target
   * type that qualifies it — the deep links that set it scope the queue to that type as well
   */
  if (filters.targetId) query.equalTo('targetId', filters.targetId);
  if (filters.reporterId) query.equalTo('reportedBy', convertIdToPointer(collections.User, filters.reporterId));
  if (filters.reason) query.equalTo('reason', filters.reason);
  if (filters.reasons?.length) query.containedIn('reason', filters.reasons);
  // the countries the agent's roles cover, whether or not a filter asks for any
  const countries = scopeCountries(filters.countries);

  if (countries) query.containedIn('country', countries);

  if (filters.overdue) {
    query
      .containedIn('status', OPEN_REPORT_STATUSES)
      .lessThan('createdAt', dayjs().subtract(DISPUTE_SLA_HOURS, 'hour').toDate());
  }

  if (filters.urgent) {
    query
      .containedIn('reason', URGENT_REPORT_REASONS)
      .containedIn('status', OPEN_REPORT_STATUSES);
  }

  /*
   * an empty array is not the same as no filter here: the operator did search for a target or a
   * reporter and nothing matched, so the queue has to come back empty rather than unfiltered
   */
  if (resolved.targetIds) query.containedIn('targetId', resolved.targetIds);
  if (resolved.reporters) query.containedIn('reportedBy', resolved.reporters);

  if (filters.createdAtFrom) {
    query.greaterThanOrEqualTo('createdAt', new Date(filters.createdAtFrom));
  }

  if (filters.createdAtTo) query.lessThanOrEqualTo('createdAt', new Date(filters.createdAtTo));

  if (filters.minAgeDays) {
    query.lessThanOrEqualTo('createdAt', dayjs().subtract(filters.minAgeDays, 'day').toDate());
  }

  return query;
};

/**
 * The order the queue opens in, as the four disjoint slices it actually is: what is dangerous and
 * still open, what was dangerous, what is still open, and everything else — each oldest first.
 *
 * It cannot be a sort: neither "the reason is one of the urgent ones" nor "the status is still
 * open" is a field to order on, and storing them would mean a second copy of the same judgement,
 * free to drift from the lists it was derived from. Paging over the slices in order gives the same
 * result as sorting on all three keys at once, at the cost of one count per slice.
 */
const PRIORITY_BUCKETS: ((query: Parse.Query) => Parse.Query)[] = [
  (query) => query
    .containedIn('reason', URGENT_REPORT_REASONS)
    .containedIn('status', OPEN_REPORT_STATUSES),
  (query) => query
    .containedIn('reason', URGENT_REPORT_REASONS)
    .notContainedIn('status', OPEN_REPORT_STATUSES),
  (query) => query
    .notContainedIn('reason', URGENT_REPORT_REASONS)
    .containedIn('status', OPEN_REPORT_STATUSES),
  (query) => query
    .notContainedIn('reason', URGENT_REPORT_REASONS)
    .notContainedIn('status', OPEN_REPORT_STATUSES),
];

/** the sort key meaning "the order an operator should work the queue in", not a stored field */
export const REPORT_PRIORITY_ORDER_BY = 'priority';

/**
 * Walks the priority slices in order until the requested page is filled, skipping whole slices the
 * page starts past. The total is the sum of the slice counts, so the queue still knows how many
 * rows the filters match without a query of its own.
 * @param filters the queue's filters, including the page to return
 * @param resolved the text filters already turned into ids
 * @returns the page of reports and the total the filters match
 */
const findReportsByPriority = async (
  filters: GetReportsFilters,
  resolved: ResolvedTextFilters
): Promise<{ results: Parse.Object[]; count: number }> => {
  const { skip, limit } = filters;

  const counts = await Promise.all(PRIORITY_BUCKETS.map((scope) =>
    scope(buildReportsQuery(filters, resolved)).count(USE_MASTER_KEY)));

  const results: Parse.Object[] = [];
  let remainingSkip = skip;

  for (const [index, scope] of PRIORITY_BUCKETS.entries()) {
    if (results.length >= limit) break;

    const bucketCount = counts[index] ?? 0;

    if (remainingSkip >= bucketCount) {
      remainingSkip -= bucketCount;
      continue;
    }

    /*
     * sequential on purpose: each slice is only queried once the ones above it are known to be
     * exhausted, so how much of it the page needs depends on what came before
     */

    const bucketResults = await scope(buildReportsQuery(filters, resolved))
      .ascending('createdAt')
      .skip(remainingSkip)
      .limit(limit - results.length)
      .find(USE_MASTER_KEY);

    results.push(...bucketResults);
    remainingSkip = 0;
  }

  return { results, count: counts.reduce((total, bucketCount) => total + bucketCount, 0) };
};

/**
 * One page of the back-office report queue, each row carrying the name of what was reported and
 * how many times that same target has been reported.
 * @param filters the queue's filters, page and ordering
 * @returns the page of reports and how many the filters match in total
 */
export const getReportsService = async (
  filters: GetReportsFilters
): Promise<{ results: Parse.Object[]; count: number }> => {
  const {
    target, reportedBy, limit, skip, orderBy = 'createdAt', order = 'desc',
  } = filters;

  const searchedTargetTypes = filters.targetTypes?.length
    ? filters.targetTypes
    : (filters.targetType ? [filters.targetType] : undefined);

  const [targetIds, reporters] = await Promise.all([
    target?.trim()
      ? findTargetIdsMatchingText(target, searchedTargetTypes)
      : Promise.resolve(undefined),
    reportedBy?.trim() ? findReportersMatchingText(reportedBy) : Promise.resolve(undefined),
  ]);

  const resolved: ResolvedTextFilters = { targetIds, reporters };

  if (orderBy === REPORT_PRIORITY_ORDER_BY) {
    const priorityPage = await findReportsByPriority(filters, resolved);

    return {
      results: await attachReportListFields(priorityPage.results),
      count: priorityPage.count,
    };
  }

  const query = buildReportsQuery(filters, resolved).limit(limit).skip(skip);

  if (order === 'desc') {
    query.descending(orderBy);
  } else {
    query.ascending(orderBy);
  }

  const { results, count } = await query.withCount().find(USE_MASTER_KEY) as unknown as {
    results: Parse.Object[];
    count: number;
  };

  return { results: await attachReportListFields(results), count };
};

export const getReportById = async (reportId: string): Promise<Parse.Object> => {
  return new Parse.Query(collections.Report)
    .include(['reportedBy', 'resolvedBy'])
    .get(reportId, USE_MASTER_KEY);
};

/**
 * Counts the members who have an unresolved report on the target, one per member however many
 * reports they filed: a threshold meant to measure how many people complain must not be reachable
 * by one person.
 */
const countOpenReportsByReporter = async (
  targetType: ReportTargetType,
  targetId: string
): Promise<Record<string, number>> => {
  const reports = await new Parse.Query(collections.Report)
    .equalTo('targetType', targetType)
    .equalTo('targetId', targetId)
    .containedIn('status', OPEN_REPORT_STATUSES)
    .select(['reportedBy'])
    .limit(UNRESOLVED_REPORTS_SCAN_LIMIT)
    .find(USE_MASTER_KEY);

  return countBy(compact(reports.map((report) => report.get('reportedBy')?.id as string | undefined)));
};

/*
 * Each administrator is written to in their own language rather than in the language of the member
 * whose report crossed the threshold — that member's locale says nothing about who reads the alert.
 */
const notifyAdminsOfReportThreshold = async (
  targetType: ReportTargetType,
  targetId: string,
  count: number
): Promise<void> => {
  const admins = await getUsersFromRoles(['OWNER', 'SUPER_ADMIN']);

  const failures = await alertStaff(admins, (locale) => ({
    subject: translate('email.reportThresholdReachedSubject', locale),
    message: translate('email.reportThresholdReachedMessage', locale, {
      count: String(count),
      targetType,
      targetId,
    }),
  }), {
    icon: SLACK_ALERT_ICONS.report,
    details: `${targetType} ${targetId} — ${count}`,
    url: `${getServerUrl()}/${REPORT_BO_PATH}`,
  });

  failures.forEach(({ recipient, error }) => (
    logger.error(`Report threshold e-mail failed for admin ${recipient.id}`, error)
  ));
};

const applyPreventiveSuspension = (userId: string, locale: Locale): Promise<Parse.User> =>
  suspendUserForDays(
    userId,
    REPORT_AUTO_SUSPENSION_DAYS,
    { source: SuspensionSourceEnum.REPORT_THRESHOLD },
    locale
  );

/**
 * Checks the number of distinct members with an unresolved report on a target and applies the
 * configured thresholds:
 * - REPORT_ADMIN_NOTIFICATION_THRESHOLD -> notify admins by email
 * - REPORT_AUTO_SUSPENSION_THRESHOLD -> preventive suspension (user targets only)
 *
 * A thresholds fires when a new member joins the complaint, never on a repeat report: the count only
 * moves when the reporter is new, so a member who already had an open report is ignored here —
 * otherwise their next report would land on the same count and fire the threshold a second time.
 */
export const checkReportThreshold = async (
  targetType: ReportTargetType,
  targetId: string,
  reporterId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  const reportsByReporter = await countOpenReportsByReporter(targetType, targetId);

  if ((reportsByReporter[reporterId] ?? 0) > 1) return;

  const count = Object.keys(reportsByReporter).length;

  if (count === REPORT_ADMIN_NOTIFICATION_THRESHOLD) {
    await notifyAdminsOfReportThreshold(targetType, targetId, count);
  }

  if (targetType === ReportTargetTypeEnum.USER && count === REPORT_AUTO_SUSPENSION_THRESHOLD) {
    await applyPreventiveSuspension(targetId, locale);
  }
};

/**
 * Tells the member who filed a report where it stands, in the app and by push. The e-mail alone left
 * a member who signed up with a phone number — and so has no address — with no trace of what became
 * of their report. Filed under the ticket type: the report is something they sent to the team, and the
 * team's answer follows the same notification preference as a support reply.
 * When the report opened a support conversation, the notice carries it: tapping it opens that thread.
 * Never throws: the report is already saved, and a failed notice must not undo it.
 */
const notifyReporterInApp = async (
  reporter: Parse.User,
  status: string,
  ticket?: Parse.Object
): Promise<void> => {
  try {
    await createNotification({
      type: TICKET_NOTIFICATION_TYPE,
      to: [reporter],
      status,
      ...(ticket && { payload: { ticket: { id: ticket.id } } }),
    });
  }
  catch (error) {
    logger.error('Report notification failed', {
      reporterId: reporter.id, status, error: (error as Error).message,
    });
  }
};

const notifyReporterOfSubmission = async (report: Parse.Object, locale: Locale): Promise<void> => {
  const reporter: Parse.User = report.get('reportedBy');

  if (!reporter) return;

  await notifyReporterInApp(reporter, REPORT_RECEIVED_STATUS, report.get('ticket'));
  await sendEmailToUser(reporter, {
    subject: translate('email.reportSubmittedSubject', locale),
    message: translate('email.reportSubmittedMessage', locale),
  });
};

/**
 * Creates a Report and runs the threshold checks (admin notification / preventive suspension)
 * against unresolved reports targeting the same entity.
 */
export const createReportService = async (
  reportedBy: Parse.User,
  values: CreateReportInput,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<Parse.Object> => {
  if (values.reason === ReportReasonEnum.OTHER && !values.details) {
    throw new Error(translate('error.reportDetailsRequired', locale));
  }

  if (!(await consumeReportQuota(reportedBy.id))) {
    throw new Error(translate('error.tooManyReports', locale));
  }

  await checkNoDuplicateReport(reportedBy.id, values.targetType, values.targetId, locale);

  const { concernedUserId, ...reportValues } = values;

  if (concernedUserId) {
    const assertConcernedUser = getReportTarget(values.targetType)?.assertConcernedUser;

    // a target class that names no person of its own cannot have a concerned one
    if (!assertConcernedUser) throw new Error(translate('error.reportConcernedUserNotOnRide', locale));

    await assertConcernedUser(values.targetId, concernedUserId, locale);
  }

  const report = new Report();

  setValues(report, {
    ...reportValues,
    reportedBy,
    ...(concernedUserId && { concernedUser: convertIdToPointer(collections.User, concernedUserId) }),
    status: ReportStatusEnum.PENDING,
  }, REPORT_PROPERTIES);

  const savedReport = await report.save(null, USE_MASTER_KEY);

  await runReportCreatedHooks(savedReport, locale);
  await notifyReporterOfSubmission(savedReport, locale);
  await checkReportThreshold(values.targetType, values.targetId, reportedBy.id, locale);

  return savedReport;
};

const notifyReporterOfResolution = async (report: Parse.Object, locale: Locale): Promise<void> => {
  const reporter: Parse.User = report.get('reportedBy');

  if (!reporter) return;

  await notifyReporterInApp(reporter, REPORT_RESOLVED_STATUS, report.get('ticket'));
  await sendEmailToUser(reporter, {
    subject: translate('email.reportResolvedSubject', locale),
    message: translate('email.reportResolvedMessage', locale),
  });
};

type StartReportReviewInput = {
  reportId: string;
  reviewedBy: Parse.User;
  locale?: Locale;
};

/**
 * Takes a pending report in charge: it moves to under review and records who took it and when, so
 * two operators do not rule on the same file without knowing. A report already under review is
 * returned untouched — the first operator keeps it, and a double click or a second tab is harmless.
 * A closed report cannot be taken back: reopening a ruling is not what this does.
 *
 * Not a ruling, so the status-changed hooks (payout freeze, ticket closing) are not run.
 * @param input the report to take, and the operator taking it
 * @returns the report, under review
 * @throws when the report is already resolved or dismissed
 */
export const startReportReviewService = async ({
  reportId,
  reviewedBy,
  locale = DEFAULT_LANGUAGE,
}: StartReportReviewInput): Promise<Parse.Object> => {
  /*
   * claimed in the database, on the status: read then saved, a ruling made in between was turned
   * back into a review, and of two operators taking it at once the last one was recorded
   */
  const reportCollection = await getMongoCollection(collections.Report);
  const claimed = await reportCollection.findOneAndUpdate(
    { _id: reportId, status: ReportStatusEnum.PENDING },
    { $set: { status: ReportStatusEnum.UNDER_REVIEW, _updated_at: new Date() } }
  );
  const report = await new Parse.Query(collections.Report)
    .include(['reportedBy', 'resolvedBy', 'reviewedBy'])
    .get(reportId, USE_MASTER_KEY);

  if (!(claimed?.value ?? claimed)) {
    if (report.get('status') === ReportStatusEnum.UNDER_REVIEW) return report;

    throw new Error(translate('error.reportNotOpen', locale));
  }

  // the status is already written: only who took it and when, so a ruling made since stays as it is
  report.set('reviewedBy', reviewedBy);
  report.set('reviewStartedAt', dayjs().toDate());

  return report.save(null, USE_MASTER_KEY);
};

type ResolveReportInput = {
  reportId: string;
  status: ReportStatus;
  resolution: string;
  resolvedBy: Parse.User;
  locale?: Locale;
};

export const resolveReportService = async ({
  reportId,
  status,
  resolution,
  resolvedBy,
  locale = DEFAULT_LANGUAGE,
}: ResolveReportInput): Promise<Parse.Object> => {
  const report = await getReportById(reportId);

  report.set('status', status);
  report.set('resolution', resolution);
  report.set('resolvedBy', resolvedBy);
  report.set('resolvedAt', dayjs().toDate());

  const savedReport = await report.save(null, USE_MASTER_KEY);

  await runReportStatusChangedHooks([savedReport]);
  await notifyReporterOfResolution(savedReport, locale);

  return savedReport;
};

type CloseReportsInput = {
  reportIds: string[];
  resolvedBy: Parse.User;
  resolution: string;
  /** what the reports are closed as — ruled on, or closed without action taken */
  status?: typeof ReportStatusEnum.RESOLVED | typeof ReportStatusEnum.DISMISSED;
  locale?: Locale;
};

/**
 * Closes several reports at once. The queue fills with duplicates of the same incident and with
 * complaints that need no decision, and closing those one file at a time is what makes an operator
 * stop clearing the queue at all. It is also how a decision taken somewhere else — moderating the
 * review a batch of reports was filed against, say — closes the files that decision answers,
 * instead of leaving them at the top of the queue for the next operator to rule on again.
 *
 * Only reports still open are touched: a bulk action must never silently re-open, re-date or
 * overwrite the resolution of a file somebody already ruled on.
 * @param input the reports to close, who is closing them, why, and as what
 * @returns the reports that were actually closed
 */
export const closeReportsService = async ({
  reportIds,
  resolvedBy,
  resolution,
  status = ReportStatusEnum.DISMISSED,
  locale = DEFAULT_LANGUAGE,
}: CloseReportsInput): Promise<Parse.Object[]> => {
  if (reportIds.length === 0) return [];

  const reports = await new Parse.Query(collections.Report)
    .containedIn('objectId', reportIds)
    .containedIn('status', OPEN_REPORT_STATUSES)
    .include(['reportedBy'])
    .limit(reportIds.length)
    .find(USE_MASTER_KEY);

  if (reports.length === 0) return [];

  const resolvedAt = dayjs().toDate();

  reports.forEach((report) => {
    report.set('status', status);
    report.set('resolution', resolution);
    report.set('resolvedBy', resolvedBy);
    report.set('resolvedAt', resolvedAt);
  });

  const savedReports = await Parse.Object.saveAll(reports, USE_MASTER_KEY);

  await runReportStatusChangedHooks(savedReports);
  await Promise.all(savedReports.map((report) => notifyReporterOfResolution(report, locale)));

  return savedReports;
};

type DismissReportsInput = Omit<CloseReportsInput, 'status'>;

/**
 * Closes several reports at once without action taken — what the queue's own bulk action does.
 * @param input the reports to close, who is closing them and why
 * @returns the reports that were actually closed
 */
export const dismissReportsService = (input: DismissReportsInput): Promise<Parse.Object[]> =>
  closeReportsService({ ...input, status: ReportStatusEnum.DISMISSED });

type SuspendReportedUserInput = {
  reportId: string;
  resolution: string;
  suspendedBy: Parse.User;
  locale?: Locale;
};

/**
 * Suspends the account a report was filed against and closes the report as resolved in the same
 * step. The two belong together: a suspension decided from a file that then stays open would put
 * the same target back at the top of the queue for the next operator to rule on again.
 *
 * Only a report whose target is an account can be acted on this way — a ride or a vehicle is not
 * something that can be suspended.
 * @param input the report the decision was made from, why, and who made it
 * @returns the closed report
 */
export const suspendReportedUserService = async ({
  reportId,
  resolution,
  suspendedBy,
  locale = DEFAULT_LANGUAGE,
}: SuspendReportedUserInput): Promise<Parse.Object> => {
  const report = await getReportById(reportId);

  if (report.get('targetType') !== ReportTargetTypeEnum.USER) {
    throw new Error(translate('error.reportTargetIsNotAUser', locale));
  }

  await suspendUserForDays(
    report.get('targetId'),
    REPORT_MANUAL_SUSPENSION_DAYS,
    { performedBy: suspendedBy, source: SuspensionSourceEnum.REPORT_DECISION },
    locale
  );

  return resolveReportService({
    reportId,
    status: ReportStatusEnum.RESOLVED,
    resolution,
    resolvedBy: suspendedBy,
    locale,
  });
};
