/**
 * The language the back-office starts in: the one the admin picked in the settings (the persisted
 * redux `settings.locale`), else the first of the browser's languages the app is translated into,
 * else the default one.
 *
 * Self-contained on purpose — no import, no helper outside its body, every input passed in: the
 * build also serializes it into an inline script of `index.html`, which runs before any bundle
 * and starts downloading that language's translations alongside the app code. Both places then
 * agree on the language by construction.
 */
export const detectLocale = (
  persistedStateKey: string,
  supportedLocales: readonly string[],
  defaultLocale: string
): string => {
  try {
    const persistedState = localStorage.getItem(persistedStateKey);

    if (persistedState) {
      // redux-persist stores each slice as its own JSON string inside the root JSON object
      const settingsJson = JSON.parse(persistedState).settings;
      const persistedLocale = settingsJson ? JSON.parse(settingsJson).locale : undefined;

      if (supportedLocales.includes(persistedLocale)) return persistedLocale;
    }
  }
  // unreadable storage (private mode, corrupted value): fall through to the browser languages
  catch { /* empty */ }

  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    // 'fr-FR' → 'fr': the translations are per language, not per region
    const language = String(browserLanguage).split('-')[0];

    if (supportedLocales.includes(language)) return language;
  }

  return defaultLocale;
};
