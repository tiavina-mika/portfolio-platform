import Parse from 'parse';

import {
  IReport, IReportSummary, ReportReason, ReportStatus, ReportTargetType,
} from '@/types/_core/report.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

type FetchReportsInput = {
  status?: ReportStatus;
  statuses?: ReportStatus[];
  targetType?: ReportTargetType;
  targetTypes?: ReportTargetType[];
  targetId?: string;
  reason?: ReportReason;
  reasons?: ReportReason[];
  overdue?: boolean;
  urgent?: boolean;
  target?: string;
  reportedBy?: string;
  // the account that filed the reports, named by id — read from that account's own page
  reporterId?: string;
  countries?: string[];
  createdAtFrom?: string;
  createdAtTo?: string;
  minAgeDays?: number;
  limit: number;
  skip: number;
  orderBy: string;
  order: string;
};

/*
 * `getReports`'s params are flat (status/targetType/reason), unlike the other domains' list
 * cloud functions which read a nested `filters` object — see report.action.ts for why this
 * service is called directly instead of going through the generic crudThunks factory
 */
export const fetchReports = async (
  queries: FetchReportsInput
): Promise<{ results: IReport[]; count: number }> => {
  const result: { results: Parse.Object[]; count: number } = await Parse.Cloud.run('getReports', queries);

  return {
    results: result.results.map((report) => toJSONWithId<IReport>(report)),
    count: result.count,
  };
};

/**
 * One report as its own page reads it: with the name of its target, how many times that target has
 * been reported, and a few facts about the target.
 * @param reportId the report to read
 * @returns the report
 */
export const fetchReport = async (reportId: string): Promise<IReport> => {
  const report: Parse.Object = await Parse.Cloud.run('getReport', { reportId });

  return toJSONWithId<IReport>(report);
};

/**
 * How the whole report collection splits across the four things that can be reported, plus how
 * much of it has to be handled first. Read apart from the list so narrowing the rows does not move
 * the figures above them.
 * @returns the per-target-type counts, the collection size and the urgent open count
 */
export const fetchReportSummary = async (): Promise<IReportSummary> =>
  Parse.Cloud.run('getReportSummary');

type FetchReportTargetHistoryInput = {
  targetType: ReportTargetType;
  targetId: string;
  excludeReportId: string;
};

/**
 * The other reports filed against the same target, for the file the operator has open.
 * @param input the target to read, and the report that is the subject of the file rather than part
 * of its history
 * @returns the target's other reports, newest first
 */
export const fetchReportTargetHistory = async (
  input: FetchReportTargetHistoryInput
): Promise<IReport[]> => {
  const results: Parse.Object[] = await Parse.Cloud.run('getReportTargetHistory', input);

  return results.map((report) => toJSONWithId<IReport>(report));
};

type ResolveReportInput = {
  reportId: string;
  status: ReportStatus;
  resolution: string;
};

export const resolveReport = async (
  { reportId, status, resolution }: ResolveReportInput
): Promise<IReport> => {
  const report = await Parse.Cloud.run('resolveReport', { reportId, status, resolution });

  return toJSONWithId<IReport>(report);
};

/**
 * Takes a pending report in charge, so the other operators see it is being looked at.
 * @param reportId the report to take
 * @returns the report, under review and carrying who took it
 */
export const startReportReview = async (reportId: string): Promise<IReport> => {
  const report = await Parse.Cloud.run('startReportReview', { reportId });

  return toJSONWithId<IReport>(report);
};

/**
 * Closes several reports at once without action taken.
 * @param input the reports to close and why
 * @returns the reports that were actually closed — ones already ruled on are left untouched
 */
export const dismissReports = async (
  input: { reportIds: string[]; resolution: string }
): Promise<IReport[]> => {
  const results: Parse.Object[] = await Parse.Cloud.run('dismissReports', input);

  return results.map((report) => toJSONWithId<IReport>(report));
};

/**
 * Suspends the account a report was filed against and closes that report in the same step.
 * @param input the report the decision was made from, and why
 * @returns the closed report
 */
export const suspendReportedUser = async (
  input: { reportId: string; resolution: string }
): Promise<IReport> => {
  const report = await Parse.Cloud.run('suspendReportedUser', input);

  return toJSONWithId<IReport>(report);
};
