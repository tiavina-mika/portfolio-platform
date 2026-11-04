import { MOBILE_APP_SCHEME } from '@shared/constants';

import { ImpersonationSession } from '@/types/_core/impersonation.type';

/**
 * The one-shot link that turns a support session into a signed-in mobile app. It targets the app
 * directly rather than a web page: scanning it opens the app on the phone as the user being helped,
 * with no login screen and no password ever leaving their account.
 */
export const buildImpersonationDeepLink = (session: ImpersonationSession): string =>
  `${MOBILE_APP_SCHEME}://impersonate?token=${encodeURIComponent(session.sessionToken)}` +
  `&sessionId=${encodeURIComponent(session.sessionId)}`;
