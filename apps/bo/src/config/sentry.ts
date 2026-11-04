import * as Sentry from '@sentry/react';
import { SENTRY_ERROR_SAMPLE_RATE } from '@shared/constants';
import { getSentryEnvironment, scrubSentryBreadcrumb, scrubSentryEvent } from '@shared/utils';

import type { Store } from '@/redux/store';

import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';

/**
 * Starts the error reporting. It stays off, and sends nothing, unless this is a built bundle (never
 * `pnpm dev`) that names a reporting environment (preProduction or production) and carries a DSN.
 */
export const initializeSentry = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = getSentryEnvironment(import.meta.env.VITE_SENTRY_ENVIRONMENT);

  if (import.meta.env.DEV || !dsn || !environment) return;

  Sentry.init({
    dsn,
    environment,
    release: import.meta.env.VITE_APP_RELEASE,
    sampleRate: SENTRY_ERROR_SAMPLE_RATE[environment],
    // the project is shared with the mobile app: this tag tells the two apps apart
    initialScope: { tags: { app: 'bo' } },
    beforeSend: scrubSentryEvent,
    // the BO keeps its list filters in the address, and console messages can hold anything
    beforeBreadcrumb: scrubSentryBreadcrumb,
  });
};

/**
 * Tells Sentry who is signed in, by Parse `objectId` only — never the e-mail or the phone number —
 * and clears it on sign-out.
 */
export const syncSentryUser = (store: Store): void => {
  let currentId: string | undefined;

  const sync = () => {
    const userId = getAppCurrentUserSelector(store.getState())?.id;

    if (userId === currentId) return;

    currentId = userId;
    Sentry.setUser(userId ? { id: userId } : null);
  };

  sync();
  store.subscribe(sync);
};
