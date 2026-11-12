/* eslint-disable @cspell/spellchecker */
import { DEFAULT_COUNTRY } from '@shared/constants';

export const APP_NAME = 'Aldaron';
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

// time zone the dates are formatted in, the same on the server and in the browser
export const TIME_ZONE = 'UTC';

export const COOKIES = {
  locale: 'NEXT_LOCALE',
  // 'granted' | 'denied' | absent = not answered yet
  consent: 'cookie_consent',
};

export const IMAGES = {
  logo: '/brand/png/aldaron-symbol.png',
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

/*
 * distance from the top of the viewport, in px, under which a heading counts as "being read": it clears
 * the sticky navigation bar (55–93px) with some room, so the table of contents highlights the section
 * the visitor is actually in
 */
export const TABLE_OF_CONTENTS_ACTIVE_OFFSET = 140;

// prefix of the ids given to the headings of a content, so they cannot collide with another id of the page
export const TABLE_OF_CONTENTS_ID_PREFIX = 'toc-';

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
// distance between the vertical rules of the share card, the grid of the brand visuals
export const OG_CARD_RULE_SPACING = 80;

/*
 * Colors of the share card. Raw hex on purpose: the card is an image, always light whatever the
 * visitor's theme, and the image renderer reads no CSS variable. Same values as the light theme.
 */
export const OG_CARD_COLORS = {
  background: '#F6F3EE',
  text: '#17181A',
  subtitle: '#5E5A54',
  chipBackground: '#FDF1EA',
  chipText: '#B4400F',
  rule: '#E3DED5',
  brand: '#E2531B',
};

/*
 * Colors of what the browser paints outside the page (address bar, install screen): the metadata
 * reads no CSS variable. Same values as the theme tokens.
 */
export const THEME_COLORS = {
  paper: '#F6F3EE',
  ink: '#17181A',
  night: '#121311',
};

// the shapes of the logo, shared by the site and the share card (which reads no CSS class)
export const LOGO = {
  viewBox: { horizontal: '0 0 133 32', symbol: '0 0 32 32' },
  leftBracket: 'M4 4h10v4H8v16h6v4H4z',
  center: {
    x: 12.5, y: 12.5, width: 7, height: 7, rx: 1,
  },
  rightBracket: 'M28 4H18v4h6v16h-6v4h10z',
  wordmarkTransform: 'translate(40 25) scale(.26) translate(-1.8 0)',

  wordmark: 'M3.6 0L1.8-2.7L22.3-69L44.3-69L64.8-2.7L63 0L51 0L46.8-14L19.8-14L15.6 0L3.6 0ZM32.5-56L23.7-27L42.9-27L34.1-56L32.5-56ZM72.4-19.2L72.4-19.2L72.4-74L86.2-74L86.2-17.8Q86.2-11.6 92.6-10.9L92.6-10.9L92.6 1Q72.4 1 72.4-19.2ZM102.0-16.2L102.0-16.2L102.0-36.6Q102.0-52.8 118.2-52.8L118.2-52.8L133.6-52.8L133.6-74L147.4-74L147.4 0L118.2 0Q102.0 0 102.0-16.2ZM115.8-37.6L115.8-15.2Q115.8-12 119.0-12L119.0-12L133.6-12L133.6-40.8L119.0-40.8Q115.8-40.8 115.8-37.6L115.8-37.6ZM201.8 0L174.2 0Q158.0 0 158.0-15.9Q158.0-31.8 174.2-31.8L174.2-31.8L188.0-31.8L188.0-37.6Q188.0-40.8 184.8-40.8L184.8-40.8L163.6-40.8L163.6-48.3L169.6-52.8L185.6-52.8Q201.8-52.8 201.8-36.6L201.8-36.6L201.8 0ZM171.8-18L171.8-15.2Q171.8-12 175.0-12L175.0-12L188.0-12L188.0-21.2L175.0-21.2Q171.8-21.2 171.8-18L171.8-18ZM228.2 0L214.4 0L214.4-46Q218.1-52.8 228.6-52.8L228.6-52.8L239.4-52.8L245.4-48.3L245.4-40.8L232.3-40.8Q229.3-40.8 228.2-39.3L228.2-39.3L228.2 0ZM253.4-16.2L253.4-16.2L253.4-36.6Q253.4-52.8 269.6-52.8L269.6-52.8L283.6-52.8Q299.8-52.8 299.8-36.6L299.8-36.6L299.8-16.2Q299.8 0 283.6 0L283.6 0L269.6 0Q253.4 0 253.4-16.2ZM267.2-37.6L267.2-15.2Q267.2-12 270.4-12L270.4-12L282.8-12Q286-12 286-15.2L286-15.2L286-37.6Q286-40.8 282.8-40.8L282.8-40.8L270.4-40.8Q267.2-40.8 267.2-37.6L267.2-37.6ZM326.2 0L312.4 0L312.4-52.8L341.6-52.8Q357.8-52.8 357.8-36.6L357.8-36.6L357.8 0L344.0 0L344.0-37.6Q344.0-40.8 340.8-40.8L340.8-40.8L326.2-40.8L326.2 0Z',
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
