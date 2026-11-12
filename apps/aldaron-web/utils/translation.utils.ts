import { getCookie } from 'cookies-next';

import type { AbstractIntlMessages } from 'next-intl';

import { defaultLocale, Locale } from '@/i18n/config';
import enApp from '@/translations/en/app.json';
import enArticle from '@/translations/en/article.json';
import enCommon from '@/translations/en/common.json';
import enForm from '@/translations/en/form.json';
import enHome from '@/translations/en/home.json';
import enProject from '@/translations/en/project.json';
import enZod from '@/translations/en/zod.json';
import frApp from '@/translations/fr/app.json';
import frArticle from '@/translations/fr/article.json';
import frCommon from '@/translations/fr/common.json';
import frForm from '@/translations/fr/form.json';
import frHome from '@/translations/fr/home.json';
import frProject from '@/translations/fr/project.json';
import frZod from '@/translations/fr/zod.json';

import { COOKIES } from './constants';

/**
 * get current local from cookies, url or default config
 * @param defaultLocal
 * @returns
 */
export const getCurrentLocale = (defaultLocal?: Locale | string) => {
  const locale = defaultLocal || getCookie(COOKIES.locale) || defaultLocale;

  return locale;
};

/**
 * load all the translations from all messages files for the given locale
 * @param locale
 * @returns
 */
export const getTranslatedMessages = (locale: string): AbstractIntlMessages => {
  switch (locale) {
    case 'en':
      return {
        ...enApp,
        ...enArticle,
        ...enCommon,
        ...enForm,
        ...enZod,
        ...enHome,
        ...enProject,
      };

    // french is the default
    default:
      return {
        ...frApp,
        ...frArticle,
        ...frCommon,
        ...frForm,
        ...frZod,
        ...frHome,
        ...frProject,
      };
  }
};

/**
 * get translated field value
 * if value is not defined, get the default language translated value
 * @param translated
 * @param language
 * @param field
 * @returns
 */
export const getTranslatedField = <T extends Record<string, any>>(
  translated: T,
  language: string,
  field: string
): string => {
  const translatedValue = translated?.[language]?.[field];

  // get default field value if the field is not translated
  if (!translatedValue) {
    const defaultFieldValue = translated?.[defaultLocale][field];

    return defaultFieldValue;
  }

  return translatedValue;
};
