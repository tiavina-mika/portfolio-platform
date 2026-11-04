/**
 * `createdWith.authProvider` Parse stores on a `_Session` opened with a one-time SMS code — Parse
 * writes `password` itself for a password login or a signup
 */
export const SMS_AUTH_PROVIDER = 'sms';

/**
 * How long a session of a staff account (one holding a back-office role) lives on the server,
 * whatever the browser tab's inactivity timer does: a stolen session token must not stay valid for
 * Parse's default of one year. A member of the public keeps the long session the mobile app wants.
 */
export const BO_SESSION_MAX_HOURS = 12;

// `createdWith.action` of a session a support agent opened on the account from the back-office
export const IMPERSONATION_SESSION_ACTION = 'impersonation';
