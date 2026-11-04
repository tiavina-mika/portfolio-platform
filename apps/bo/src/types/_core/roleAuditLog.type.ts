import type { DateType, IUserDefaultRecord } from '@/types/_core/utils.type';

import { IRightsItem } from './role.type';

export type RoleAuditAction =
  'role_assigned' | 'role_removed' | 'role_created' | 'role_rights_updated' | 'role_updated' | 'role_deleted';

export interface IRoleAuditLogAttributes extends IUserDefaultRecord {
  action: RoleAuditAction;
  roleName: string;
  targetUserId?: string;
  performedBy?: string;
  // resolved by the server when the log is read, never stored
  performedByName?: string;
  targetUserName?: string;
  rightsBefore?: IRightsItem[];
  rightsAfter?: IRightsItem[];
  uiBefore?: string[];
  uiAfter?: string[];
  timestamp: DateType;
}

export type IRoleAuditLog = IRoleAuditLogAttributes & { id: string };

export interface IRoleAuditLogState {
  loading: boolean;
  auditLogs: IRoleAuditLog[];
  count: number;
}
