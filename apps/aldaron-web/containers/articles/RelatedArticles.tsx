import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import Title from '@/components/typography/Title';

import { ArticleCardData } from './ArticleCard';
import ArticleCards from './ArticleCards';

type Props = {
  /**
   * `ready` shows the cards, `loading` skeleton cards under the title
   */
  status?: 'ready' | 'loading';
  articles?: ArticleCardData[];
  /**
   * `false` keeps the cards still: no cascade when they enter the screen, no zoom on hover
   * @default true
   */
  animated?: boolean;
};

/**
 * The "read also" section at the end of an article: other articles of the same categories as cards,
 * in the same grid as the blog. Nothing is rendered when there is none to suggest.
 */
const RelatedArticles = ({ status = 'ready', articles = [], animated = true }: Props) => {
  const t = useTranslations('Article');
  const tCommon = useTranslations('Common');

  if (status === 'ready' && articles.length === 0) return null;

  return (
    <Section
      aria-labelledby="related-articles-title"
      as="section"
      rootClassName="mt-8 md:mt-20"
      size="lg"
      className={`
        flex-col gap-5
        md:gap-10
      `}
    >
      <div>
        <Title id="related-articles-title" level={2}>{t('relatedArticles')}</Title>
        <div className={`
          divider mt-2
          md:mt-4
        `}
        />
      </div>
      <ArticleCards
        animated={animated}
        articles={articles}
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

export default RelatedArticles;
