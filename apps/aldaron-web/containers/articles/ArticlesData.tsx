import { getTranslations } from 'next-intl/server';

import { Locale } from '@/i18n/config';
import { getArticles } from '@/server/queries/article.queries';
import { getPaginatedQuery } from '@/utils/app.utils';
import { getArticleCardData } from '@/utils/article.utils';
import { PAGINATION } from '@/utils/constants';

import ArticlesSection from './ArticlesSection';

type Props = {
  locale: Locale;
  page: number;
  /**
   * `desc` lists the newest first
   */
  order: 'asc' | 'desc';
  category?: string;
  tag?: string;
  /**
   * Search params kept in the links of the pagination
   */
  searchParams: Record<string, string>;
};

/**
 * Loads one page of the blog and renders it. A failed request throws, so the boundary around shows
 * the error (or offline) banner with a retry.
 */
const ArticlesData = async ({
  locale, page, order, category, tag, searchParams,
}: Props) => {
  const t = await getTranslations({ locale, namespace: 'Article' });
  const { perPage } = PAGINATION;

  // the cards show the publication date, so the list is sorted on it
  const data = await getArticles({
    orderedBy: 'createdAt',
    order,
    locale,
    tag,
    category,
    ...getPaginatedQuery(perPage, page),
  });

  if ('error' in data) throw new Error(data.error);

  const articles = data.articles.map((article) => getArticleCardData(
    article,
    locale,
    (minutes) => t('readingTime', { minutes })
  ));

  return (
    <ArticlesSection
      articles={articles}
      pagination={{ page, perPage, total: data.count }}
      searchParams={searchParams}
      status="ready"
    />
  );
};

export default ArticlesData;
