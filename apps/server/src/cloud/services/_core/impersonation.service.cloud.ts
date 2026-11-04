import type { Locale } from '@/types/app.type';
import type { CreateImpersonationSessionResult } from '@/types/impersonation.type';


import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import {
  collections, USE_MASTER_KEY, IMPERSONATION_SESSION_TTL_MINUTES,
} from '@/constants/_core/constants';
import {
  ACCOUNT_NOTIFICATION_TYPE, SUPPORT_SESSION_ENDED_STATUS,
} from '@/constants/_core/notification.constants';
import { IMPERSONATION_SESSION_ACTION } from '@/constants/_core/session.constants';
import { OwnerAlertEventEnum } from '@/types/ownerAlert.type';
import { logger } from '@/utils/_core/logger';

import { createNotification, getNotificationMessageTemplate } from './notification.service.cloud';
import { alertOwners } from './ownerAlert.service.cloud';
import { hasRoleAsManager } from './userRole.service.cloud';
import { issueParseSession } from '../../utils/_core/session.utils.cloud';
import { toUserSnapshot } from '../../utils/_core/user-snapshot.utils.cloud';

export const ImpersonationSession = Parse.Object.extend(collections.ImpersonationSession);

/*
 * any back-office account, not only an owner or a super-administrator: signing in as a colleague
 * would hand the support agent that colleague's rights — a wider post than their own, the finance
 * screens, the staff right. The impersonation right is for helping members of the app
 */
const assertNotStaffAccount = async (targetUser: Parse.User, locale: Locale): Promise<void> => {
  if (await hasRoleAsManager(targetUser)) {
    throw new Error(translate('error.cannotImpersonateStaffAccount', locale));
  }
};

const deleteSessionTokenService = async (sessionToken: string): Promise<void> => {
  const parseSession = await new Parse.Query(Parse.Session)
    .equalTo('sessionToken', sessionToken)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  if (parseSession) {
    await parseSession.destroy(USE_MASTER_KEY);
  }
};

/**
 * Tells the account holder, once the session is over, that support has been in their account.
 * Failing to notify must never leave a session open, so the send is logged and swallowed.
 */
const notifySupportSessionEnded = async (targetUser: Parse.User | undefined): Promise<void> => {
  if (!targetUser) return;

  try {
    const user = await new Parse.Query(Parse.User)
      .select(['firstName', 'lastName', 'image'])
      .get(targetUser.id, USE_MASTER_KEY);
    const userSnapshot = toUserSnapshot(user);

    // the push is the Notification afterSave's job — sending it here too would push it twice
    await createNotification({
      type: ACCOUNT_NOTIFICATION_TYPE,
      to: [user],
      from: user,
      status: SUPPORT_SESSION_ENDED_STATUS,
      message: getNotificationMessageTemplate(ACCOUNT_NOTIFICATION_TYPE, SUPPORT_SESSION_ENDED_STATUS),
      snapshot: { from: userSnapshot, to: [userSnapshot] },
    });
  }
  catch (error) {
    logger.error(
      `notifySupportSessionEnded failed for user ${targetUser.id}: ${(error as Error).message}`
    );
  }
};

export const createImpersonationSessionService = async (
  admin: Parse.User,
  userId: string,
  reason: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<CreateImpersonationSessionResult> => {
  const targetUser = await new Parse.Query(Parse.User).get(userId, USE_MASTER_KEY);

  await assertNotStaffAccount(targetUser, locale);

  const expiresAt = new Date(Date.now() + (IMPERSONATION_SESSION_TTL_MINUTES * 60 * 1000));

  const sessionToken = await issueParseSession(targetUser.id, {
    createdWith: { action: IMPERSONATION_SESSION_ACTION },
    additionalSessionData: { restricted: true, expiresAt: (Parse as any)._encode(expiresAt) },
  });

  const impersonationLog = new ImpersonationSession();

  impersonationLog.set('targetUser', targetUser);
  impersonationLog.set('adminId', admin.id);
  impersonationLog.set('adminEmail', admin.get('email'));
  impersonationLog.set('reason', reason);
  impersonationLog.set('sessionToken', sessionToken);
  impersonationLog.set('expiresAt', expiresAt);
  await impersonationLog.save(null, USE_MASTER_KEY);

  await alertOwners(OwnerAlertEventEnum.IMPERSONATION_STARTED, admin, {
    target: targetUser.get('email') || targetUser.get('username') || targetUser.id,
    reason,
  });

  return {
    sessionToken,
    sessionId: impersonationLog.id,
    expiresAt,
  };
};

/**
 * Ends any impersonation session by id — caller must already be authorized (BO admin with the
 * `impersonation` ui right, checked in the Cloud Function) or a trusted system caller (cleanup job).
 */
export const endImpersonationSessionService = async (
  sessionId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  const log = await new Parse.Query(collections.ImpersonationSession)
    .get(sessionId, USE_MASTER_KEY)
    .catch(() => undefined);

  if (!log) {
    throw new Error(translate('error.sessionNotFound', locale));
  }

  await deleteSessionTokenService(log.get('sessionToken'));
  log.set('revokedAt', new Date());
  await log.save(null, USE_MASTER_KEY);
  await notifySupportSessionEnded(log.get('targetUser'));
};

/**
 * Ends the caller's own impersonation session (mobile "End" button in the support banner).
 * Scoped by `targetUser` so a non-admin caller can never end a session that isn't theirs —
 * mirrors `revokeSessionService`'s `.equalTo('user', user)` scoping (userSession.service.cloud.ts).
 */
export const endOwnImpersonationSessionService = async (
  user: Parse.User,
  sessionId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  const log = await new Parse.Query(collections.ImpersonationSession)
    .equalTo('targetUser', user)
    .get(sessionId, USE_MASTER_KEY)
    .catch(() => undefined);

  if (!log) {
    throw new Error(translate('error.sessionNotFound', locale));
  }

  await deleteSessionTokenService(log.get('sessionToken'));
  log.set('revokedAt', new Date());
  await log.save(null, USE_MASTER_KEY);
  await notifySupportSessionEnded(user);
};

export const isImpersonatedSessionService = async (sessionToken?: string): Promise<boolean> => {
  if (!sessionToken) return false;

  const log = await new Parse.Query(collections.ImpersonationSession)
    .equalTo('sessionToken', sessionToken)
    .equalTo('revokedAt', undefined)
    .select(['objectId'])
    .first(USE_MASTER_KEY);

  return Boolean(log);
};

/**
 * Refuses an action that commits the member (booking, cancelling: seats, money, penalties) when the
 * caller is a support agent signed in as them. The agent is there to look and to help, not to act
 * in the member's name.
 */
export const assertNotImpersonatedSessionService = async (
  user: Parse.User | undefined,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  if (await isImpersonatedSessionService(user?.getSessionToken())) {
    throw new Error(translate('error.actionBlockedDuringImpersonation', locale));
  }
};
