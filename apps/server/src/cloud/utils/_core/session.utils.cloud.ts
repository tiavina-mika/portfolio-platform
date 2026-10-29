import dayjs from 'dayjs';
import ParseServerConfig from 'parse-server/lib/Config.js';
import RestWrite from 'parse-server/lib/RestWrite.js';

import { HIGHEST_LEVEL_ROLES, USE_MASTER_KEY } from '@/constants/_core/constants';
import { BO_SESSION_MAX_HOURS } from '@/constants/_core/session.constants';
import { OwnerAlertEventEnum } from '@/types/ownerAlert.type';

import { getMongoCollection } from './db.utils.cloud';
import { getUserRoles } from './role.utils.cloud';
import { alertOwners } from '../../services/_core/ownerAlert.service.cloud';

type IssueParseSessionOptions = {
  // `authProvider` is Parse's own `createdWith` field — it tells a password session from a code one
  createdWith: { action: string; authProvider?: string };
  additionalSessionData?: Record<string, unknown>;
};

/**
 * Gives the session of a staff account (one holding a back-office role) an expiry of
 * BO_SESSION_MAX_HOURS: Parse applies it on every request, whether or not it goes through a Cloud
 * Function, and the browser's inactivity timer alone cannot protect a token copied out of it.
 * A member of the public keeps Parse's long session (the mobile app wants to stay signed in), and a
 * session that already expires sooner is left alone.
 */
const limitStaffSessionLifetime = async (sessionToken: string): Promise<void> => {
  const maxExpiresAt = dayjs().add(BO_SESSION_MAX_HOURS, 'hour').toDate();
  const sessions = await getMongoCollection('_Session');

  /*
   * straight on the collection: the SDK treats `expiresAt` as read-only, master key or not.
   * `$min` keeps the shorter of the two, so a session that expires sooner is never lengthened
   */
  await sessions.updateOne({ _session_token: sessionToken }, { $min: { expiresAt: maxExpiresAt } });
};

/**
 * Tells the owners that an OWNER or a SUPER_ADMIN account just signed in. These accounts belong to
 * people who seldom open the back-office, so a sign-in nobody expected is the first sign of a stolen
 * password — the e-mail lets the real holder say "that was not me" within minutes.
 */
const alertOwnersOfHighestRoleLogin = async (user: Parse.User, roles: Parse.Role[]): Promise<void> => {
  const highestRoleNames = roles
    .map((role) => role.getName())
    .filter((name) => HIGHEST_LEVEL_ROLES.includes(name));

  if (!highestRoleNames.length) return;

  // the session minting paths only carry the account's id: the alert needs its name
  const actor = await new Parse.Query(Parse.User)
    .select(['firstName', 'lastName', 'email'])
    .get(user.id, USE_MASTER_KEY);

  await alertOwners(OwnerAlertEventEnum.HIGHEST_ROLE_LOGIN, actor, { roles: highestRoleNames.join(', ') });
};

/**
 * What follows the opening of a session by a staff account (one holding a back-office role): its
 * expiry is brought down to BO_SESSION_MAX_HOURS — Parse applies it on every request, whether or not
 * it goes through a Cloud Function, and the browser's inactivity timer alone cannot protect a token
 * copied out of it — and the owners hear of a highest role signing in. A member of the public keeps
 * Parse's long session (the mobile app wants to stay signed in), and a session that already expires
 * sooner is left alone.
 */
export const onStaffSessionOpened = async (user: Parse.User, sessionToken: string): Promise<void> => {
  const roles = await getUserRoles(user);

  if (!roles?.length) return;

  await limitStaffSessionLifetime(sessionToken);
  await alertOwnersOfHighestRoleLogin(user, roles);
};

/**
 * Mints a real `_Session` for a user without going through `Parse.User.logIn` — the public
 * `Parse.Session` API lists `user`/`sessionToken`/`expiresAt`/`restricted`/`createdWith` as
 * client-side readOnlyAttributes and refuses to set any of them, master key or not (enforced by
 * the JS SDK itself, the same one Cloud Code runs on). `RestWrite.createSession` is parse-server's
 * own internal session-creation helper — the same one it uses for a genuine `/login` — and is the
 * only way to issue a session for a user other than the one currently authenticating.
 * Shared by impersonation (`createImpersonationSessionService`) and MFA login
 * (`verifyMfaLoginService`), which both need to hand a user a session without their password.
 */
export const issueParseSession = async (
  userId: string,
  { createdWith, additionalSessionData }: IssueParseSessionOptions
): Promise<string> => {
  const config = ParseServerConfig.get(Parse.applicationId);
  const { sessionData, createSession } = RestWrite.createSession(config, {
    userId,
    createdWith,
    ...(additionalSessionData ? { additionalSessionData } : {}),
  });

  await createSession();

  const user = await new Parse.Query(Parse.User).select(['objectId']).get(userId, USE_MASTER_KEY);

  await onStaffSessionOpened(user, sessionData.sessionToken);

  return sessionData.sessionToken;
};
