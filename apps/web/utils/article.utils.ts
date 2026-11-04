import { ArticleCardData } from '@/containers/articles/ArticleCard';
import { Locale } from '@/i18n/config';
import { IArticle } from '@/types/article.type';

import { goToItemBySlug } from './app.utils';
import { getReadingTimeInMinutes } from './cms.utils';
import { formatShortDate } from './date.utils';
import { getTranslatedField } from './translation.utils';

/**
 * What an article card shows: cover, first category, publication date and reading time
 * @param article
 * @param locale
 * @param getReadingTimeLabel turns the reading time in minutes into its translated label
 */
export const getArticleCardData = (
  article: IArticle,
  locale: Locale,
  getReadingTimeLabel: (minutes: number) => string
): ArticleCardData => {
  const readingTime = getReadingTimeInMinutes(
    getTranslatedField(article.translated, locale, 'content')
  );
  const date = article.createdAt ? formatShortDate(article.createdAt, locale) : undefined;
  const category = article.categories?.[0];

  return {
    id: article.id,
    title: getTranslatedField(article.translated, locale, 'title'),
    href: goToItemBySlug(article.translated, locale, 'articles'),
    imageUrl: article.previewImage?.url ?? article.image?.url,
    category: category ? getTranslatedField(category.translated, locale, 'name') : undefined,
    description: getTranslatedField(article.translated, locale, 'description') || undefined,
    meta: [date, getReadingTimeLabel(readingTime)].filter(Boolean).join(' · '),
  };
};
