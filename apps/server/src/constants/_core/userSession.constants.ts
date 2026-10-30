/*
 * Allowance of `registerSession` / `registerPushToken`. The app calls each of them once per login
 * and once per launch, so a real member stays far below these; the caps only stop a script from
 * inventing device ids in a loop — every new device id can trigger a "new device" alert, and for an
 * account without an e-mail address that alert is a paid SMS. The address cap is much wider:
 * mobile carriers put many subscribers behind one address, so it only catches a script spreading
 * the abuse over many accounts from one machine.
 */
export const DEVICE_REGISTRATION_RATE_LIMIT_PER_USER = 20;
export const DEVICE_REGISTRATION_RATE_LIMIT_PER_IP = 300;
export const DEVICE_REGISTRATION_RATE_LIMIT_WINDOW = '15 m';
export const DEVICE_REGISTRATION_RATE_LIMIT_PREFIX = 'ratelimit:deviceRegistration';

/*
 * "New device" alerts sent to one account over a rolling 24 hours. Past it the login still goes
 * through and the device is still listed on the profile — only the alert is not repeated, since a
 * member who reinstalls the app a few times in a day has already been warned.
 */
export const NEW_DEVICE_LOGIN_ALERTS_MAX_PER_DAY = 3;

/*
 * Device rows reached by one `registerPushToken` that still carry the same token under another
 * account (a shared phone, an account switch). One or two in practice; the cap bounds the query.
 */
export const SHARED_PUSH_TOKEN_ROWS_LIMIT = 20;
