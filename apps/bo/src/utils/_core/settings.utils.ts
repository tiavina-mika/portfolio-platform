import type { TargetEnum } from '@shared/types';

import i18n, { locales } from '@/config/i18n';
import { DEFAULT_LOCALE, PERSISTED_STATE_KEY } from '@/constants/_core/app.constants';
import { WORKSPACES } from '@/constants/_core/workspace.constants';
import { ISelectOption } from '@/types/_core/app.type';
import {
  IStoredData, Locale, SettingsSection, SettingsSectionEnum,
} from '@/types/_core/setting.type';
import { getLocalStorage, parseDeepJSON, setLocalStorage } from '@/utils/_core/utils';

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

/*
 * the default locale leads: it is the one every other translation is written against, so it is the
 * tab the editor starts on and the option a select falls back to. The order the locale files happen
 * to be declared in is alphabetical, not meaningful, so it must not decide what comes first.
 */
const orderedLocales = [
  ...locales.filter((locale: string) => locale === DEFAULT_LOCALE),
  ...locales.filter((locale: string) => locale !== DEFAULT_LOCALE),
];

export const localeOptions = orderedLocales.map(
  (locale: string): ISelectOption => ({
    label: renderLocaleLabel(locale as Locale),
    value: locale,
  })
);

/**
 * Whether the settings page offers a section: the workspace hides the sections that only edit another
 * workspace's website, and the workspace choice itself is shown only to somebody who has one to make.
 * @param section the section asked for
 * @param workspace the workspace the person works in
 * @param canSwitch whether their roles open more than one workspace
 */
export const isSettingsSectionVisible = (
  section: SettingsSection,
  workspace: TargetEnum,
  canSwitch: boolean
): boolean => {
  if (section === SettingsSectionEnum.WORKSPACE && !canSwitch) return false;

  return !WORKSPACES[workspace].hiddenSettingsSections.includes(section);
};

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

    if (!defaultFieldValue) return '';

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
