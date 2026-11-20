import { type MetadataRoute } from 'next';

import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getTranslatedAbsoluteUrl } from '@/utils/app.utils';

// the pages of the site that exist once, whatever the content of the database
const STATIC_ROUTES = [
  ROUTES.home,
  ROUTES.pricing,
  ROUTES.simulator,
  ROUTES.projects.root,
  ROUTES.about,
  ROUTES.contact,
  ROUTES.legal,
  ROUTES.privacy,
];

/**
 * The sitemap of the static pages, each one with its address in every language.
 * NOTE: the pages that come from the database have their own sitemap, in their own folder of the app
 * directory (ex: /blog/sitemap.ts for the articles).
 */
// eslint-disable-next-line @typescript-eslint/require-await
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const lastModified = new Date().toISOString();

  return STATIC_ROUTES.map((route) => {
    const urlsByLocale = Object.fromEntries(
      locales.map((locale: Locale) => [locale, getTranslatedAbsoluteUrl(route, { locale })])
    ) as Record<Locale, string>;

    return {
      url: urlsByLocale[defaultLocale],
      lastModified,
      alternates: { languages: urlsByLocale },
    };
  });
};

export default sitemap;
