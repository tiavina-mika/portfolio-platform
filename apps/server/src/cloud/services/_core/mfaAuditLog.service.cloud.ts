import type { User } from 'parse';

import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';

export type MfaAuditAction = 'enabled' | 'disabled' | 'login_failed' | 'backup_code_used' | 'admin_reset';

type CreateMfaAuditLogParams = {
  action: MfaAuditAction;
  userId: string;
  performedBy?: User;
};

const MFA_AUDIT_LOG_FIELDS = ['action', 'userId', 'performedBy', 'timestamp'];

/**
 * Records MFA lifecycle events (enable/disable/failed attempt/backup code use/OWNER-triggered
 * reset) — `performedBy` left unset means the caller acted on their own account.
 */
export const createMfaAuditLog = async ({
  action, userId, performedBy,
}: CreateMfaAuditLogParams): Promise<void> => {
  const MfaAuditLog = Parse.Object.extend(collections.MfaAuditLog);
  const auditLog = new MfaAuditLog();

  auditLog.set('action', action);
  auditLog.set('userId', userId);
  if (performedBy) auditLog.set('performedBy', performedBy.id);
  auditLog.set('timestamp', new Date());

  await auditLog.save(null, USE_MASTER_KEY);
};

type GetMfaAuditLogsParams = {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
};

export const getMfaAuditLogs = async ({
  limit = DEFAULT_QUERY_LIMIT,
  skip = 0,
  orderBy = 'timestamp',
  order = 'desc',
}: GetMfaAuditLogsParams): Promise<{ results: Parse.Object[]; count: number }> => {
  const query = new Parse.Query(collections.MfaAuditLog)
    .select(MFA_AUDIT_LOG_FIELDS)
    .limit(limit)
    .skip(skip);

  if (order === 'desc') {
    query.descending(orderBy);
  }
  else {
    query.ascending(orderBy);
  }

  const [results, count] = await Promise.all([
    query.find(USE_MASTER_KEY),
    new Parse.Query(collections.MfaAuditLog).count(USE_MASTER_KEY),
  ]);

  return { results, count };
};
