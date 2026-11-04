/**
 * Notification status strings the server writes and the clients render, shared so the two never
 * drift on a literal.
 *
 * Only the ones a client actually branches on belong here — a status the server merely stores
 * stays server-side.
 */

/** A suspension that has ended — served in full or lifted by support. */
export const SUSPENSION_LIFTED_STATUS = 'SUSPENSION_LIFTED';

/** The account has been banned; sent by e-mail too, since the ban revokes every session. */
export const ACCOUNT_BANNED_STATUS = 'ACCOUNT_BANNED';

/** A ban has ended — expired or lifted by support. */
export const ACCOUNT_UNBANNED_STATUS = 'ACCOUNT_UNBANNED';

/** Sent to an account signed in from a device it had never used. */
export const NEW_DEVICE_LOGIN_STATUS = 'NEW_DEVICE_LOGIN';

/**
 * A password reset by SMS was requested on an account unused for a long time, and is held back
 * until the date in the payload's `reset.availableAt`. Sent to the account's devices so the
 * original owner, if the phone number was recycled, can sign in and cancel it.
 */
export const PASSWORD_RESET_DELAYED_STATUS = 'PASSWORD_RESET_DELAYED';

/** Sent to an account once a back-office support session on it has ended. */
export const SUPPORT_SESSION_ENDED_STATUS = 'SUPPORT_SESSION_ENDED';

/**
 * An announcement written by the back-office and sent to a segment of the members (an operator
 * incident, a new feature). Its text is not composed from a template like every other notification:
 * the payload carries the words the operator typed, per language.
 */
export const ANNOUNCEMENT_STATUS = 'ANNOUNCEMENT';
