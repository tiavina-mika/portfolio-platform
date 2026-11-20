
import type { DateType, IUserDefaultRecord } from '@/types/_core/utils.type';
import type { auditLogFilterSchema } from '@/validations/_core/auditLog.validations';
import type { z } from 'zod';

export type DeletionInitiatedBy = 'user' | 'admin' | 'system';

export interface IUserAuditLogAttributes extends IUserDefaultRecord {
  userId: string;
  action: string;
  emailBefore?: string;
  usernameBefore?: string;
  fullNameBefore?: string;
  phoneBefore?: { code: string; number: string };
  deletionReason?: string;
  deletionReasonDetails?: string;
  deletionInitiatedBy: DeletionInitiatedBy;
  adminId?: string;
  timestamp: DateType;
  // set when the account was erased for good: the log stays, the account leaves the recycle bin
  destroyedAt?: DateType;
}

export type IUserAuditLog = IUserAuditLogAttributes & { id: string };

export type AuditLogFiltersInput = z.infer<typeof auditLogFilterSchema>;

export interface IUserAuditLogState {
  loading: boolean;
  auditLogs: IUserAuditLog[];
  count: number;
  currentAuditLog: IUserAuditLog | null;
}
