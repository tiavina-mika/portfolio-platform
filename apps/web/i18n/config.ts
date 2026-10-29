// used for storybook
const getLocalLabel = (locale: string) => {
  switch (locale) {
    case 'fr':
      return 'Français';
    case 'en':
      return 'English';
    default:
      return locale;
  }
};

// Can be imported from a shared config
export const locales = ['fr', 'en'] as const;
export const defaultLocale = locales[0];
export const localePrefix = 'always'; // Default
export type Locale = (typeof locales)[number];

export const storybookLocalesOptions = locales.map(locale => ({
  value: locale,
  title: getLocalLabel(locale),
}));
