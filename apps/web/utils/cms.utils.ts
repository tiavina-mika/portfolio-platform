import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';

import { createQueryString } from './next.utils';
import { getTranslatedField } from './translation.utils';

/**
 * article list url with category slug as search param
 * ex: /articles?category=marketing
 * @param category
 * @param locale
 * @returns
 */
export const goToArticlesByCategory = (
  translated: Record<string, string>,
  locale: Locale
) => {
  const translatedSlug = getTranslatedField(translated, locale, 'slug');

  return `${ROUTES.articles.root}?${createQueryString({ category: translatedSlug })}`;
};

/**
 * article list url with category slug as search param
 * ex: /articles?category=marketing
 * @param category
 * @param locale
 * @returns
 */
export const goToItemsByCategory = <T extends Record<string, any> = Record<string, any>>(
  translated: T,
  locale: Locale,
  pathname: string
) => {
  const translatedSlug = getTranslatedField<T>(translated, locale, 'slug');

  return `${(ROUTES as any)[pathname].root}?${createQueryString({ category: translatedSlug })}`;
};
