import i18n, { locales } from '@/config/i18n';
import { ISelectOption } from '@/types/app.type';
import { IStoredData, Locale } from '@/types/setting.type';

import { DEFAULT_LOCALE, PERSISTED_STATE_KEY } from './constants';
import { getLocalStorage, parseDeepJSON, setLocalStorage } from './utils';

/**
 * get stored data from local storage and parse it (from json to js object)
 * @param key key to retrieve the value
 * @returns
 */
export const getStoredData = (key = PERSISTED_STATE_KEY): IStoredData | undefined => {
  const persistedLocale = getLocalStorage(key);

  if (!persistedLocale) return;
  const storedData = parseDeepJSON(persistedLocale) as IStoredData;

  return storedData;
};

/**
 * get the app language stored to the local storage
 * @returns
 */
export const getStoredLocale = (): Locale | undefined => {
  const storedData = getStoredData();
  const locale = storedData?.settings.locale;

  return locale;
};

/**
 * store the app language to the local storage
 * @param locale
 */
export const setStoredLocale = (locale: Locale): void => {
  const persistedLocale = getStoredData();
  const newData = {
    ...persistedLocale,
    settings: {
      ...persistedLocale?.settings,
      locale,
    },
  };

  setLocalStorage(PERSISTED_STATE_KEY, newData);
};

export const renderLocaleLabel = (locale: Locale): string => {
  switch (locale) {
    case 'mg':
      return i18n.t('lang.malagasy');
    case 'en':
      return i18n.t('lang.english');
    default:
      return i18n.t('lang.french');
  }
};

export const localeOptions = locales.map(
  (locale: string): ISelectOption => ({
    label: renderLocaleLabel(locale as Locale),
    value: locale,
  })
);

/**
 * get translated field value from database
 * ex: { translated: { fr: { title: 'xxx' }, en: { title: '' } } }
 * => { fr: { title: 'xxx' }}
 * @param entity
 * @param locale
 * @param field
 * @param withInfo
 * @returns
 */
export const getDefaultTranslatedField = (
  object: Record<string, any>,
  locale: string,
  field: string,
  withInfo = true
): string => {
  const {
    translated,
  } = object;

  if (translated[locale]?.[field]) {
    return translated[locale][field];
  }

  const defaultFieldValue = translated[DEFAULT_LOCALE][field];

  if (withInfo) {
    return `${defaultFieldValue} (${i18n.t('common:errors.notTranslated')})`;
  }

  return defaultFieldValue;
};

export const getTranslatedField = <T extends Record<string, any>>(
  translated: T,
  locale: string,
  field: string
): string => {
  const value = translated[locale]?.[field];

  if (!value) {
    const defaultFieldValue = translated[DEFAULT_LOCALE][field];

    return `${defaultFieldValue} (${i18n.t('common:errors.notTranslated')})`;
  }

  return translated[locale]?.[field];
};

/**
 * input: { "en": { "title": "" }, "fr": { "title": "Bjr 01" }}
 * output: { "title": "Bjr 01" }
 * @param translated
 * @param keys fields to translate
 * @param locale
 * @returns
 */
export const getTranslatedFields = <T extends Record<string, any>>(
  translated: T,
  keys: string[],
  locale: Locale
): any => {
  if (!translated) return {};

  const translatedFields = keys.reduce((acc, key) => {
    const value = getTranslatedField<T>(translated, locale, key);

    return { ...acc, [key]: value };
  }, {});

  return translatedFields;
};
