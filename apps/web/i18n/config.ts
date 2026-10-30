import { LANGUAGES } from '@shared/constants';

// French first: the default one. The website is translated in a subset of the platform languages
export const locales = ['fr', 'en'] as const;
export const defaultLocale = locales[0];
export const localePrefix = 'always'; // Default
export type Locale = (typeof locales)[number];

export const storybookLocalesOptions = locales.map(locale => ({
  value: locale,
  title: LANGUAGES[locale].nativeName,
}));
