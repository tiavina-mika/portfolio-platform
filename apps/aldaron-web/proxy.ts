/**
 * This middleware is used to handle the internationalization of the routes
 * @see https://next-intl-docs.vercel.app/docs/routing/middleware
 */
import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale } from '@/i18n/config';

import { routing } from './i18n/routing';

// eslint-disable-next-line @typescript-eslint/require-await
const proxy = async (request: NextRequest) => {
  const handleI18nRouting = createMiddleware(routing);

  /*
   * Step 1: Get the custom locale from the request headers
   * it's used when forcing a specific locale for certain requests (url)
   */
  const customDefaultLocale =
    request.headers.get('x-custom-locale') || defaultLocale;

  const response = handleI18nRouting(request);

  // Step 2: if defined in the headers, set the custom locale
  response.headers.set('x-custom-locale', customDefaultLocale);

  return response;
};

export default proxy;

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(fr|en)/:path*',
    /*
     * Enable redirects that add missing locales
     * (e.g. `/pathnames` -> `/en/pathnames`)
     * url with /api should not be translated
     */
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
