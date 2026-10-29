import Parse from 'parse';

import i18n from '@/config/i18n';

type ParseErrorOverrides = Partial<Record<number, string>>;

/**
 * Parse error codes whose meaning is stable no matter which call site catches them (built-in
 * Parse Server checks, not a specific Cloud trigger's own message) — safe to translate the same
 * way everywhere.
 *
 * Deliberately excluded: OBJECT_NOT_FOUND (101) and SCRIPT_FAILED (141). Parse Server reuses 101
 * for both "invalid login credentials" and "object not found" depending on the request, and 141
 * carries whatever message the specific Cloud trigger that failed decided to throw — neither can
 * be given one correct message globally. Callers that need a specific wording for those codes
 * must pass it via the `overrides` param instead.
 */
const PARSE_ERROR_I18N_KEYS: ParseErrorOverrides = {
  [Parse.Error.USERNAME_TAKEN]: 'user:errors.usernameTaken',
  [Parse.Error.EMAIL_TAKEN]: 'user:errors.usernameTaken',
  [Parse.Error.EMAIL_MISSING]: 'user:errors.invalidEmail',
  [Parse.Error.EMAIL_NOT_FOUND]: 'user:errors.userWithEmailNotFound',
  [Parse.Error.INVALID_SESSION_TOKEN]: 'common:errors.badSession',
};

/**
 * resolves a caught Parse error (or any error with a numeric `.code`) to a translated,
 * user-facing message.
 * @param error the caught error
 * @param overrides call-site-specific mapping, checked before the global map — required for
 * ambiguous codes (101, 141) whose real meaning depends on which action threw them
 * @param fallback i18n key used when nothing matches and the error carries no usable message
 */
export const getParseErrorMessage = (
  error: unknown,
  overrides?: ParseErrorOverrides,
  fallback = 'common:errors.somethingWentWrong'
): string => {
  const code = (error as Parse.Error | undefined)?.code;
  const key = code !== undefined && (overrides?.[code] || PARSE_ERROR_I18N_KEYS[code]);

  if (key) {
    return i18n.t(key);
  }

  const message = (error as Error | undefined)?.message;

  // a top-level admin without a second factor is refused every function but the enrollment itself
  if (message?.includes('MFA_ENROLLMENT_REQUIRED')) {
    return i18n.t('user:mfa.enrollmentRequired');
  }

  return message || i18n.t(fallback);
};
