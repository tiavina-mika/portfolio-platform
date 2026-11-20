import { LANGUAGES } from '@shared/constants';

// French first: the default one. The website is translated in the three platform languages
export const locales = ['fr', 'en', 'mg'] as const;
export const defaultLocale = locales[0];
export const localePrefix = 'always'; // Default
export type Locale = (typeof locales)[number];

export const storybookLocalesOptions = locales.map(locale => ({
  value: locale,
  title: LANGUAGES[locale].nativeName,
}));
