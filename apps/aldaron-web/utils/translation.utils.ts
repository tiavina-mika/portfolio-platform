import { getCookie } from 'cookies-next';

import type { AbstractIntlMessages } from 'next-intl';

import { defaultLocale, Locale } from '@/i18n/config';
import enAbout from '@/translations/en/about.json';
import enApp from '@/translations/en/app.json';
import enArticle from '@/translations/en/article.json';
import enCommon from '@/translations/en/common.json';
import enContact from '@/translations/en/contact.json';
import enForm from '@/translations/en/form.json';
import enHome from '@/translations/en/home.json';
import enLegal from '@/translations/en/legal.json';
import enPricing from '@/translations/en/pricing.json';
import enPrivacy from '@/translations/en/privacy.json';
import enProjects from '@/translations/en/projects.json';
import enSimulator from '@/translations/en/simulator.json';
import enZod from '@/translations/en/zod.json';
import frAbout from '@/translations/fr/about.json';
import frApp from '@/translations/fr/app.json';
import frArticle from '@/translations/fr/article.json';
import frCommon from '@/translations/fr/common.json';
import frContact from '@/translations/fr/contact.json';
import frForm from '@/translations/fr/form.json';
import frHome from '@/translations/fr/home.json';
import frLegal from '@/translations/fr/legal.json';
import frPricing from '@/translations/fr/pricing.json';
import frPrivacy from '@/translations/fr/privacy.json';
import frProjects from '@/translations/fr/projects.json';
import frSimulator from '@/translations/fr/simulator.json';
import frZod from '@/translations/fr/zod.json';
import mgAbout from '@/translations/mg/about.json';
import mgApp from '@/translations/mg/app.json';
import mgArticle from '@/translations/mg/article.json';
import mgCommon from '@/translations/mg/common.json';
import mgContact from '@/translations/mg/contact.json';
import mgForm from '@/translations/mg/form.json';
import mgHome from '@/translations/mg/home.json';
import mgLegal from '@/translations/mg/legal.json';
import mgPricing from '@/translations/mg/pricing.json';
import mgPrivacy from '@/translations/mg/privacy.json';
import mgProjects from '@/translations/mg/projects.json';
import mgSimulator from '@/translations/mg/simulator.json';
import mgZod from '@/translations/mg/zod.json';

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
 * load all the translations from all messages files for the given locale. The messages hold lists of
 * strings (read with `t.raw`), which the `AbstractIntlMessages` type does not describe: the cast says
 * the JSON files are valid messages
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
        ...enHome,
        ...enZod,
        ...enPricing,
        ...enSimulator,
        ...enAbout,
        ...enProjects,
        ...enLegal,
        ...enPrivacy,
        ...enContact,
      } as unknown as AbstractIntlMessages;
    case 'mg':
      return {
        ...mgApp,
        ...mgArticle,
        ...mgCommon,
        ...mgForm,
        ...mgHome,
        ...mgZod,
        ...mgPricing,
        ...mgSimulator,
        ...mgAbout,
        ...mgProjects,
        ...mgLegal,
        ...mgPrivacy,
        ...mgContact,
      } as unknown as AbstractIntlMessages;

    // french is the default
    default:
      return {
        ...frApp,
        ...frArticle,
        ...frCommon,
        ...frForm,
        ...frHome,
        ...frZod,
        ...frPricing,
        ...frSimulator,
        ...frAbout,
        ...frProjects,
        ...frLegal,
        ...frPrivacy,
        ...frContact,
      } as unknown as AbstractIntlMessages;
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
