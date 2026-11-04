import type { SessionAuditAction } from '@/types/userSession.type';
import type { User } from 'parse';

import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';

type CreateSessionAuditLogParams = {
  action: SessionAuditAction;
  targetUserId: string;
  performedBy: User;
  // the device the closed session was on, when one was registered — what support reads back later
  deviceName?: string;
};

/**
 * Records a back-office agent signing a user out of one or all of their devices — who did it, to
 * whom, and on which device. Closing someone else's sessions leaves no other trace once the
 * session rows are destroyed, so this row is the only record a dispute can be settled with.
 */
export const createSessionAuditLog = async ({
  action, targetUserId, performedBy, deviceName,
}: CreateSessionAuditLogParams): Promise<void> => {
  const SessionAuditLog = Parse.Object.extend(collections.SessionAuditLog);
  const auditLog = new SessionAuditLog();

  auditLog.set('action', action);
  auditLog.set('targetUserId', targetUserId);
  auditLog.set('performedBy', performedBy.id);
  if (deviceName) auditLog.set('deviceName', deviceName);
  auditLog.set('timestamp', new Date());

  await auditLog.save(null, USE_MASTER_KEY);
};
