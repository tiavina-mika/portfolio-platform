import type { MetadataRoute } from 'next';

import { locales } from '@/i18n/config';
import { getAbsoluteUrl } from '@/utils/app.utils';

/**
 * @see https://github.com/search?q=path%3Aapp%2Frobots.ts&type=code
 * @see https://robotstxt.org/robotstxt.html
 * @see https://rotecna.com/robots.txt
 */

const robots = (): MetadataRoute.Robots => {
  // home sitemap + per-locale articles, projects and CMS pages sitemaps
  const sitemaps = [
    `${getAbsoluteUrl()}/sitemap.xml`,
    ...locales.flatMap((locale) => [
      `${getAbsoluteUrl()}/${locale}/blog/sitemap.xml`,
      `${getAbsoluteUrl()}/${locale}/pages/sitemap.xml`,
      `${getAbsoluteUrl()}/${locale}/projects/sitemap.xml`,
    ]),
  ];

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: sitemaps,
  };
};

export default robots;
