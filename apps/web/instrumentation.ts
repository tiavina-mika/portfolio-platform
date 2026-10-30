import * as Sentry from '@sentry/nextjs';

import { getSentryOptions } from '@/config/sentry';

// Next.js calls this once when a Node.js or edge server instance starts
export const register = () => {
  const options = getSentryOptions();

  if (options) Sentry.init(options);
};

// reports the errors thrown while rendering server components and running route handlers
export const onRequestError = Sentry.captureRequestError;
