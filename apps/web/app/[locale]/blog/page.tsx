import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { capitalize } from 'string-ts';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import Section from '@/components/layouts/Section';
import Pagination from '@/components/Pagination';
import Sort from '@/components/Sort';
import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import { siteConfig } from '@/config/site';
import Articles from '@/containers/articles/Articles';
import { defaultLocale, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getArticles } from '@/server/queries/article.queries';
import { ISearchParams, ISelectOption } from '@/types/app.type';
import { getPaginatedQuery, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { PAGINATION } from '@/utils/constants';
import { paginationSearchParamsSchema } from '@/validations/app.validations';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type MetaDataProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async (
  props: MetaDataProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;
  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });

  const image = `${siteConfig.url}/images/metadata/og-image-articles.${locale || defaultLocale}.jpg`;

  const og = (await parent).openGraph;
  const keywords = (await parent).keywords || [];

  return {
    title: t('articles.metaTitle'),
    description: t('articles.metaDescription'),
    keywords: [...keywords, 'articles', 'blog', 'news'],
    openGraph: {
      ...og,
      title: t('articles.metaTitle'),
      description: t('articles.metaDescription'),
      url: getTranslatedAbsoluteUrl(ROUTES.articles.root, { locale }),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: t('articles.metaTitle'),
        },
      ],
    },
  };
};

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<ISearchParams>;
};

const ArticlesPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const t = await getTranslations('Common');
  const tArticle = await getTranslations('Article');
  const { perPage } = PAGINATION;

  const parsedSearchParams = paginationSearchParamsSchema.parse(searchParams);
  const page = parseInt(parsedSearchParams.page, 10) || 1;
  const orderedBy = parsedSearchParams.orderedBy || 'updatedAt';
  const order = parsedSearchParams.order || 'asc';
  const { tag } = parsedSearchParams;
  const { category } = parsedSearchParams;

  const articleBreadcrumbs = [
    {
      title: tArticle('articles'),
      href: (ROUTES.articles as any).root,
    },
  ];

  const options: ISelectOption[] = [
    {
      label: t('newest'),
      value: 'updatedAt',
    },
    {
      label: tArticle('title'),
      value: 'title',
    },
  ];

  // preload the data from server
  const data = await getArticles({
    orderedBy,
    order,
    locale,
    tag,
    category,
    ...getPaginatedQuery(perPage, page),
  });

  if ((data as any).error) {
    notFound();
  }

  return (
    <Section className="flex flex-col" rootClassName="mb-8 md:mb-10 lg:md-12">
      {/* header */}
      <div className={`
        mb-4 flex flex-col justify-between
        sm:flex-row sm:items-center
        md:mb-0
        lg:mb-8
      `}
      >
        {category ? (
          //
          <div className={`
            mb-4 flex flex-col gap-1
            md:mt-4 md:mb-8
            lg:mt-8 lg:mb-4
          `}
          >
            <div>
              <Text className="font-medium">{tArticle('category')}</Text>
            </div>
            <div>
              <Title level={2}>{capitalize(category)}</Title>
            </div>
          </div>
        ) : (
          <Breadcrumbs className="self-stretch" segments={articleBreadcrumbs} />
        )}

        <Sort options={options} searchParams={parsedSearchParams} />
      </div>
      {(data as any).articles.length > 0 ? (
        <Articles articles={(data as any).articles} locale={locale} />
      ) : (
        <Text>{tArticle('noArticlesYet')}</Text>
      )}
      {/* pagination */}
      <Pagination
        className="mt-4"
        page={page}
        perPage={perPage}
        searchParams={parsedSearchParams}
        total={(data as any).count}
      />
    </Section>
  );
};

export default ArticlesPage;
