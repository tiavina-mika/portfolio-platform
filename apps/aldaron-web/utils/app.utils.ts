import { clsx, type ClassValue } from 'clsx';
import { Metadata } from 'next';
import { twMerge } from 'tailwind-merge';

import env from '@/env';
import { defaultLocale, Locale } from '@/i18n/config';
import {
  ROUTES,
  translatedRoutes,
} from '@/i18n/routes';
import { IMenu, IPaginationQuery } from '@/types/app.type';

import { getCurrentLocale, getTranslatedField } from './translation.utils';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Whether a menu link points at the current page. A link with a `pathname` (a dynamic route)
 * also matches the pages below it.
 */
export const isLinkActive = (currentPath: string, href: IMenu['value']): boolean => {
  if (typeof href !== 'string') return currentPath.startsWith(href.pathname);

  return href === currentPath;
};

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

/**
 * build `alternates.canonical` (self-referenced) + `alternates.languages` (hreflang, incl.
 * `x-default`) from a map of absolute URLs per locale — used in every `generateMetadata`
 * @param urlsByLocale absolute URL for each locale, ex: { fr: '.../fr/blog/x', en: '.../en/blog/x' }
 * @param currentLocale the locale of the page currently being rendered
 * @returns
 */
export const getAlternates = (
  urlsByLocale: Partial<Record<Locale, string>>,
  currentLocale: Locale
): Metadata['alternates'] => {
  return {
    canonical: urlsByLocale[currentLocale],
    languages: {
      ...urlsByLocale,
      'x-default': urlsByLocale[defaultLocale] || urlsByLocale[currentLocale],
    },
  };
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

/**
 * Extracts the video id from any common YouTube URL shape:
 * youtube.com/watch?v=<id>, youtu.be/<id>, youtube.com/embed/<id>, youtube.com/shorts/<id>
 */
export const getYoutubeVideoId = (videoUrl: string): string => {
  const match = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/.exec(videoUrl);

  return match?.[1] ?? '';
};

export const goToItemBySlug = <T extends Record<Locale, Record<string, any>>>(
  translated: T,
  locale: Locale,
  routeKey: string
): any => {
  const slug = getTranslatedField(translated, locale, 'slug');

  /*
   * a record missing a slug in both the current and default locale can't build a valid route —
   * falls back home rather than emitting an unresolved `[slug]` href
   */
  if (!slug) return ROUTES.home;

  return (ROUTES as any)[routeKey].preview(slug);
};
