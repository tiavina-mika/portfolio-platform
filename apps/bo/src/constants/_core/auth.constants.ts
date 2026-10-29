import {
  ROLE_SESSION_TIMEOUT_MAX_MINUTES,
  ROLE_SESSION_TIMEOUT_MIN_MINUTES,
  ROLE_SESSION_TIMEOUT_STEP_MINUTES,
} from '@shared/constants';

export const MINUTES_PER_HOUR = 60;
export const MS_PER_MINUTE = 60 * 1000;

/*
 * default auto-logout delay after this much inactivity (no mouse/keyboard/touch activity) — a role
 * can override it with its own `sessionTimeoutMinutes` (see getSessionInactivityTimeoutMs)
 */
export const SESSION_INACTIVITY_TIMEOUT_MINUTES = 30;
export const SESSION_INACTIVITY_TIMEOUT_MS = SESSION_INACTIVITY_TIMEOUT_MINUTES * MS_PER_MINUTE;

// the roles of the signed-in account are re-read when the tab regains focus, at most this often
export const ROLES_REFRESH_MIN_INTERVAL_MS = 60 * 1000;

// how long the "are you still there?" warning is shown before the actual logout
export const SESSION_INACTIVITY_WARNING_MS = 60 * 1000;

/*
 * the dashboard guard runs on every navigation, and verifying the session means a network
 * round-trip: doing it per click makes each menu click an opportunity for a transient server
 * hiccup to look like a dead session. The last verdict is reused for this long instead — a token
 * revoked server-side in the meantime still surfaces on the very next API call, which fails with
 * INVALID_SESSION_TOKEN regardless of this cache.
 */
export const SESSION_VALIDITY_CHECK_INTERVAL_MS = 60 * 1000;

/*
 * local escape hatch: being logged out every 30 minutes while developing is pure friction, and
 * re-logging in is not what is being tested. Opted into per machine through `.env.local` (never
 * committed), and gated on DEV on top of it so that no built bundle can ever ship with the
 * inactivity logout disabled — `vite build` does read `.env.local` when the file is present, so
 * the flag alone would not be a sufficient guarantee.
 */
export const IS_SESSION_INACTIVITY_TIMEOUT_DISABLED = import.meta.env.DEV &&
  import.meta.env.VITE_DISABLE_SESSION_TIMEOUT === 'true';

/*
 * the role form asks for the timeout in hours — "1.5 h" reads better than "90 minutes" for a delay
 * of this magnitude — while the value itself stays stored in minutes. These are the same bounds as
 * the shared ones, expressed in the unit the form displays.
 */
export const SESSION_INACTIVITY_TIMEOUT_HOURS = SESSION_INACTIVITY_TIMEOUT_MINUTES / MINUTES_PER_HOUR;
export const ROLE_SESSION_TIMEOUT_MIN_HOURS = ROLE_SESSION_TIMEOUT_MIN_MINUTES / MINUTES_PER_HOUR;
export const ROLE_SESSION_TIMEOUT_MAX_HOURS = ROLE_SESSION_TIMEOUT_MAX_MINUTES / MINUTES_PER_HOUR;
export const ROLE_SESSION_TIMEOUT_STEP_HOURS = ROLE_SESSION_TIMEOUT_STEP_MINUTES / MINUTES_PER_HOUR;

/*
 * a TOTP code, and only a TOTP code. The MFA field also accepts a single-use backup code
 * (`XXXXX-XXXXX`, uppercase letters and digits), so auto-submitting on "6 characters typed" would
 * fire mid-backup-code and burn one of the 5 attempts that permanently lock the account. Six
 * *digits* can never be a backup-code prefix — its 6th character is always the separator.
 */
export const MFA_TOTP_CODE_PATTERN = /^\d{6}$/;

/*
 * the enrollment QR is not decoration: it has to be readable by a phone camera held in front of the
 * screen, so it stays well above the 132px slot the design sketches it in — at that size the
 * modules of a secret this long fall to about two pixels each and scanning starts to fail
 */
export const MFA_QR_CODE_SIZE = 200;
