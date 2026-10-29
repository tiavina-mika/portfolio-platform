import { collections } from '@/constants/_core/constants';

export type LogRetentionRule = {
  collection: string;
  /** the date the retention is counted from: the row's creation, or the moment it stopped being usable */
  dateField: 'createdAt' | 'expiresAt';
  /** whole months kept after `dateField` before the row is permanently destroyed */
  months: number;
};

/** Security trails of the members: long enough to investigate an incident, short enough to hold no PII for ever */
const SECURITY_LOG_RETENTION_MONTHS = 12;

/** Records of a moderation, a penalty or an emergency: kept as long as the rides and bookings they relate to */
const CASE_RECORD_RETENTION_MONTHS = 24;

/** Links and invitations nobody can use any more: kept a short while so support can still explain "it expired" */
const EXPIRED_LINK_RETENTION_MONTHS = 3;

/**
 * How long each log-like collection is kept before purgeOldLogsJob permanently destroys it.
 * `UserAuditLog` holds the (masked) email, phone and name of a deleted account, so its period is
 * the one that decides how long a former member stays identifiable.
 */
export const LOG_RETENTION_RULES: LogRetentionRule[] = [
  { collection: collections.UserAuditLog, dateField: 'createdAt', months: SECURITY_LOG_RETENTION_MONTHS },
  { collection: collections.RoleAuditLog, dateField: 'createdAt', months: SECURITY_LOG_RETENTION_MONTHS },
  { collection: collections.SessionAuditLog, dateField: 'createdAt', months: SECURITY_LOG_RETENTION_MONTHS },
  { collection: collections.MfaAuditLog, dateField: 'createdAt', months: SECURITY_LOG_RETENTION_MONTHS },
  { collection: collections.UserModerationLog, dateField: 'createdAt', months: CASE_RECORD_RETENTION_MONTHS },
  { collection: collections.PenaltyLog, dateField: 'createdAt', months: CASE_RECORD_RETENTION_MONTHS },
  { collection: collections.SosAlert, dateField: 'createdAt', months: CASE_RECORD_RETENTION_MONTHS },
  { collection: collections.TicketMessage, dateField: 'createdAt', months: CASE_RECORD_RETENTION_MONTHS },
  // the history of a send is destroyed with its notification; this catches the ones left behind
  { collection: collections.NotificationResend, dateField: 'createdAt', months: EXPIRED_LINK_RETENTION_MONTHS },
  { collection: collections.RideShare, dateField: 'expiresAt', months: EXPIRED_LINK_RETENTION_MONTHS },
  { collection: collections.Invitation, dateField: 'expiresAt', months: EXPIRED_LINK_RETENTION_MONTHS },
  {
    collection: collections.ImpersonationSession,
    dateField: 'expiresAt',
    months: SECURITY_LOG_RETENTION_MONTHS,
  },
];
