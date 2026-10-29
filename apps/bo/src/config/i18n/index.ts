import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { resources, defaultNS, NS } from './resources';
import { DEFAULT_LOCALE } from '../../utils/constants';

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  // .use(LanguageDetector as any) // language detector cause an error, so we do it manually
  .use(LanguageDetector)
  .init({
    // debug: process.env.NODE_ENV === 'development',
    resources,
    // language to use if translations in user language are not available.
    fallbackLng: DEFAULT_LOCALE,
    ns: NS,
    defaultNS,
    // not needed for react as it escapes by default
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
      transSupportBasicHtmlNodes: false,
    },
  });

export const locales = Object.keys(resources);
export const readOnlyLocales = [...locales] as const;
export const getCurrentLocale = (): any => {
  return i18n.languages.find((locale: any) => locales.includes(locale));
};

export default i18n;
