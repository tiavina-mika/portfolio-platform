import type { IUserAuditTrailResult } from '@shared/types';

import { collections } from '@/constants/_core/constants';
import { USER_AUDIT_TRAIL_DEFAULT_LIMIT } from '@/constants/_core/user.constants';
import {
  getAuditLogsSchema, getAuditLogByUserIdSchema, getUserAuditTrailSchema,
} from '@/validations/_core/auditLog.validations';

import { getAuditLogByUserId, getAuditLogs } from '../../services/_core/auditLog.service.cloud';
import { getUserAuditTrailService } from '../../services/_core/userAuditTrail.service.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'getAuditLogs',
  fromBO(async (request: Parse.Cloud.FunctionRequest) => {
    const {
      limit, skip, orderBy, order, search,
    } = request.params;

    return getAuditLogs({
      limit, skip, orderBy, order, search,
    });
  }, ['find'], collections.UserAuditLog),
  parseFunctionValidation(getAuditLogsSchema)
);

Parse.Cloud.define(
  'getAuditLogByUserId',
  fromBO(async (request: Parse.Cloud.FunctionRequest) => {
    const { userId } = request.params;

    return getAuditLogByUserId(userId);
  }, ['find'], collections.UserAuditLog),
  parseFunctionValidation(getAuditLogByUserIdSchema)
);

/**
 * The audit trail of one member for the back-office user page: sign-outs, support sessions, role
 * changes, MFA events, bans and suspensions, account deletion — newest first.
 */
Parse.Cloud.define(
  'getUserAuditTrail',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<IUserAuditTrailResult> => {
    const { userId, limit = USER_AUDIT_TRAIL_DEFAULT_LIMIT } = request.params;

    return { results: await getUserAuditTrailService(userId, limit) };
  }, ['find'], collections.UserAuditLog),
  parseFunctionValidation(getUserAuditTrailSchema)
);
