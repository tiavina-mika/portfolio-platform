import type { SessionSignInMethod } from '@/types/userSession.type';

import { IMPERSONATION_SESSION_ACTION, SMS_AUTH_PROVIDER } from '@/constants/_core/session.constants';

type SessionCreatedWith = { action?: string; authProvider?: string } | undefined;

/**
 * Reads how a session was opened from its `createdWith`. Anything that is neither a code nor a
 * support session is a password one: Parse writes `password` for a login or a signup, and the MFA
 * login (which records no provider) is only reached after the password was checked.
 */
export const getSessionSignInMethod = (createdWith: SessionCreatedWith): SessionSignInMethod => {
  if (createdWith?.authProvider === SMS_AUTH_PROVIDER) return 'sms';
  if (createdWith?.action === IMPERSONATION_SESSION_ACTION) return 'support';

  return 'password';
};
