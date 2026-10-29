import { getTranslations } from 'next-intl/server';

import { Locale } from '@/i18n/config';
import { getArticles } from '@/server/queries/article.queries';
import { getArticleCardData } from '@/utils/article.utils';

import HomeArticlesSection from './HomeArticlesSection';

// one row of cards on a desktop screen
const HOME_ARTICLES_LIMIT = 3;

type Props = {
  locale: Locale;
};

/**
 * Loads the latest articles and renders them. A failed request throws, so the boundary around
 * shows the error (or offline) banner with a retry. Nothing is rendered when none is published.
 */
const HomeArticlesData = async ({ locale }: Props) => {
  const t = await getTranslations({ locale, namespace: 'Article' });
  const data = await getArticles({
    locale,
    limit: HOME_ARTICLES_LIMIT,
    skip: 0,
    orderedBy: 'createdAt',
  });

  if ('error' in data) throw new Error(data.error);
  if (!data.articles.length) return null;

  const articles = data.articles.map((article) => getArticleCardData(
    article,
    locale,
    (minutes) => t('readingTime', { minutes })
  ));

  return <HomeArticlesSection articles={articles} status="ready" />;
};

export default HomeArticlesData;
