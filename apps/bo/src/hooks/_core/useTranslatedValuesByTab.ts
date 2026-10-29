import { useState } from 'react';

import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { Locale } from '@/types/_core/setting.type';
import { getTranslatedFields } from '@/utils/_core/settings.utils';

type Output = {
  translatedFields: Record<string, any>;
  onTabChange: (value: Locale) => void;
  tab: Locale;
};

/**
 * this will return the translated values depending on the selected language (via tabs)
 * ex: { "en": { "title": "" }, "fr": { "title": "Bjr 01" }}
 * if fr is selected, it will return { "title": "Bjr 01" }
 * else it will return { "title": "Bjr 01 (not translated)" }
 * @param translated ex: { title: { translated: { fr: "Bjr 01", en: "" }}
 * @param keys
 * @returns
 */
export const useTranslatedValuesByTab = <T extends object>(translated?: T, keys: string[] = []): Output => {
  const [tab, setTab] = useState<Locale>(DEFAULT_LOCALE);

  const onTabChange = (value: Locale) => setTab(value);

  return {

    /*
     * need an empty object to avoid undefined error
     * because hooks should always called before any condition
     */
    translatedFields: translated
      ? getTranslatedFields(translated, keys, tab)
      : {},
    onTabChange,
    tab,
  };
};
