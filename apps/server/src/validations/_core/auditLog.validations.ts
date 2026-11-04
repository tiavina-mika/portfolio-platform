import {
  array, enum as zEnum, number, object, string,
} from 'zod';

import { USER_AUDIT_TRAIL_MAX_LIMIT } from '@/constants/_core/user.constants';

import { dateRangeFieldSchema, objectIdFieldSchema, paginationQuerySchema } from './util.validations';

const auditLogSearchSchema = object({
  text: string().optional(),
  deletionInitiatedBy: array(zEnum(['user', 'admin', 'system'])).optional(),
  timestamp: dateRangeFieldSchema.optional(),
}).optional();

export const getAuditLogsSchema = paginationQuerySchema.extend({
  search: auditLogSearchSchema,
});

export const getAuditLogByUserIdSchema = object({
  userId: objectIdFieldSchema,
});

export const getUserAuditTrailSchema = object({
  userId: objectIdFieldSchema,
  limit: number().int().min(1).max(USER_AUDIT_TRAIL_MAX_LIMIT).optional(),
});
