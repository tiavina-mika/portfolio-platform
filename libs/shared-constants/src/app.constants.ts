export const APP_NAME = 'Portfolio';

export const PERSISTED_STATE_KEY = 'persist:root';

/**
 * The mobile app's custom URL scheme (`apps/mobile/app.json` -> `expo.scheme`). Shared because the
 * back-office builds deep links into the app — the support "log in as" link, for one — and a
 * scheme that drifts from the app's own turns those links into dead ends nobody sees fail.
 */
export const MOBILE_APP_SCHEME = 'portfolio';
