import Parse from 'parse';

import { SESSION_VALIDITY_CHECK_INTERVAL_MS } from '@/constants/_core/auth.constants';
import { IUser } from '@/types/_core/user.type';
import { setValues, toJSONWithId } from '@/utils/_core/parse.utils';

/*
 * timestamp of the last session verification that actually reached the server and came back
 * valid — see verifySessionValidity. Module-level rather than in the store because it guards a
 * network call, not a rendered value, and it is reset by every function below that changes which
 * session is current, so no caller can forget to invalidate it.
 */
let lastVerifiedSessionAt = 0;

const resetSessionValidityCache = (): void => {
  lastVerifiedSessionAt = 0;
};

export const fetchCurrentUserSessionToken = async (): Promise<string | undefined> => {
  const currentUser = await Parse.User.currentAsync();

  return currentUser?.getSessionToken() ?? undefined;
};

export const logOutCurrentUser = async (): Promise<void> => {
  await Parse.User.logOut();
  resetSessionValidityCache();
};

export const signUpUser = async (newValues: Record<string, any>, properties: Set<string>): Promise<{
  emailVerified: boolean;
}> => {
  const user = new Parse.User();

  setValues(user, newValues, properties);

  const newUser = await user.signUp();

  return { emailVerified: Boolean(newUser.get('emailVerified')) };
};

/**
 * returns the JSON-serialized current user only when Parse SDK confirms a valid session token —
 * Parse SDK is the source of truth for session validity, not the Redux store
 * @param forceRefresh when true, refetches the user from the server before serializing — needed
 * after a Cloud Function mutates the current user server-side (e.g. confirmMfaEnrollment,
 * disableMfa), since `Parse.User.currentAsync()` otherwise returns the stale locally-cached copy
 */
export const fetchCurrentUserJson = async (forceRefresh = false): Promise<IUser | undefined> => {
  const parseCurrentUser = await Parse.User.currentAsync();

  if (!parseCurrentUser?.getSessionToken()) return undefined;

  if (forceRefresh) {
    await parseCurrentUser.fetch();
    // the server just accepted the token, which is exactly what verifySessionValidity checks
    lastVerifiedSessionAt = Date.now();
  }

  return toJSONWithId<IUser>(parseCurrentUser);
};

export const logInUser = async (email: string, password: string): Promise<void> => {
  await Parse.User.logIn(email, password);
  resetSessionValidityCache();
};

/**
 * a Parse error whose token was rejected by the server — the only failure that actually means
 * "this session is over". Everything else (network down, server restarting, a Cloud Function
 * throwing) leaves the session intact and must not trigger a logout
 */
export const isInvalidSessionTokenError = (error: unknown): boolean =>
  (error as Parse.Error | undefined)?.code === Parse.Error.INVALID_SESSION_TOKEN;

export const verifySessionValidity = async (): Promise<{
  currentUser: Parse.User | null | undefined;
  isValidSession: boolean;
}> => {
  let currentUser;
  let isValidSession = false;

  try {
    currentUser = await Parse.User.currentAsync(); // it can throw (rarely)
    if (currentUser) {
      // recently verified against the server — reuse that verdict instead of a new round-trip
      if (Date.now() - lastVerifiedSessionAt < SESSION_VALIDITY_CHECK_INTERVAL_MS) {
        return { currentUser, isValidSession: true };
      }

      // is the session valid ? (some issues might happen)
      try {
        await Parse.Session.current();
        isValidSession = true;
        lastVerifiedSessionAt = Date.now();
      } catch (error) {
        // only an actual invalid/revoked token should force a logout
        if (isInvalidSessionTokenError(error)) {
          console.log('Invalid session token => logout', error);
        } else {
          /*
           * transient error (server restarting, network blip, timeout) — the session itself
           * is still valid in the database, so don't force a logout on a failed request.
           * lastVerifiedSessionAt is deliberately left untouched: nothing was verified here
           */
          console.log('Could not verify session due to a transient error => keep session', error);
          isValidSession = true;
        }
      }
    }
  } catch (error) {
    console.log('Error retrieving the current user => logout', error);
  }

  return { currentUser, isValidSession };
};

// goes through the server: it checks the current password and signs the other devices out
export const changeCurrentUserPassword = async (
  currentPassword: string,
  newPassword: string,
  locale: string
): Promise<void> => {
  await Parse.Cloud.run('changePassword', { currentPassword, newPassword, locale });
};

export const verifyAccountCode = async (params: {
  code: string;
  type: string;
  toVerify?: string;
  locale: string;
  email?: string;
}): Promise<Record<string, any>> => {
  return Parse.Cloud.run('verifyAccount', params);
};

export const sendEmailVerificationCodeInCloud = async (email: string, locale: string): Promise<void> => {
  await Parse.Cloud.run('sendVerificationCode', { email, locale });
};

export const sendResetPasswordVerificationCodeInCloud = async (
  email: string,
  locale: string
): Promise<boolean> => {
  return Parse.Cloud.run('sendResetPasswordVerificationCode', { email, locale });
};

/**
 * `resetToken` is the single-use token the server mints when the reset code is confirmed — it is
 * the only proof of authorization the endpoint accepts.
 */
export const resetPasswordInCloud = async (
  resetToken: string,
  password: string
): Promise<Record<string, any>> => {
  return Parse.Cloud.run('resetPassword', { resetToken, password });
};

export const generateMfaSecretInCloud = async (password: string): Promise<{ otpauthUrl: string }> => {
  return Parse.Cloud.run('generateMfaSecret', { password });
};

/**
 * OWNER-only support path: clears the second factor of an admin who lost their authenticator app
 * and their backup codes, and closes every session of that account.
 */
export const resetUserMfaInCloud = async (userId: string): Promise<void> => {
  await Parse.Cloud.run('adminResetMfa', { userId });
};

export const confirmMfaEnrollmentInCloud = async (code: string): Promise<{ backupCodes: string[] }> => {
  return Parse.Cloud.run('confirmMfaEnrollment', { code });
};

export const verifyMfaLoginInCloud = async (
  mfaChallengeToken: string,
  code: string
): Promise<{ sessionToken: string }> => {
  return Parse.Cloud.run('verifyMfaLogin', { mfaChallengeToken, code });
};

export const disableMfaInCloud = async (code: string): Promise<void> => {
  await Parse.Cloud.run('disableMfa', { code });
};

export const regenerateMfaBackupCodesInCloud = async (code: string): Promise<{ backupCodes: string[] }> => {
  return Parse.Cloud.run('regenerateMfaBackupCodes', { code });
};

/**
 * Hydrates the client SDK with a session minted server-side after a successful verifyMfaLogin —
 * the BO never had the password-authenticated session Parse.User.logIn would normally return,
 * since beforeLogin blocked it outright when MFA is required (see auth.triggers.ts).
 */
export const becomeUserFromSessionToken = async (sessionToken: string): Promise<void> => {
  await Parse.User.become(sessionToken);
  resetSessionValidityCache();
};
