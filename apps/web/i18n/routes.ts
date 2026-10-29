/* eslint-disable @cspell/spellchecker */
import { Pathnames } from 'next-intl/routing';

import { locales } from './config';

export type ITranslatedPathnames = Pathnames<typeof locales>;

// the key used for routers and translated pathnames
export const ROUTES = {
  home: '/',
  contact: '/contact',
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
    // do not need the params when used with translatedPathnames
    preview: (slug?: string) => ({
      pathname: '/projects/[slug]',
      params: { slug },
    }),
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

// and external paths, separated by locale.
export const translatedRoutes = {
  /*
   * If all locales use the same pathname, a
   * single external path can be provided.
   */
  [ROUTES.home]: {
    en: '/',
    fr: '/',
  },

  /*
   * If locales use different paths, you can
   * specify each external path per locale.
   */
  [ROUTES.contact]: {
    en: ROUTES.contact,
    fr: '/contact',
  },

  [ROUTES.sitemap]: {
    en: ROUTES.sitemap,
    fr: '/plan-du-site',
  },
  [ROUTES.articles.root]: {
    en: ROUTES.articles.root,
    fr: '/blog',
  },
  [ROUTES.articles.preview().pathname]: {
    en: '/blog/[slug]',
    fr: '/blog/[slug]',
  },
  [ROUTES.projects.root]: {
    en: ROUTES.projects.root,
    fr: '/projets',
  },
  [ROUTES.projects.preview().pathname]: {
    en: '/projects/[slug]',
    fr: '/projets/[slug]',
  },
  [ROUTES.pages.preview().pathname]: {
    en: '/[slug]',
    fr: '/[slug]',
  },
  [ROUTES.pages.category().pathname]: {
    en: '/[slug]/[subcategory]',
    fr: '/[slug]/[subcategory]',
  },
  [ROUTES.pages.subsubcategory().pathname]: {
    en: '/[slug]/[subcategory]/[subsubcategory]',
    fr: '/[slug]/[subcategory]/[subsubcategory]',
  },
  [ROUTES.unsubscribeNewsletter.preview().pathname]: {
    en: '/newsletter/[encryptedEmail]/unsubscribe',
    fr: '/newsletter/[encryptedEmail]/se-desabonner',
  },
  // the server builds the confirmation links on exactly these paths — change both sides together
  [ROUTES.confirmNewsletter.preview().pathname]: {
    en: '/newsletter/confirm/[token]',
    fr: '/newsletter/confirmer/[token]',
  },
} satisfies ITranslatedPathnames;
