import { SENTRY_ERROR_SAMPLE_RATE } from '@shared/constants';
import { getSentryEnvironment, scrubSentryBreadcrumb, scrubSentryEvent } from '@shared/utils';

import type { BrowserOptions } from '@sentry/nextjs';

import { SENTRY_IGNORED_ERRORS, SENTRY_IGNORED_URLS } from '@/utils/constants';

/**
 * The options shared by the browser, the Node.js server and the edge runtime. `undefined` means this
 * run must report nothing: no DSN, or no reporting environment (preProduction or production), so local
 * development and Storybook never spend the quota.
 */
export const getSentryOptions = (): BrowserOptions | undefined => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = getSentryEnvironment(process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT);

  if (!dsn || !environment) return undefined;

  return {
    dsn,
    environment,
    sampleRate: SENTRY_ERROR_SAMPLE_RATE[environment],
    // the Sentry project is shared with the back-office: this tag tells the two apps apart
    initialScope: { tags: { app: 'web' } },
    ignoreErrors: SENTRY_IGNORED_ERRORS,
    denyUrls: SENTRY_IGNORED_URLS,
    // the contact and newsletter pages carry e-mails and phone numbers in texts and addresses
    beforeSend: scrubSentryEvent,
    beforeBreadcrumb: scrubSentryBreadcrumb,
  };
};
