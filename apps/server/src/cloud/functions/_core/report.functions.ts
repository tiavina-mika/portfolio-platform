import type { ReportSummary } from '../../services/_core/report-list.service.cloud';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import {
  createReportSchema, dismissReportsSchema, getReportSchema, getReportsSchema,
  getReportTargetHistorySchema, hasReportedTargetSchema, resolveReportSchema,
  startReportReviewSchema, suspendReportedUserSchema,
} from '@/validations/_core/report.validations';


import {
  getReportDetailService, getReportSummaryService, getReportTargetHistoryService,
} from '../../services/_core/report-list.service.cloud';
import {
  createReportService, dismissReportsService, getReportsService, hasReportedTargetService,
  resolveReportService, startReportReviewService, suspendReportedUserService,
} from '../../services/_core/report.service.cloud';
import { assertInAgentCountries } from '../../utils/_core/agent-scope.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'createReport',
  parseFunction((request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const {
      targetType, targetId, reason, details, isAnonymous, attachments, concernedUserId,
      locale = DEFAULT_LANGUAGE,
    } = request.params;
    const { user } = request;

    if (!user) {
      return Promise.reject(new Error(translate('error.pleaseLogin', locale)));
    }

    return createReportService(user, {
      targetType, targetId, reason, details, isAnonymous, attachments, concernedUserId,
    }, locale);
  }),
  parseFunctionValidation(createReportSchema)
);

Parse.Cloud.define(
  'hasReportedTarget',
  parseFunction((request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { targetType, targetId, locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      return Promise.reject(new Error(translate('error.pleaseLogin', locale)));
    }

    return hasReportedTargetService(user.id, targetType, targetId);
  }),
  parseFunctionValidation(hasReportedTargetSchema)
);

/*
 * Every function below names the right it needs on `Report`. Without it, `fromBO` only checked
 * that the caller held *some* back-office role — so a read-only support account could dismiss a
 * report or suspend the account it named, which is exactly what the interface was already hiding
 * from it.
 */
type GetReportsResult = { results: Parse.Object[]; count: number };

Parse.Cloud.define(
  'getReports',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<GetReportsResult> => {
    const {
      status, statuses, targetType, targetTypes, targetId, reason, reasons, overdue, urgent,
      target, reportedBy, reporterId, countries, createdAtFrom, createdAtTo, minAgeDays, limit, skip,
      orderBy, order,
    } = request.params;

    return getReportsService({
      status,
      statuses,
      targetType,
      targetTypes,
      targetId,
      reason,
      reasons,
      overdue,
      urgent,
      target,
      reportedBy,
      reporterId,
      countries,
      createdAtFrom,
      createdAtTo,
      minAgeDays,
      limit,
      skip,
      orderBy,
      order,
    });
  }, ['find'], collections.Report),
  parseFunctionValidation(getReportsSchema)
);

Parse.Cloud.define(
  'getReport',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertInAgentCountries(collections.Report, request.params.reportId);

      return getReportDetailService(request.params.reportId);
    },
    ['get'],
    collections.Report
  ),
  parseFunctionValidation(getReportSchema)
);

Parse.Cloud.define(
  'getReportSummary',
  fromBO((): Promise<ReportSummary> => getReportSummaryService(), ['find'], collections.Report)
);

Parse.Cloud.define(
  'getReportTargetHistory',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object[]> => {
    const { targetType, targetId, excludeReportId } = request.params;

    return getReportTargetHistoryService({ targetType, targetId, excludeReportId });
  }, ['find'], collections.Report),
  parseFunctionValidation(getReportTargetHistorySchema)
);

Parse.Cloud.define(
  'startReportReview',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { reportId, locale = DEFAULT_LANGUAGE } = request.params;

    await assertInAgentCountries(collections.Report, reportId);
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    return startReportReviewService({ reportId, reviewedBy: user, locale });
  }, ['update'], collections.Report),
  parseFunctionValidation(startReportReviewSchema)
);

Parse.Cloud.define(
  'dismissReports',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object[]> => {
    const { reportIds, resolution, locale = DEFAULT_LANGUAGE } = request.params;

    await assertInAgentCountries(collections.Report, reportIds);
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    return dismissReportsService({
      reportIds, resolution, resolvedBy: user, locale,
    });
  }, ['update'], collections.Report),
  parseFunctionValidation(dismissReportsSchema)
);

Parse.Cloud.define(
  'suspendReportedUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { reportId, resolution, locale = DEFAULT_LANGUAGE } = request.params;

    await assertInAgentCountries(collections.Report, reportId);
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    return suspendReportedUserService({
      reportId, resolution, suspendedBy: user, locale,
    });
  }, ['update'], collections.Report),
  parseFunctionValidation(suspendReportedUserSchema)
);

Parse.Cloud.define(
  'resolveReport',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const {
      reportId, status, resolution, locale = DEFAULT_LANGUAGE,
    } = request.params;
    const { user } = request;

    await assertInAgentCountries(collections.Report, reportId);

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    return resolveReportService({
      reportId, status, resolution, resolvedBy: user, locale,
    });
  }, ['update'], collections.Report),
  parseFunctionValidation(resolveReportSchema)
);
