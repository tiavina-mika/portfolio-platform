import { getTranslations } from 'next-intl/server';

import Section from '@/components/layouts/Section';
import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';
import Articles from '@/containers/articles/Articles';
import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getArticles } from '@/server/queries/article.queries';

type Props = {
  locale: Locale;
};

const NonPaginatedArticles = async ({ locale }: Props) => {
  const t = await getTranslations('Article');
  // preload the data from server
  const data = await getArticles({
    locale,
    limit: 3,
    skip: 0,
    orderedBy: 'createdAt',
  });

  if (!data) return null;
  if ((data as any).articles.length === 0) return null;

  return (
    <Section className={`
      mt-8 flex flex-col gap-6
      lg:mt-24
    `}
    >
      <div className="mt-6 flex justify-between">
        <Title level={3}>{t('articles')}</Title>
        <TextLink href={(ROUTES.articles as any).root}>{t('viewAll')}</TextLink>
      </div>

      <Articles articles={(data as any)?.articles} locale={locale} />
    </Section>
  );
};

export default NonPaginatedArticles;
