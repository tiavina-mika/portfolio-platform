import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import { locales } from './config';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  /*
   * Load all the translation files for the given locale
   * in the `translations` folder
   */
  const translationFiles = ['app', 'article', 'common', 'form', 'home', 'project', 'zod'];

  const messages = await Promise.all(
    translationFiles.map(
      file => import(`../translations/${locale}/${file}.json`)
    )
  ).then(modules =>
    modules.reduce((acc, module) => ({ ...acc, ...module.default }), {})
  );

  return {
    locale,
    messages,
  };
});
