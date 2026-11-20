/* eslint-disable @cspell/spellchecker */
import { Pathnames } from 'next-intl/routing';

import { locales } from './config';

export type ITranslatedPathnames = Pathnames<typeof locales>;

// the key used for routers and translated pathnames
export const ROUTES = {
  home: '/',
  pricing: '/pricing',
  simulator: '/simulator',
  about: '/about',
  contact: '/contact',
  legal: '/legal',
  privacy: '/privacy',
  sitemap: '/sitemap',
  articles: {
    root: '/blog',
    // do not need the params when used with translatedPathnames
    preview: (slug?: string) => ({
      pathname: '/blog/[slug]',
      params: { slug },
    }),
  },
  projects: {
    root: '/projects',
  },
  pages: {
    // do not need the params when used with translatedPathnames
    preview: (slug?: string) => ({
      pathname: '/[slug]',
      params: { slug },
    }),
    // subcategory listing page, nested under its parent (root) category slug
    category: (slug?: string, subcategory?: string) => ({
      pathname: '/[slug]/[subcategory]',
      params: { slug, subcategory },
    }),
    // sub-subcategory listing page, nested under its root and level-2 parent slugs (max depth: 3 levels)
    subsubcategory: (slug?: string, subcategory?: string, subsubcategory?: string) => ({
      pathname: '/[slug]/[subcategory]/[subsubcategory]',
      params: { slug, subcategory, subsubcategory },
    }),
  },
  unsubscribeNewsletter: {
    // do not need the params when used with translatedPathnames
    preview: (encryptedEmail?: string) => ({
      pathname: '/newsletter/[encryptedEmail]/unsubscribe',
      params: { encryptedEmail },
    }),
  },
  confirmNewsletter: {
    // the link of the double opt-in e-mail — the server builds it on exactly these paths
    preview: (token?: string) => ({
      pathname: '/newsletter/confirm/[token]',
      params: { token },
    }),
  },
};

// private pages reached only through a link sent to someone: kept out of every list of site URLs
export const nonSEORoutes: string[] = [
  ROUTES.confirmNewsletter.preview().pathname,
];

// a path written the same way in every language
const sameInEveryLocale = (path: string) => ({ fr: path, en: path, mg: path });

// and external paths, separated by locale. Every route lists its path for each language.
export const translatedRoutes = {
  [ROUTES.home]: sameInEveryLocale('/'),

  // Malagasy keeps the English paths: its words are read in the page, not guessed in the URL
  [ROUTES.pricing]: { fr: '/offre-et-prix', en: '/pricing', mg: '/pricing' },
  [ROUTES.simulator]: { fr: '/simulateur', en: '/simulator', mg: '/simulator' },
  [ROUTES.about]: { fr: '/a-propos', en: '/about', mg: '/about' },
  [ROUTES.contact]: sameInEveryLocale(ROUTES.contact),
  [ROUTES.legal]: { fr: '/mentions-legales', en: '/legal-notice', mg: '/legal-notice' },
  [ROUTES.privacy]: { fr: '/confidentialite', en: '/privacy', mg: '/privacy' },
  [ROUTES.sitemap]: { fr: '/plan-du-site', en: ROUTES.sitemap, mg: ROUTES.sitemap },
  [ROUTES.articles.root]: sameInEveryLocale(ROUTES.articles.root),
  [ROUTES.articles.preview().pathname]: sameInEveryLocale('/blog/[slug]'),
  [ROUTES.projects.root]: { fr: '/projets', en: ROUTES.projects.root, mg: ROUTES.projects.root },
  [ROUTES.pages.preview().pathname]: sameInEveryLocale('/[slug]'),
  [ROUTES.pages.category().pathname]: sameInEveryLocale('/[slug]/[subcategory]'),
  [ROUTES.pages.subsubcategory().pathname]: sameInEveryLocale('/[slug]/[subcategory]/[subsubcategory]'),
  [ROUTES.unsubscribeNewsletter.preview().pathname]: {
    fr: '/newsletter/[encryptedEmail]/se-desabonner',
    en: '/newsletter/[encryptedEmail]/unsubscribe',
    mg: '/newsletter/[encryptedEmail]/unsubscribe',
  },
  // the server builds the confirmation links on exactly these paths — change both sides together
  [ROUTES.confirmNewsletter.preview().pathname]: {
    fr: '/newsletter/confirmer/[token]',
    en: '/newsletter/confirm/[token]',
    mg: '/newsletter/confirm/[token]',
  },
} satisfies ITranslatedPathnames;
