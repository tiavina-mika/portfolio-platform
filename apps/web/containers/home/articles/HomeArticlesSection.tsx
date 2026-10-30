import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';
import { ArticleCardData } from '@/containers/articles/ArticleCard';
import ArticleCards, { ArticleCardsStatus } from '@/containers/articles/ArticleCards';
import { ROUTES } from '@/i18n/routes';

type Props = {
  /**
   * `ready` shows the cards (or the empty notice without any), `loading` skeleton cards, `error` a
   * banner with a retry button, `offline` a notice (the articles come back on reconnection)
   */
  status: ArticleCardsStatus;
  /**
   * The latest articles, up to three: fewer simply leave the end of the row empty
   */
  articles?: ArticleCardData[];
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
 * The latest articles of the blog on the home page: a title with a link to the blog, then the cards,
 * or the state that takes their place. The header stays in every state.
 */
const HomeArticlesSection = ({
  status, articles = [], onRetry, animated = true,
}: Props) => {
  const t = useTranslations('Article');
  const tCommon = useTranslations('Common');

  return (
    <Section
      aria-labelledby="home-articles-title"
      as="section"
      className="flex-col gap-6"
      rootClassName={`
        pt-8
        lg:pt-24
      `}
    >
      <div className="flex items-center justify-between gap-4 pt-6">
        <Title id="home-articles-title" level={3}>{t('articles')}</Title>
        <TextLink href={ROUTES.articles.root}>{t('viewAll')}</TextLink>
      </div>
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
    </Section>
  );
};

export default HomeArticlesSection;
