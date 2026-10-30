import { REPORT_DETAILS_MAX_LENGTH } from '@shared/constants';
import { RIDE_PROBLEM_ATTACHMENT_MAX_COUNT } from '@shared/domain-constants';
import { z } from 'zod';

import { ReportReasonEnum, ReportStatusEnum, ReportTargetTypeEnum } from '@/types/report.type';

import { objectIdFieldSchema, paginationQuerySchema } from './util.validations';

export const getReportsSchema = paginationQuerySchema.extend({
  status: z.enum(ReportStatusEnum).optional(),
  statuses: z.array(z.enum(ReportStatusEnum)).optional(),
  targetType: z.enum(ReportTargetTypeEnum).optional(),
  targetTypes: z.array(z.enum(ReportTargetTypeEnum)).optional(),
  targetId: z.string().optional(),
  reason: z.enum(ReportReasonEnum).optional(),
  reasons: z.array(z.enum(ReportReasonEnum)).optional(),
  overdue: z.boolean().optional(),
  urgent: z.boolean().optional(),
  target: z.string().optional(),
  reportedBy: z.string().optional(),
  reporterId: objectIdFieldSchema.optional(),
  countries: z.array(z.string()).optional(),
  createdAtFrom: z.union([z.string(), z.date()]).optional(),
  createdAtTo: z.union([z.string(), z.date()]).optional(),
  minAgeDays: z.coerce.number().int().nonnegative().optional(),
});

export const getReportSchema = z.object({
  reportId: z.string().nonempty(),
});

export const getReportTargetHistorySchema = z.object({
  targetType: z.enum(ReportTargetTypeEnum),
  targetId: z.string().nonempty(),
  excludeReportId: z.string().optional(),
});

export const dismissReportsSchema = z.object({
  reportIds: z.array(z.string().nonempty()).nonempty(),
  resolution: z.string().max(500),
});

export const suspendReportedUserSchema = z.object({
  reportId: z.string().nonempty(),
  resolution: z.string().max(500),
});

/*
 * the url is written by a member and opened by support from the back-office: anything but https
 * (a `javascript:` url) would run in the support agent's session the moment they click the photo
 */
const reportAttachmentSchema = z.object({
  publicId: z.string().nonempty(),
  url: z.url({ protocol: /^https$/ }),
});

export const createReportSchema = z.object({
  targetType: z.enum(ReportTargetTypeEnum),
  targetId: z.string(),
  reason: z.enum(ReportReasonEnum),
  details: z.string().max(REPORT_DETAILS_MAX_LENGTH).optional(),
  isAnonymous: z.boolean().optional(),
  // optional: the message is what support weighs, the photos only back it
  attachments: z.array(reportAttachmentSchema).max(RIDE_PROBLEM_ATTACHMENT_MAX_COUNT).optional(),
  // the person of the ride the report is about — only a ride has several people to choose from
  concernedUserId: objectIdFieldSchema.optional(),
}).refine(
  (report) => !report.concernedUserId || report.targetType === ReportTargetTypeEnum.RIDE,
  { path: ['concernedUserId'] }
);

export const resolveReportSchema = z.object({
  reportId: z.string(),
  status: z.enum([ReportStatusEnum.RESOLVED, ReportStatusEnum.DISMISSED]),
  resolution: z.string().max(500),
});

export const startReportReviewSchema = z.object({
  reportId: z.string(),
});

export const hasReportedTargetSchema = z.object({
  targetType: z.enum(ReportTargetTypeEnum),
  targetId: z.string().nonempty(),
});
