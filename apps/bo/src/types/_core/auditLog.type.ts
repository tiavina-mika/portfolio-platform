
import type { DateType, IUserDefaultRecord } from '@/types/_core/utils.type';
import type { auditLogFilterSchema } from '@/validations/_core/auditLog.validations';
import type { z } from 'zod';

export type AccountStats = {
  totalRidesAsDriver: number;
  totalRidesAsPassenger: number;
  averageRating: number | null;
};

export type DeletionInitiatedBy = 'user' | 'admin' | 'system';

export interface IUserAuditLogAttributes extends IUserDefaultRecord {
  userId: string;
  action: string;
  emailBefore?: string;
  usernameBefore?: string;
  fullNameBefore?: string;
  phoneBefore?: { code: string; number: string };
  deletionReason?: string;
  deletionInitiatedBy: DeletionInitiatedBy;
  adminId?: string;
  accountStats?: AccountStats;
  timestamp: DateType;
}

export type IUserAuditLog = IUserAuditLogAttributes & { id: string };

export type AuditLogFiltersInput = z.infer<typeof auditLogFilterSchema>;

export interface IUserAuditLogState {
  loading: boolean;
  auditLogs: IUserAuditLog[];
  count: number;
  currentAuditLog: IUserAuditLog | null;
}
