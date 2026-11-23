/**
 * i18next configuration
 * @see: https://github.com/tiavina-mika/i18next-nodejs-express
 */
import { t, type InitOptions } from "i18next";

import commonEn from './locales/en/_core/common.json' with { type: 'json' };
import commonFr from './locales/fr/_core/common.json' with { type: 'json' };
import commonMg from './locales/mg/_core/common.json' with { type: 'json' };
import clientEn from './locales/en/_domain/client.json' with { type: 'json' };
import clientFr from './locales/fr/_domain/client.json' with { type: 'json' };
import clientMg from './locales/mg/_domain/client.json' with { type: 'json' };
import missionEn from './locales/en/_domain/mission.json' with { type: 'json' };
import missionFr from './locales/fr/_domain/mission.json' with { type: 'json' };
import missionMg from './locales/mg/_domain/mission.json' with { type: 'json' };
import paymentEn from './locales/en/_domain/payment.json' with { type: 'json' };
import paymentFr from './locales/fr/_domain/payment.json' with { type: 'json' };
import paymentMg from './locales/mg/_domain/payment.json' with { type: 'json' };
import quoteEn from './locales/en/_domain/quote.json' with { type: 'json' };
import quoteFr from './locales/fr/_domain/quote.json' with { type: 'json' };
import quoteMg from './locales/mg/_domain/quote.json' with { type: 'json' };
import type { Locale } from "@/types/app.type";

// the domain's own messages sit under their own top-level key, so merging them never replaces a core one
export const resources = {
  en: { common: { ...commonEn, ...clientEn, ...quoteEn, ...missionEn, ...paymentEn } },
  fr: { common: { ...commonFr, ...clientFr, ...quoteFr, ...missionFr, ...paymentFr } },
  mg: { common: { ...commonMg, ...clientMg, ...quoteMg, ...missionMg, ...paymentMg } },
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
    //       detection: {
    //         order: ["querystring", "cookie", "header"],
    //         lookupQuerystring: "lng",
    //         lookupCookie: "i18next",
    //         lookupHeader: "accept-language",
    //         caches: ["cookie"],
    //       },
  };
}

/**
 * 
 * translate by key
 * @param key 
 * @param locale 
 * @param options 
 * @returns 
 */
export const translate = (key: string, locale: Locale = DEFAULT_LANGUAGE, options?: Record<string, string>): string => {
  return t(key, { lng: locale, ...options });
}