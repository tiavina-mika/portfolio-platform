import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import Pagination, { PaginationProps } from '@/components/Pagination';

import { ArticleCardData } from './ArticleCard';
import ArticleCards, { ArticleCardsStatus } from './ArticleCards';

export type ArticlesStatus = ArticleCardsStatus;

type Props = {
  /**
   * `ready` shows the cards (or the empty notice without any), `loading` skeleton cards, `error` a
   * banner with a retry button, `offline` a notice (the articles come back on reconnection)
   */
  status: ArticlesStatus;
  articles?: ArticleCardData[];
  /**
   * Page, size of a page and total of the list: the pagination shows under the cards only
   */
  pagination?: Pick<PaginationProps, 'page' | 'perPage' | 'total'>;
  /**
   * Search params kept in the links of the pagination (the filters and the sort)
   */
  searchParams?: Record<string, string>;
  /**
   * Retry of the `error` banner
   */
  onRetry?: () => void;
  /**
   * `false` keeps the cards still: no cascade when they enter the screen, no zoom on hover
   * @default true
   */
  animated?: boolean;
};

/**
 * The list of the blog under its header: the article cards with their pagination, or the state that
 * takes their place (loading, error, offline, nothing published yet)
 */
const ArticlesSection = ({
  status, articles = [], pagination, searchParams, onRetry, animated = true,
}: Props) => {
  const t = useTranslations('Article');
  const tCommon = useTranslations('Common');

  return (
    <Section
      aria-label={t('articles')}
      as="section"
      className="flex-col gap-6"
      rootClassName="mb-8 md:mb-10"
    >
      <ArticleCards
        animated={animated}
        articles={articles}
        onRetry={onRetry}
        status={status}
        labels={{
          loading: t('loading'),
          error: t('loadError'),
          offline: t('offline'),
          empty: t('noArticlesYet'),
          retry: tCommon('tryAgain'),
        }}
      />
      {status === 'ready' && pagination && (
        <Pagination
          page={pagination.page}
          perPage={pagination.perPage}
          searchParams={searchParams}
          total={pagination.total}
        />
      )}
    </Section>
  );
};

export default ArticlesSection;
