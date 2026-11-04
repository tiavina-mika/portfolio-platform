export type Language = {
  /** the code the app, the stored rows and the translation folders use */
  code: string;
  /** the key its name has in the `lang` translations of the apps (`lang.french`) */
  key: string;
  /** the language written in itself, as a member picking it recognises it */
  nativeName: string;
  /**
   * The locale of dayjs that writes its dates. A language dayjs does not ship borrows another one:
   * Malagasy reads its month and day names from the strings the apps register on top of `de`.
   */
  dayjsLocale: string;
};

/**
 * The codes of every language the platform is translated in, French first: the default one. A tuple,
 * so a validator can take it as an enum. A country offers a subset of it (`Country.languages`).
 */
export const LANGUAGE_CODES = ['fr', 'en', 'mg'] as const;

export type LanguageCode = typeof LANGUAGE_CODES[number];

/**
 * Every language the platform is translated in. Adding one starts with its code above and its entry
 * here, then its translation files; the language types, the pickers and the locale loaders all read
 * these two.
 */
export const LANGUAGES: Record<LanguageCode, Language> = {
  fr: { code: 'fr', key: 'french', nativeName: 'Français', dayjsLocale: 'fr' },
  mg: { code: 'mg', key: 'malagasy', nativeName: 'Malagasy', dayjsLocale: 'de' },
  en: { code: 'en', key: 'english', nativeName: 'English', dayjsLocale: 'en' },
};
