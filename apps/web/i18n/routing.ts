import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales, localePrefix } from './config';
import { translatedRoutes } from './routes';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  localeDetection: true,
  // add prefix even with default locale
  localePrefix,
  pathnames: translatedRoutes,
});

/*
 * Lightweight wrappers around Next.js' navigation APIs
 * that will consider the routing configuration
 */
export const {
  Link, redirect, usePathname, useRouter,
} = createNavigation(routing);
