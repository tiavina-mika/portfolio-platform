import uniq from 'lodash/uniq.js';

import type { User } from 'parse';

import { collections, DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';

import { getUserFullName } from '../../utils/_core/user.utils.cloud';

export type RoleAuditAction =
  'role_assigned' | 'role_removed' | 'role_created' | 'role_rights_updated' | 'role_updated' | 'role_deleted';

type CreateRoleAuditLogParams = {
  action: RoleAuditAction;
  roleName: string;
  targetUserId?: string;
  performedBy?: User;
  rightsBefore?: unknown;
  rightsAfter?: unknown;
  uiBefore?: string[];
  uiAfter?: string[];
};

const ROLE_AUDIT_LOG_FIELDS = [
  'action', 'roleName', 'targetUserId', 'performedBy', 'rightsBefore', 'rightsAfter', 'uiBefore', 'uiAfter',
  'timestamp',
];

/**
 * records who assigned/removed a role to/from a user, or created/edited a role's rights/ui —
 * `performedBy` left unset means the change came from a trusted server-side bootstrap
 * (owner allowlist signup, default role auto-provisioning), not a BO-driven action
 */
export const createRoleAuditLog = async ({
  action, roleName, targetUserId, performedBy, rightsBefore, rightsAfter, uiBefore, uiAfter,
}: CreateRoleAuditLogParams): Promise<void> => {
  const RoleAuditLog = Parse.Object.extend(collections.RoleAuditLog);
  const auditLog = new RoleAuditLog();

  auditLog.set('action', action);
  auditLog.set('roleName', roleName);
  if (targetUserId) auditLog.set('targetUserId', targetUserId);
  if (performedBy) auditLog.set('performedBy', performedBy.id);
  if (rightsBefore !== undefined) auditLog.set('rightsBefore', rightsBefore);
  if (rightsAfter !== undefined) auditLog.set('rightsAfter', rightsAfter);
  if (uiBefore !== undefined) auditLog.set('uiBefore', uiBefore);
  if (uiAfter !== undefined) auditLog.set('uiAfter', uiAfter);
  auditLog.set('timestamp', new Date());

  await auditLog.save(null, USE_MASTER_KEY);
};

type GetRoleAuditLogsParams = {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  roleName?: string;
};

export const getRoleAuditLogs = async ({
  limit = DEFAULT_QUERY_LIMIT,
  skip = 0,
  orderBy = 'timestamp',
  order = 'desc',
  roleName,
}: GetRoleAuditLogsParams): Promise<{ results: Parse.Object[]; count: number }> => {
  const query = new Parse.Query(collections.RoleAuditLog)
    .select(ROLE_AUDIT_LOG_FIELDS)
    .limit(limit)
    .skip(skip);
  const countQuery = new Parse.Query(collections.RoleAuditLog);

  if (roleName) {
    query.equalTo('roleName', roleName);
    countQuery.equalTo('roleName', roleName);
  }

  if (order === 'desc') {
    query.descending(orderBy);
  }
  else {
    query.ascending(orderBy);
  }

  const [results, count] = await Promise.all([
    query.find(USE_MASTER_KEY),
    countQuery.count(USE_MASTER_KEY),
  ]);

  const userIds = uniq(results.flatMap((log) => [log.get('performedBy'), log.get('targetUserId')]).filter(Boolean));
  const users = userIds.length
    ? await new Parse.Query(Parse.User)
      .containedIn('objectId', userIds)
      .select(['firstName', 'lastName', 'email'])
      .limit(userIds.length)
      .find(USE_MASTER_KEY)
    : [];
  // the full name is preferred: the e-mail only shows when the account has no name
  const labelById = new Map(users.map((user) => [user.id, getUserFullName(user) || user.get('email')]));

  results.forEach((log) => {
    // not saved: only travels back to the caller
    log.set('performedByName', labelById.get(log.get('performedBy')));
    log.set('targetUserName', labelById.get(log.get('targetUserId')));
  });

  return { results, count };
};
