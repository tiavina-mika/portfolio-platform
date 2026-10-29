import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';
import type { IInvitation } from '@/types/invitation.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import {
  APP_NAME, collections, HIGHEST_LEVEL_ROLES, INVITATION_EXPIRY_DAYS, IS_LOCAL, IS_TEST,
  OWNER_INVITATION_EXPIRY_DAYS, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';
import { normalizeEmail } from '@/utils/_core/signup-identity.utils';
import { getOwnersEmails } from '@/utils/_core/user.utils';
import { generateToken, getServerUrl } from '@/utils/_core/utils';

import { getRoleLabels } from './right.service.cloud';
import { notifyOwnersOfInvitationFailure, updateRoleForUser } from './userRole.service.cloud';
import { sendInvitationEmail } from '../../utils/_core/email.utils.cloud';

type InvitationObject = Parse.Object<IInvitation>;

const INVITATION_FIELDS: (keyof IInvitation)[] = [
  'email',
  'token',
  'invitedBy',
  'roles',
  'expiresAt',
  'consumedAt',
];

/**
 * creates a single-use BO invitation for the given email, or refreshes the existing one
 * (new token + expiry) if an unconsumed invitation for that email already exists — avoids
 * piling up duplicate rows when an admin re-invites the same address
 */
export const createInvitation = async (
  email: string,
  roles: string[],
  invitedBy: Parse.User | undefined,
  expiryDays: number = INVITATION_EXPIRY_DAYS
): Promise<InvitationObject> => {
  const existing = await new Parse.Query<InvitationObject>(collections.Invitation)
    .equalTo('email', email)
    .doesNotExist('consumedAt')
    .select(INVITATION_FIELDS)
    .first(USE_MASTER_KEY);

  const invitation = existing ?? (new Parse.Object(collections.Invitation) as InvitationObject);

  invitation.set('email', email);
  invitation.set('roles', roles);
  invitation.set('invitedBy', invitedBy);
  invitation.set('token', generateToken());
  invitation.set('expiresAt', dayjs().add(expiryDays, 'day').toDate());

  return invitation.save(null, USE_MASTER_KEY);
};

/**
 * finds any unconsumed invitation already pending for an email — used to avoid re-creating
 * (and re-emailing) an invitation the recipient has not accepted yet
 */
export const findPendingInvitationByEmail = async (email: string): Promise<InvitationObject | undefined> => {
  return new Parse.Query<InvitationObject>(collections.Invitation)
    .equalTo('email', email)
    .doesNotExist('consumedAt')
    .select(INVITATION_FIELDS)
    .first(USE_MASTER_KEY);
};

/**
 * finds an unconsumed invitation that has not expired yet — an expired one is no pending invitation:
 * the first owner has to be able to get a new link
 */
export const findValidPendingInvitationByEmail = async (
  email: string
): Promise<InvitationObject | undefined> => {
  return new Parse.Query<InvitationObject>(collections.Invitation)
    .equalTo('email', email)
    .doesNotExist('consumedAt')
    .greaterThan('expiresAt', new Date())
    .select(INVITATION_FIELDS)
    .first(USE_MASTER_KEY);
};

/**
 * finds a still-valid (unconsumed, unexpired) invitation by its token
 */
export const findValidInvitationByToken = async (token: string): Promise<InvitationObject | undefined> => {
  return new Parse.Query<InvitationObject>(collections.Invitation)
    .equalTo('token', token)
    .doesNotExist('consumedAt')
    .greaterThan('expiresAt', new Date())
    .select(INVITATION_FIELDS)
    .limit(1)
    .first(USE_MASTER_KEY);
};

/**
 * marks an invitation as consumed once the invited account has been created
 */
export const consumeInvitation = (invitation: InvitationObject): Promise<InvitationObject> => {
  invitation.set('consumedAt', new Date());

  return invitation.save(null, USE_MASTER_KEY);
};

/**
 * Gives the invited account the roles of its invitation, then consumes it. Parse swallows an error
 * thrown from `afterSave`: without the catch nobody would learn the account has no role. The
 * invitation stays unconsumed on failure, but its address is taken — it is the account that has to
 * be repaired (an administrator adds the role from the user page), hence the alert to the owners.
 */
export const grantInvitationRoles = async (
  user: Parse.User,
  invitation: InvitationObject
): Promise<void> => {
  try {
    /*
     * trusted server-side bootstrap — sendBOInvitation itself requires OWNER/SUPER_ADMIN
     * before it will ever create an invitation whose `roles` includes a highest-level role,
     * so this consumption step is not a user-driven escalation path
     */
    await updateRoleForUser(invitation.get('roles'), user, undefined, {
      bypassEscalationGuard: true, invitedBy: invitation.get('invitedBy'),
    });
    // consumed only once the roles are applied
    await consumeInvitation(invitation);
  } catch (error) {
    logger.error(`Could not give the invited roles to ${user.id}`, {
      invitationId: invitation.id, error: (error as Error).stack,
    });
    await notifyOwnersOfInvitationFailure(user.get('email'));
  }
};

/**
 * looks up the invitation for a BO signup and throws a generic (non-enumerating) error if the
 * token is missing/expired/consumed, or was issued for a different email than the one signing up
 */
export const assertValidInvitationForSignup = async (
  email: string,
  token: string | undefined,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<InvitationObject> => {
  const invitation = token ? await findValidInvitationByToken(token) : undefined;

  // an invitation written before addresses were normalized may still carry capitals
  if (!invitation || normalizeEmail(invitation.get('email')) !== normalizeEmail(email)) {
    throw new Error(translate('user.invitation.invalidOrExpiredInvitation', locale));
  }

  return invitation;
};

/**
 * runs on every server boot — sends a BO invitation to any OWNERS_EMAILS address that has
 * neither an existing account nor a pending invitation yet, so the very first admin can be
 * created without a chicken-and-egg problem (sendBOInvitation requires an already-authenticated
 * admin, which does not exist yet on a fresh environment). No-op on every subsequent boot once
 * the owner has an account or a still-pending invitation, so it is safe to leave wired in
 * permanently rather than behind a one-shot flag.
 */
export const ensureOwnerInvitationsExist = async (): Promise<void> => {
  const ownersEmails = getOwnersEmails();

  logger.info(
    ownersEmails.length
      ? `[bootstrapAdmin] Recognized OWNERS_EMAILS: ${ownersEmails.join(', ')}`
      : '[bootstrapAdmin] OWNERS_EMAILS is empty or unset — no owner can be bootstrapped'
  );

  for (const email of ownersEmails) {
    const existingUser = await new Parse.Query(Parse.User)
      .equalTo('email', email)
      .select(['email'])
      .first(USE_MASTER_KEY);

    if (existingUser) continue;

    // an expired link is no pending invitation — the owner has to be able to get a new one
    const pendingInvitation = await findValidPendingInvitationByEmail(email);

    if (pendingInvitation) continue;

    const invitation = await createInvitation(
      email,
      [HIGHEST_LEVEL_ROLES[0]!],
      undefined,
      OWNER_INVITATION_EXPIRY_DAYS
    );

    // avoid sending a real email on every hot-reload/test run — same pattern as user.triggers.ts's email verification skip
    if (IS_LOCAL || IS_TEST) {
      logger.info(`[bootstrapAdmin] Owner invite link for "${email}": ${getServerUrl()}/invite?token=${invitation.get('token')}`);
      continue;
    }

    const roleLabels = await getRoleLabels([HIGHEST_LEVEL_ROLES[0]!], DEFAULT_LANGUAGE);

    await sendInvitationEmail({
      email,
      inviterName: APP_NAME,
      token: invitation.get('token'),
      locale: DEFAULT_LANGUAGE,
      roleLabel: roleLabels.join(', '),
    });

    logger.info(`[bootstrapAdmin] Owner invitation sent to "${email}"`);
  }
};
