import { type MetadataRoute } from 'next';

import { defaultLocale, locales } from '@/i18n/config';
import { getAbsoluteUrl } from '@/utils/app.utils';

/**
 * The function `sitemap` generates a sitemap for a website with multiple language alternatives.
 * Its for static routes
 * for dynamic routes, the sitemap.xml are located in the app directory (ex: /articles/sitemap.xml for articles).
 * NOTE: to add a new dynamic sitemap, you need to create a new file in the app directory (ex: /articles/sitemap.ts for articles)
 * @returns.
 */
// eslint-disable-next-line @typescript-eslint/require-await
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const homeSiteMap: Record<string, any> = {
    lastModified: new Date().toISOString(),
    alternates: { languages: {} },
  };

  locales.forEach((locale) => {
    // full url
    const url = getAbsoluteUrl(`/${locale}`);

    if (locale === defaultLocale) {
      homeSiteMap.url = url;
    }
    else {
      homeSiteMap.alternates.languages[locale] = url;
    }
  });

  return [homeSiteMap as any];
};

export default sitemap;
