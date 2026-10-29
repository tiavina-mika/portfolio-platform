/**
 * i18next configuration
 * @see: https://github.com/tiavina-mika/i18next-nodejs-express
 */
import { t } from 'i18next';

import type { InitOptions } from 'i18next';

import type { Locale } from '@/types/app.type';

import commonEn from '../locales/en/common.json' with { type: 'json' };
import commonFr from '../locales/fr/common.json' with { type: 'json' };
import commonMg from '../locales/mg/common.json' with { type: 'json' };

export const resources = {
  en: { common: commonEn },
  fr: { common: commonFr },
  mg: { common: commonMg },
};

export const locales = Object.keys(resources);
export const DEFAULT_LANGUAGE: Locale = 'fr';
export const NS = Object.keys(resources.en);
export const defaultNS = 'common';

/**
 * i18next options
 * @see https://www.npmjs.com/package/i18next-http-middleware#detector-options
 * @param loadPath
 * @returns
 */
export const getI18nOptions = (loadPath: string): InitOptions => {
  return {
    fallbackLng: DEFAULT_LANGUAGE,
    resources,
    preload: locales,
    ns: NS,
    defaultNS,
    backend: {
      loadPath,
    },
    /*
     *       detection: {
     *         order: ["querystring", "cookie", "header"],
     *         lookupQuerystring: "lng",
     *         lookupCookie: "i18next",
     *         lookupHeader: "accept-language",
     *         caches: ["cookie"],
     *       },
     */
  };
};

/**
 *
 * translate by key
 * @param key
 * @param locale
 * @param options
 * @returns
 */
export const translate = (
  key: string,
  locale: Locale = DEFAULT_LANGUAGE,
  options?: Record<string, string>
): string => {
  return t(key, { lng: locale, ...options });
};
