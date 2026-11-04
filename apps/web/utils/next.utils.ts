/*
 * @credits
 * https://github.com/whitecrownclown/merge-headers/blob/master/index.ts
 */

import { defaultLocale, locales } from '@/i18n/config';
import { nonSEORoutes, translatedRoutes } from '@/i18n/routes';

import { getTranslatedAbsoluteUrl } from './app.utils';

const isObject = (value: any) => {
  return value !== null && typeof value === 'object';
};

export const mergeHeaders = (...sources: HeadersInit[]) => {
  const result: Record<string, string> = {};

  for (const source of sources) {
    if (!isObject(source)) {
      throw new TypeError('All arguments must be of type object');
    }

    const headers: Headers = new Headers(source);

    for (const [key, value] of Array.from(headers.entries())) {
      if (value === undefined || value === 'undefined') {
        delete result[key];
      }
      else {
        result[key] = value;
      }
    }
  }

  return new Headers(result);
};

/**
 * get local from url
 * ex: /en/dashboard -> en
 * @param pathname
 * @returns
 */
export const getLocaleByPathname = (pathname: string): string => {
  let locale = pathname.split('/')[1];

  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return locale;
};

/**
 * create url query string from object
 * ex: { field: 'updatedAt', order: 'asc' } -> ?field=updatedAt&order=asc
 */
type DefaultQSParams = Record<string, string | number | null>;
export const createQueryString = <T = DefaultQSParams>(values: T) => {
  const newSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(values as DefaultQSParams)) {
    if (value === null) {
      newSearchParams.delete(key);
    }
    else {
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams.toString();
};

/**
 * get all possible translated urls
 * @returns
 */
export const getAllTranslatedUrls = () => {
  const nonDynamicUrls = [];
  const dynamicUrls = [];

  for (const key of Object.keys(translatedRoutes)) {
    const isNonSEORoute = !!nonSEORoutes.find(route => key.includes(route));
    const isWithDynamicParams = key.includes('[');

    /*
     * non dynamic and non SEO routes
     * 'http://localhost:9001/en/about', 'http://localhost:9001/fr/a-propos'
     */
    if (!isWithDynamicParams && !isNonSEORoute) {
      for (const locale of Object.keys(translatedRoutes[key])) {
        const url = getTranslatedAbsoluteUrl(key, { locale });

        nonDynamicUrls.push(url);
      }
      /*
       * dynamic urls
       * ex: 'http://localhost:9001/en/article/my-article', 'http://localhost:9001/fr/article/mon-article'
       */
    }
    else if (isWithDynamicParams && !isNonSEORoute) {
      for (const locale of Object.keys(translatedRoutes[key])) {
        const url = getTranslatedAbsoluteUrl(key, { locale });

        dynamicUrls.push(url);
      }
    }
  }

  return { nonDynamicUrls, dynamicUrls };
};

/**
 * ex: /articles/[articleId] -> /articles
 * @param route
 * @returns
 */
export const retrievePathnameFromDynamicPathname = (route: string): string => {
  const translatedPath = Object.keys(translatedRoutes).find(
    translatedRoute => translatedRoute === route
  );

  if (!translatedPath) return '/';

  const paths = translatedPath.split('[');
  const path = paths?.[0];

  return path;
};
