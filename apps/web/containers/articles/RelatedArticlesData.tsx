import { getTranslations } from 'next-intl/server';

import { Locale } from '@/i18n/config';
import { getRelatedArticles } from '@/server/queries/article.queries';
import { IError } from '@/types/app.type';
import { IArticle } from '@/types/article.type';
import { getArticleCardData } from '@/utils/article.utils';

import RelatedArticles from './RelatedArticles';

type Props = {
  /**
   * the article the suggestions are for
   */
  article: IArticle;
  locale: Locale;
};

/**
 * Fetches the articles sharing a category with `article` and renders them. The query is cached for
 * minutes only, which `cacheComponents` treats as request-time data: this component must be rendered
 * behind a `<Suspense>` so it does not block the prerender of the article page.
 */
const RelatedArticlesData = async ({ article, locale }: Props) => {
  const t = await getTranslations({ locale, namespace: 'Article' });
  const response = await getRelatedArticles(article);

  // a failed query only hides the suggestions, the article itself is still readable
  const related = (response as IError)?.error ? [] : (response as IArticle[]);

  return (
    <RelatedArticles
      articles={related.map((item) => getArticleCardData(
        item,
        locale,
        (minutes) => t('readingTime', { minutes })
      ))}
    />
  );
};

export default RelatedArticlesData;
