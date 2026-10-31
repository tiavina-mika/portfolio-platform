/* eslint-disable @cspell/spellchecker */
import { DEFAULT_COUNTRY } from '@shared/constants';

export const APP_NAME = 'Tiavina Michael RALAINIRINA';
export const AUTHOR_USERNAME = 'tiavina-mika';
export const APP_SHORT_NAME = 'Mika';

export const collections = {
  Article: 'Article',
  Newsletter: 'Newsletter',
  Page: 'Page',
  Category: 'Category',
  PageSection: 'PageSection',
  Contact: 'Contact',
  App: 'App',
  Project: 'Project',
};

export const DISABLE_USER_ACCOUNT_CONFIRMATION = false;
// the blog shows its categories as one row of filter chips: more would not fit a screen
export const ARTICLE_CATEGORIES_LIMIT = 12;

// number of articles suggested at the end of an article
export const RELATED_ARTICLES_COUNT = 3;

// default `sizes` of a card image: half the viewport on desktop, full width on mobile
export const CARD_IMAGE_SIZES = '(min-width: 768px) 50vw, 100vw';

export const PAGINATION = {
  perPage: 12,
};

// number of pages previewed for each level-3 subcategory shown inline on its level-2 parent's page
export const CATEGORY_SUBCATEGORY_PAGES_PREVIEW_LIMIT = 3;

/**
 * with `cacheComponents` enabled, Next.js requires every `generateStaticParams` to return at
 * least one param (an empty array is a hard build error, used to validate there is no unguarded
 * dynamic access left in the route) — this slug never matches a real record, so it always falls
 * through to the route's own `notFound()` handling when the underlying collection is empty
 * (e.g. no CMS pages/articles published yet in a fresh environment)
 */
export const GENERATE_STATIC_PARAMS_FALLBACK_SLUG = '__cache-components-fallback__';

export const COOKIES = {
  locale: 'NEXT_LOCALE',
  // 'granted' | 'denied' | absent = not answered yet
  consent: 'cookie_consent',
};

export const IMAGES = {
  logo: '/images/logo.svg',
  projects: '/images/developer-illustration.jpg',
  technologies: '/images/brain.webp',
};

export const SOCIALS = [
  {
    label: 'linkedin',
    name: 'LinkedIn',
    value: 'https://www.linkedin.com/in/tiavina-michael-ralainirina/',
  },
  { label: 'whatsapp', name: 'WhatsApp', value: 'https://wa.me/+261341865749' },
  { label: 'email', name: 'Email', value: 'mailto:tiavinamika@gmail.com' },
  { label: 'youtube', name: 'YouTube', value: 'https://www.youtube.com/@tiavina-mika' },
];

/*
 * The country whose editorial content (articles, pages) the website shows. The site has no
 * member to read a country from and one domain, so it is the default country's.
 */
export const WEB_COUNTRY_CODE = DEFAULT_COUNTRY.code;

export const EMAIL = 'tiavinamika@gmail.com';
export const PHONE = '+261341865749';

export const CONTACTS = [
  'VN 50B, Ambohitsoa',
  'Antananarivo, Madagascar',
  EMAIL,
];

/*
 * average adult silent reading speed, used to turn an article's word count into a "x min read"
 * label — 200 wpm is the middle of the commonly measured 175–250 range for non-technical prose
 */
export const AVERAGE_READING_WORDS_PER_MINUTE = 200;

// id of the placeholder row the search returns when nothing matches
export const SEARCH_EMPTY_RESULT_ID = 'empty';

// hosts allowed in next.config.mjs `images.remotePatterns` — any other one must skip the optimizer
export const OPTIMIZED_IMAGE_HOSTNAMES = ['res.cloudinary.com'];

// size every link preview (Facebook, WhatsApp, LinkedIn, X) expects for a large image card
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/*
 * Longest texts a share card prints, past which they are cut with an ellipsis: about 3 lines of
 * title, 3 lines of subtitle, and a chip kept on one line. The image renderer has no line clamp,
 * and a longer text would push the bottom of the card out of the image.
 */
export const OG_CARD_TITLE_MAX_LENGTH = 110;
export const OG_CARD_SUBTITLE_MAX_LENGTH = 120;
export const OG_CARD_LABEL_MAX_LENGTH = 24;

/*
 * Colors of the share card. Raw hex on purpose: the card is an image, always dark whatever the
 * visitor's theme, and the image renderer reads no CSS variable.
 */
export const OG_CARD_COLORS = {
  background: '#171717',
  text: '#fafafa',
  subtitle: '#d4d4d4',
  muted: '#a3a3a3',
  chipBackground: '#262626',
  chipText: '#b2ce66',
};

/**
 * Per-visitor limit of the contact form and of the newsletter form (one allowance each): a person
 * correcting a typo or retrying after an error stays below it, a script posting in a loop does not —
 * and it is stopped alone, instead of using up the API server's website-wide allowance.
 */
export const FORM_RATE_LIMIT_REQUESTS = 5;
export const FORM_RATE_LIMIT_WINDOW = '1 h';

// each language is written in its own language in the language menu, whatever the active locale
export const LOCALE_NATIVE_NAMES = {
  fr: 'Français',
  en: 'English',
} as const;

// browser noise that says nothing about the site and would eat the Sentry quota
export const SENTRY_IGNORED_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
];
// scripts injected by browser extensions
export const SENTRY_IGNORED_URLS = [
  /^chrome-extension:\/\//,
  /^moz-extension:\/\//,
  /^safari-extension:\/\//,
];
