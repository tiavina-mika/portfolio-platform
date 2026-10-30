import type enResources from './locales/en';

export type LocaleResources = typeof enResources;

/*
 * one lazy loader per language folder: a language is downloaded only when it is the one displayed,
 * instead of every language shipping in the entry bundle. Adding a folder under `locales/` is all
 * it takes to add a language
 */
const LOCALE_LOADERS = import.meta.glob<{ default: LocaleResources }>('./locales/*/index.ts');

const getLocaleFromLoaderPath = (path: string): string => path.split('/')[2];

export const LOCALES = Object.keys(LOCALE_LOADERS).map(getLocaleFromLoaderPath);

/*
 * written out rather than read off a loaded language, so nothing has to be downloaded to know
 * them — the record type makes the compiler reject a namespace missing from this list
 */
const NAMESPACES: Record<keyof LocaleResources, true> = {
  cms: true,
  common: true,
  dashboard: true,
  finance: true,
  route: true,
  statistics: true,
  user: true,
  zod: true,
  project: true,
};

export const NS = Object.keys(NAMESPACES);
export const defaultNS = 'common';

// one download per language, however many namespaces i18next asks for
const loadedLocales = new Map<string, Promise<LocaleResources>>();

const importLocaleResources = async (locale: string): Promise<LocaleResources> => {
  const loader = LOCALE_LOADERS[`./locales/${locale}/index.ts`];

  if (!loader) throw new Error(`No translations for locale "${locale}"`);

  try {
    const { default: resources } = await loader();

    return resources;
  }
  catch (error) {
    // a failed download (network blip) must not stay cached, or switching to it again never retries
    loadedLocales.delete(locale);
    throw error;
  }
};

export const loadLocaleResources = (locale: string): Promise<LocaleResources> => {
  let resources = loadedLocales.get(locale);

  if (!resources) {
    resources = importLocaleResources(locale);
    loadedLocales.set(locale, resources);
  }

  return resources;
};
