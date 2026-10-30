import { DEFAULT_COUNTRY, PERSISTED_STATE_KEY } from '@shared/constants';
import i18n, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { detectLocale } from './locale-detection';
import {
  defaultNS, loadLocaleResources, LOCALES, NS,
} from './resources';

/*
 * hands i18next the namespaces of a language downloaded on demand, so only the displayed language
 * is ever fetched — the others only when the admin switches to one of them
 */
const lazyLocaleBackend: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read: (language, namespace, callback) => {
    const read = async (): Promise<void> => {
      try {
        const resources = await loadLocaleResources(language);

        callback(null, resources[namespace as keyof typeof resources]);
      }
      catch (error) {
        callback(error as Error, false);
      }
    };

    void read();
  },
};

/*
 * Awaited at the top level on purpose: many modules translate labels the moment they load (list
 * tabs, filter options, and the route segments of PATH_NAMES, which are translated at startup).
 * Every module importing this one waits for the language to be in before running, so those labels
 * are never built from missing translations. The download itself does not wait for the app code:
 * an inline script of `index.html` starts it as the page opens (see the Vite config).
 */
// eslint-disable-next-line import/no-named-as-default-member
await i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(lazyLocaleBackend)
  .init({
    // the admin's persisted choice, else the browser's language — resolved once, before any render
    lng: detectLocale(PERSISTED_STATE_KEY, LOCALES, DEFAULT_COUNTRY.locale),
    supportedLngs: LOCALES,
    /*
     * no fallback language: every language carries every key (the build checks it), and a fallback
     * would be downloaded next to the displayed one for every admin who does not read it
     */
    fallbackLng: false,
    ns: NS,
    defaultNS,
    // not needed for react as it escapes by default
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
      transSupportBasicHtmlNodes: false,
    },
  });

export const locales = LOCALES;
export const readOnlyLocales = [...locales] as const;
export const getCurrentLocale = (): any => i18n.resolvedLanguage ?? DEFAULT_COUNTRY.locale;

export default i18n;
