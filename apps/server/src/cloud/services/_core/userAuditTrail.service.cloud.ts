import {
  type IUserAuditTrailEntry, UserAuditTrailActionEnum, UserAuditTrailInitiatorEnum,
} from '@shared/types';
import dayjs from 'dayjs';

import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { UserModerationActionEnum } from '@/types/user.type';

import { USER_MODERATION_LOG_FIELDS } from './userModerationLog.service.cloud';
import { getUserFullName } from '../../utils/_core/user.utils.cloud';

/*
 * An entry before the name of whoever performed it is resolved — every log stores the author as a
 * bare id (or a pointer), so the names are read once for the whole trail.
 */
type RawAuditTrailEntry = Omit<IUserAuditTrailEntry, 'performedBy' | 'initiator'> & {
  performedById?: string;
};

const SESSION_ACTIONS: Record<string, UserAuditTrailActionEnum> = {
  session_revoked: UserAuditTrailActionEnum.DEVICE_SIGNED_OUT,
  all_sessions_revoked: UserAuditTrailActionEnum.ALL_DEVICES_SIGNED_OUT,
};

// only the role changes made on this member — role creation and rights edits name no member
const ROLE_ACTIONS: Record<string, UserAuditTrailActionEnum> = {
  role_assigned: UserAuditTrailActionEnum.ROLE_ASSIGNED,
  role_removed: UserAuditTrailActionEnum.ROLE_REMOVED,
};

const MFA_ACTIONS: Record<string, UserAuditTrailActionEnum> = {
  enabled: UserAuditTrailActionEnum.MFA_ENABLED,
  disabled: UserAuditTrailActionEnum.MFA_DISABLED,
  admin_reset: UserAuditTrailActionEnum.MFA_RESET,
  login_failed: UserAuditTrailActionEnum.MFA_LOGIN_FAILED,
  backup_code_used: UserAuditTrailActionEnum.MFA_BACKUP_CODE_USED,
};

const MODERATION_ACTIONS: Record<string, UserAuditTrailActionEnum> = {
  [UserModerationActionEnum.BANNED]: UserAuditTrailActionEnum.BANNED,
  [UserModerationActionEnum.BAN_LIFTED]: UserAuditTrailActionEnum.BAN_LIFTED,
  [UserModerationActionEnum.BAN_EXPIRED]: UserAuditTrailActionEnum.BAN_EXPIRED,
  [UserModerationActionEnum.SUSPENDED_BY_POLICY]: UserAuditTrailActionEnum.SUSPENDED_BY_POLICY,
  [UserModerationActionEnum.SUSPENSION_CLEARED]: UserAuditTrailActionEnum.SUSPENSION_CLEARED,
  [UserModerationActionEnum.PHONE_CODE_RESENT]: UserAuditTrailActionEnum.PHONE_CODE_RESENT,
  [UserModerationActionEnum.CONTACT_CHANGED_BY_ADMIN]: UserAuditTrailActionEnum.CONTACT_CHANGED_BY_ADMIN,
  [UserModerationActionEnum.COUNTRY_CHANGED_BY_ADMIN]: UserAuditTrailActionEnum.COUNTRY_CHANGED_BY_ADMIN,
  [UserModerationActionEnum.PASSWORD_RESET_SENT]: UserAuditTrailActionEnum.PASSWORD_RESET_SENT,
};

const toIso = (date?: Date | null): string | undefined => (date ? dayjs(date).toISOString() : undefined);

const findSessionEntries = async (userId: string, limit: number): Promise<RawAuditTrailEntry[]> => {
  const logs = await new Parse.Query(collections.SessionAuditLog)
    .equalTo('targetUserId', userId)
    .select(['action', 'performedBy', 'deviceName', 'createdAt'])
    .descending('createdAt')
    .limit(limit)
    .find(USE_MASTER_KEY);

  return logs
    .filter((log) => SESSION_ACTIONS[log.get('action')])
    .map((log) => ({
      id: log.id,
      source: collections.SessionAuditLog,
      action: SESSION_ACTIONS[log.get('action')]!,
      performedById: log.get('performedBy'),
      details: log.get('deviceName'),
      createdAt: toIso(log.createdAt)!,
    }));
};

/*
 * One support session is two moments: when it was opened, and when it stopped — ended by hand
 * (`revokedAt`, which does not record who ended it) or by running out (`expiresAt` passed).
 */
const findSupportSessionEntries = async (userId: string, limit: number): Promise<RawAuditTrailEntry[]> => {
  const sessions = await new Parse.Query(collections.ImpersonationSession)
    .equalTo('targetUser', Parse.User.createWithoutData(userId))
    .select(['adminId', 'reason', 'revokedAt', 'expiresAt', 'createdAt'])
    .descending('createdAt')
    .limit(limit)
    .find(USE_MASTER_KEY);

  const now = dayjs();

  return sessions.flatMap((session) => {
    const started: RawAuditTrailEntry = {
      id: `${session.id}:started`,
      source: collections.ImpersonationSession,
      action: UserAuditTrailActionEnum.SUPPORT_SESSION_STARTED,
      performedById: session.get('adminId'),
      details: session.get('reason'),
      createdAt: toIso(session.createdAt)!,
    };
    const endedAt: Date | undefined = session.get('revokedAt') ??
      (session.get('expiresAt') && now.isAfter(session.get('expiresAt')) ? session.get('expiresAt') : undefined);

    if (!endedAt) return [started];

    return [started, {
      id: `${session.id}:ended`,
      source: collections.ImpersonationSession,
      action: UserAuditTrailActionEnum.SUPPORT_SESSION_ENDED,
      details: session.get('reason'),
      createdAt: toIso(endedAt)!,
    }];
  });
};

const findRoleEntries = async (userId: string, limit: number): Promise<RawAuditTrailEntry[]> => {
  const logs = await new Parse.Query(collections.RoleAuditLog)
    .equalTo('targetUserId', userId)
    .containedIn('action', Object.keys(ROLE_ACTIONS))
    .select(['action', 'roleName', 'performedBy', 'createdAt'])
    .descending('createdAt')
    .limit(limit)
    .find(USE_MASTER_KEY);

  return logs.map((log) => ({
    id: log.id,
    source: collections.RoleAuditLog,
    action: ROLE_ACTIONS[log.get('action')]!,
    performedById: log.get('performedBy'),
    details: log.get('roleName'),
    createdAt: toIso(log.createdAt)!,
  }));
};

const findMfaEntries = async (userId: string, limit: number): Promise<RawAuditTrailEntry[]> => {
  const logs = await new Parse.Query(collections.MfaAuditLog)
    .equalTo('userId', userId)
    .select(['action', 'performedBy', 'createdAt'])
    .descending('createdAt')
    .limit(limit)
    .find(USE_MASTER_KEY);

  return logs
    .filter((log) => MFA_ACTIONS[log.get('action')])
    .map((log) => ({
      id: log.id,
      source: collections.MfaAuditLog,
      action: MFA_ACTIONS[log.get('action')]!,
      // an MFA row without an author was written by the member on their own account
      performedById: log.get('performedBy') ?? userId,
      createdAt: toIso(log.createdAt)!,
    }));
};

const findModerationEntries = async (userId: string, limit: number): Promise<RawAuditTrailEntry[]> => {
  const logs = await new Parse.Query(collections.UserModerationLog)
    .equalTo('targetUser', Parse.User.createWithoutData(userId))
    .select(USER_MODERATION_LOG_FIELDS)
    .descending('createdAt')
    .limit(limit)
    .find(USE_MASTER_KEY);

  return logs
    .filter((log) => MODERATION_ACTIONS[log.get('action')])
    .map((log) => ({
      id: log.id,
      source: collections.UserModerationLog,
      action: MODERATION_ACTIONS[log.get('action')]!,
      performedById: log.get('performedBy')?.id,
      // the reason code first, then the free text an administrator typed, when there is one
      details: [log.get('reason'), log.get('details')].filter(Boolean).join(' — ') || undefined,
      banType: log.get('banType'),
      until: toIso(log.get('until')),
      createdAt: toIso(log.createdAt)!,
    }));
};

const findAccountDeletionEntries = async (userId: string, limit: number): Promise<RawAuditTrailEntry[]> => {
  const logs = await new Parse.Query(collections.UserAuditLog)
    .equalTo('userId', userId)
    .equalTo('action', 'account_deleted')
    .select(['deletionReason', 'deletionInitiatedBy', 'adminId', 'createdAt'])
    .descending('createdAt')
    .limit(limit)
    .find(USE_MASTER_KEY);

  return logs.map((log) => ({
    id: log.id,
    source: collections.UserAuditLog,
    action: UserAuditTrailActionEnum.ACCOUNT_DELETED,
    performedById: log.get('deletionInitiatedBy') === 'user' ? userId : log.get('adminId'),
    details: log.get('deletionReason'),
    createdAt: toIso(log.createdAt)!,
  }));
};

const findPerformerNames = async (ids: string[]): Promise<Map<string, string>> => {
  if (!ids.length) return new Map();

  const users = await new Parse.Query(Parse.User)
    .containedIn('objectId', ids)
    .select(['firstName', 'lastName', 'email'])
    .limit(ids.length)
    .find(USE_MASTER_KEY);

  return new Map(users.map((user): [string, string] => [user.id, getUserFullName(user) || user.get('email') || '']));
};

const getInitiator = (userId: string, performedById?: string): UserAuditTrailInitiatorEnum => {
  if (!performedById) return UserAuditTrailInitiatorEnum.SYSTEM;
  if (performedById === userId) return UserAuditTrailInitiatorEnum.USER;

  return UserAuditTrailInitiatorEnum.ADMIN;
};

/**
 * One member's audit trail, newest first: every log collection that names the member, merged into
 * a single chronology. Each source is read with the same limit, which is enough — the newest
 * `limit` rows overall are necessarily among the newest `limit` rows of each source.
 * @param userId the member
 * @param limit how many rows to return
 * @returns the rows, newest first, with the author's name resolved
 */
export const getUserAuditTrailService = async (
  userId: string,
  limit: number
): Promise<IUserAuditTrailEntry[]> => {
  const sources = await Promise.all([
    findSessionEntries(userId, limit),
    findSupportSessionEntries(userId, limit),
    findRoleEntries(userId, limit),
    findMfaEntries(userId, limit),
    findModerationEntries(userId, limit),
    findAccountDeletionEntries(userId, limit),
  ]);

  const entries = sources
    .flat()
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, limit);

  const performerIds = [...new Set(entries.map((entry) => entry.performedById).filter(Boolean) as string[])];
  const names = await findPerformerNames(performerIds);

  return entries.map(({ performedById, ...entry }): IUserAuditTrailEntry => ({
    ...entry,
    initiator: getInitiator(userId, performedById),
    ...(performedById ? { performedBy: { id: performedById, name: names.get(performedById) ?? '' } } : {}),
  }));
};
