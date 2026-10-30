import { LANGUAGE_CODES } from '@shared/constants';

/**
 * The languages the FAQ is read in: every language of the platform, so the website and the app
 * cover the same set.
 */
export const FAQ_LOCALES = LANGUAGE_CODES;

/** Shown when the reader's language has no FAQ of its own — the platform's default language. */
export const DEFAULT_FAQ_LOCALE = 'fr';

/** Name of the URL search parameter holding the FAQ search, on the website and in the app alike. */
export const FAQ_SEARCH_PARAM = 'q';
