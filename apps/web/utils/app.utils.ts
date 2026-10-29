import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import env from '@/env';
import { Locale } from '@/i18n/config';
import {
  ROUTES,
  translatedRoutes,
} from '@/i18n/routes';
import { IPaginationQuery } from '@/types/app.type';

import { getCurrentLocale, getTranslatedField } from './translation.utils';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getAbsoluteUrl = (path?: string): string => {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`;
};

/**
 * get the current url browser
 * if no path, the home url will be returned
 * @param params ex: { locale: 'fr', articleId: '1' }
 * @param path
 * @returns
 */
export const getTranslatedAbsoluteUrl = (
  path = ROUTES.home,
  params?: Record<string, string>
): string => {
  const locale = getCurrentLocale(params?.locale) as Locale;
  const routes = translatedRoutes[path] as Record<Locale, string>;
  const pathname = routes[locale];

  /**
   * change the pathname params key to dynamic value
   * ex: /dashboard/articles/[articleId] -> /dashboard/articles/1
   */
  if (params) {
    let translatedPath = pathname;

    Object.keys(params).forEach((key: string) => {
      translatedPath = translatedPath.replace(`[${key}]`, params[key]);
    });

    const url = getAbsoluteUrl(`/${locale}${translatedPath}`);

    return url;
  }

  const url = getAbsoluteUrl(`/${locale}${pathname}`);

  return url;
};

export const getPaginatedQuery = (
  perPage: number,
  page: number
): IPaginationQuery => {
  return {
    limit: perPage,
    skip: (page - 1) * perPage,
  };
};

export const getYoutubeVideoId = (videoUrl: string): string => {
  return videoUrl.split('v=')[1].split('&')[0];
};

export const goToItemBySlug = <T extends Record<Locale, Record<string, any>>>(
  translated: T,
  locale: Locale,
  routeKey: string
): any => {
  return (ROUTES as any)[routeKey].preview(
    getTranslatedField(translated, locale, 'slug')
  );
};
