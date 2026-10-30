import { useTranslations } from 'next-intl';
import { capitalize } from 'string-ts';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import ArticleBody from '@/containers/articles/ArticleBody';
import ArticleHeader from '@/containers/articles/ArticleHeader';
import ArticleTags from '@/containers/articles/ArticleTags';
import ArticleViewTracker from '@/containers/articles/ArticleViewTracker';
import RelatedArticles from '@/containers/articles/RelatedArticles';
import Share from '@/containers/common/Share';
import Newsletter from '@/containers/newsletter/NewsLetter';
import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { IArticle } from '@/types/article.type';
import { getArticleCardData } from '@/utils/article.utils';
import { goToItemsByCategory, getReadingTimeInMinutes } from '@/utils/cms.utils';
import { collections } from '@/utils/constants';
import { formatShortDate } from '@/utils/date.utils';
import { createQueryString } from '@/utils/next.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { slugify } from '@/utils/utils';

type Props = {
  /**
   * article to display
   * @type IArticle
   */
  article: IArticle;
  /**
   * list of related articles
   * @type IArticle[]
   */
  relatedArticles: IArticle[];
  /**
   * project language
   * @example 'en'
   */
  locale: Locale;
  /**
   * absolute address of the article, put in the sharing links
   * @example 'https://example.com/en/blog/slug'
   */
  currentPathname: string;
  /**
   * breadcrumbs
   * @example [{ name: 'Blog', link: '/blog' }, { name: 'Article title', link: '/blog/slug' }]
   */
  breadcrumbs: BreadcrumbsSegment[];
};

/**
 * The page of one article: header (title, categories, dates, cover), text and images, tags, share
 * block and the related articles. Each part owns its full-width band, so the page only sets the order.
 */
const ArticlePage = ({
  article, relatedArticles, locale, currentPathname, breadcrumbs,
}: Props) => {
  const t = useTranslations('Article');
  const tDate = useTranslations('Date');

  const translated = article.translated;
  const readingTime = getReadingTimeInMinutes(getTranslatedField(translated, locale, 'content'));
  const hasBeenUpdated = !!article.updatedAt && article.updatedAt !== article.createdAt;

  const categories = (article.categories || []).map((category) => ({
    name: getTranslatedField(category.translated, locale, 'name'),
    href: goToItemsByCategory(category.translated, locale, 'articles'),
  }));

  const tags = (getTranslatedField(translated, locale, 'tags') || '')
    .split(',')
    .map((tag: string) => tag.trim())
    .filter(Boolean)
    .map((tag: string) => ({
      label: capitalize(tag),
      href: `${ROUTES.articles.root}?${createQueryString({ tag: slugify(tag) })}`,
    }));

  const title = getTranslatedField(translated, locale, 'title');

  return (
    <div className="flex flex-col self-stretch">
      {/* counts this visit — renders nothing */}
      <ArticleViewTracker id={article.id} />
      <ArticleHeader
        breadcrumbs={breadcrumbs}
        categories={categories}
        description={getTranslatedField(translated, locale, 'description')}
        imageUrl={article.image?.url}
        locale={locale}
        readingTime={t('readingTime', { minutes: readingTime })}
        title={title}
        publishedOn={tDate('published', {
          date: article.createdAt ? formatShortDate(article.createdAt, locale) : '',
        })}
        updatedOn={hasBeenUpdated
          ? tDate('updated', { date: formatShortDate(article.updatedAt!, locale) })
          : undefined}
      />
      <ArticleBody
        content={getTranslatedField(translated, locale, 'content')}
        images={article.images}
        title={title}
      />
      <ArticleTags tags={tags} />
      <Share
        collection={collections.Article}
        currentPathname={currentPathname}
        id={article.id}
        totalMediaShare={article.totalMediaShare}
      />
      <RelatedArticles
        articles={relatedArticles.map((related) => getArticleCardData(
          related,
          locale,
          (minutes) => t('readingTime', { minutes })
        ))}
      />
      <Newsletter locale={locale} />
    </div>
  );
};

export default ArticlePage;
