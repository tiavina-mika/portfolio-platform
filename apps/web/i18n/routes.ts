/* eslint-disable @cspell/spellchecker */

// the key used for routers and translated pathnames
export const ROUTES = {
  home: '/',
  contact: '/contact-me',
  sitemap: '/sitemap',
  articles: {
    root: '/articles',
    // do not need the params when used with translatedPathnames
    preview: (slug?: string) => ({
      pathname: '/articles/[slug]',
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
  },
  unsubscribeNewsletter: {
    // do not need the params when used with translatedPathnames
    preview: (encryptedEmail?: string) => ({
      pathname: '/newsletter/[encryptedEmail]/unsubscribe',
      params: { encryptedEmail },
    }),
  },
};

export const nonSEORoutes = [];

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
    fr: '/contactez-moi',
  },

  [ROUTES.sitemap]: {
    en: ROUTES.sitemap,
    fr: '/plan-du-site',
  },
  [ROUTES.articles.root]: {
    en: ROUTES.articles.root,
    fr: '/articles',
  },
  [ROUTES.articles.preview().pathname]: {
    en: '/articles/[slug]',
    fr: '/articles/[slug]',
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
  [ROUTES.unsubscribeNewsletter.preview().pathname]: {
    en: '/newsletter/[encryptedEmail]/unsubscribe',
    fr: '/newsletter/[encryptedEmail]/se-desabonner',
  },
};
