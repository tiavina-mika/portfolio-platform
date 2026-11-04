import { COUNTRIES, DEFAULT_COUNTRY_CODE, type CountryCode } from '@shared/constants';

import enMG from './content/MG/en.json';
import frMG from './content/MG/fr.json';
import mgMG from './content/MG/mg.json';
import { DEFAULT_FAQ_LOCALE } from './faq.constants';

import type { FaqContent, FaqLocale, FaqTheme } from './faq.type';

/** One country's FAQ: a JSON file per language, in `content/<COUNTRY>/<locale>.json`. */
type FaqCountryContent = {
  fr: FaqContent;
  en: FaqContent;
  /** Malagasy is translated question by question: it holds only what is translated so far */
  mg: FaqContent;
};

/*
 * Kept apart from the search helpers: a website component that only searches must not pull every
 * language's content into the browser bundle along with them.
 *
 * Each country writes its own FAQ — the commission, the payment services and the support lines
 * differ — and a country that has none yet reads the default country's.
 */
const FAQ_BY_COUNTRY: Partial<Record<CountryCode, FaqCountryContent>> = {
  MG: { fr: frMG, en: enMG, mg: mgMG },
};

const getCountryFaq = (countryCode?: string | null): FaqCountryContent => {
  const code = countryCode?.toUpperCase();
  const country = code && code in COUNTRIES ? FAQ_BY_COUNTRY[code as CountryCode] : undefined;

  return country ?? FAQ_BY_COUNTRY[DEFAULT_COUNTRY_CODE] as FaqCountryContent;
};

/*
 * The Malagasy FAQ still waits for a native speaker's review: the country's `mg.json` holds only what
 * is translated so far, and the French text fills the rest.
 */
const getMalagasyThemes = ({ fr, mg }: FaqCountryContent): FaqTheme[] => {
  const mgThemesById = new Map(mg.themes.map((theme) => [theme.id, theme]));

  return fr.themes.map((frTheme) => {
    const mgTheme = mgThemesById.get(frTheme.id);
    const mgItemsById = new Map((mgTheme?.items ?? []).map((item) => [item.id, item]));

    return {
      id: frTheme.id,
      title: mgTheme?.title ?? frTheme.title,
      items: frTheme.items.map((item) => mgItemsById.get(item.id) ?? item),
    };
  });
};

const isMalagasyFullyTranslated = ({ fr, mg }: FaqCountryContent): boolean => {
  const mgThemesById = new Map(mg.themes.map((theme) => [theme.id, theme]));

  return fr.themes.every((theme) => (mgThemesById.get(theme.id)?.items.length ?? 0) === theme.items.length);
};

/**
 * The language the FAQ is entirely written in for a reader: their own, or the default one when
 * theirs has no complete FAQ yet — so the page can tell them some answers are not in their language.
 * @param countryCode the reader's country; the default country's FAQ when it has none of its own
 */
export const getFaqContentLocale = (locale: string, countryCode?: string | null): FaqLocale => {
  if (locale === 'en') return 'en';
  if (locale === 'mg' && isMalagasyFullyTranslated(getCountryFaq(countryCode))) return 'mg';

  return DEFAULT_FAQ_LOCALE;
};

/**
 * The FAQ themes of a country in the reader's language; what is not translated yet is read in the
 * default one.
 * @param countryCode the reader's country; the default country's FAQ when it has none of its own
 */
export const getFaqThemes = (locale: string, countryCode?: string | null): FaqTheme[] => {
  const faq = getCountryFaq(countryCode);

  if (locale === 'mg') return getMalagasyThemes(faq);

  return faq[locale === 'en' ? 'en' : DEFAULT_FAQ_LOCALE].themes;
};
