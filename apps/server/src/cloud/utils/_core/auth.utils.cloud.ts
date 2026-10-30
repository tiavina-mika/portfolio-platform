import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';

/**
 * Parse Server answers a locked-out account with the same code as an unknown username
 * (`OBJECT_NOT_FOUND`) — only the message tells the two apart.
 */
export const isAccountLockoutError = (error: unknown): boolean => {
  const { code, message } = (error ?? {}) as { code?: number; message?: string };

  return code === Parse.Error.OBJECT_NOT_FOUND && /account is locked/i.test(message ?? '');
};

/**
 * The structured refusals `beforeLogin` raises — a ban (`ACCOUNT_BANNED`) or a pending MFA
 * challenge (`MFA_REQUIRED`). Both carry a JSON payload the client acts on, so they must reach it
 * untouched rather than be folded into a generic "wrong credentials".
 */
export const isBeforeLoginRefusal = (error: unknown): boolean => {
  const { code, message } = (error ?? {}) as { code?: number; message?: string };

  // the payload is matched as well as the code: Parse Server can rewrap a trigger's error
  return code === Parse.Error.OPERATION_FORBIDDEN ||
    /"code"\s*:\s*"(ACCOUNT_BANNED|MFA_REQUIRED)"/.test(message ?? '');
};

/**
 * The password check shared by every "resolve an identifier to an account, then log in" function.
 * The resolved account's `username` goes to `Parse.User.logIn` itself — the real `/login` path, so
 * the `accountLockout` policy and the `beforeLogin` ban trigger apply exactly as they do for a
 * native login, nothing bypassed.
 *
 * `OBJECT_NOT_FOUND` is the code Parse itself answers a bad email login with, so the app reads one
 * shape for every credential instead of telling a cloud-code failure (SCRIPT_FAILED) apart from a
 * wrong password. `@types/parse`'s legacy `class Error` (see src/types/global-parse.d.ts) doesn't
 * declare `extends Error`, even though `Parse.Error` does extend the native `Error` at runtime.
 *
 * @param user the account the identifier resolved to, `undefined` when it resolved to none
 * @param invalidCredentialsKey translation key of the one generic message both failures answer with
 */
export const logInResolvedUser = async (
  user: Parse.User | undefined,
  password: string,
  invalidCredentialsKey: string,
  locale: Locale
): Promise<Record<string, any>> => {
  const invalidCredentials = () =>
    new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, translate(invalidCredentialsKey, locale));

  // generic error — do not reveal whether the identifier is registered/verified as a login identifier
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!user) throw invalidCredentials();

  try {
    const loggedInUser = await Parse.User.logIn(user.get('username'), password);

    return { sessionToken: loggedInUser.getSessionToken() };
  }
  catch (error) {
    /*
     * An unknown identifier answered with the generic message above while a known one + wrong
     * password came back with Parse's raw "Invalid username/password." — the app showed the
     * same text either way, but a script reading the two responses could tell registered
     * identifiers apart one by one. The lockout and the ban keep their own message: both describe
     * the caller's own account, which they have already proven they can reach.
     */
    if (isAccountLockoutError(error) || isBeforeLoginRefusal(error)) throw error;

    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw invalidCredentials();
  }
};
