import * as Sentry from '@sentry/nextjs';

import { getSentryOptions } from '@/config/sentry';

const options = getSentryOptions();

if (options) Sentry.init(options);
