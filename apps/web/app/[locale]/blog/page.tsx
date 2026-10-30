import { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { capitalize } from 'string-ts';

import Articles from '@/containers/articles/Articles';
import ArticlesHeader from '@/containers/articles/ArticlesHeader';
import { locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getArticleCategories, getCategoryBySlug } from '@/server/queries/category.queries';
import { ISearchParams } from '@/types/app.type';
import { OgCardLayoutEnum } from '@/types/og.type';
import { getAlternates, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { APP_NAME } from '@/utils/constants';
import { getSocialMetadata } from '@/utils/og.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { paginationSearchParamsSchema } from '@/validations/app.validations';


import ArticlesPage from './ArticlesPage';

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
  const tOg = await getTranslations({ locale, namespace: 'OpenGraph' });

  const keywords = (await parent).keywords || [];

  // canonical always points to the unfiltered, page-1 listing — filters/pagination are not canonical
  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [loc, getTranslatedAbsoluteUrl(ROUTES.articles.root, { locale: loc })])
  );
  const title = t('articles.metaTitle');
  const description = t('articles.metaDescription');

  return {
    title,
    description,
    keywords: [...keywords, 'articles', 'blog', 'news'],
    alternates: getAlternates(urlsByLocale, locale),
    ...getSocialMetadata({
      card: {
        layout: OgCardLayoutEnum.CENTERED,
        chip: tOg('blog.chip'),
        title: tOg('blog.title', { appName: APP_NAME }),
        subtitle: tOg('blog.subtitle'),
      },
      title,
      description,
      url: urlsByLocale[locale],
      locale,
    }),
  };
};

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<ISearchParams>;
};

const ArticlesContent = async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const parsedSearchParams = paginationSearchParamsSchema.parse(searchParams);
  const page = parseInt(parsedSearchParams.page, 10) || 1;
  const { order, tag, category } = parsedSearchParams;

  const [categories, categoryObj] = await Promise.all([
    getArticleCategories(),
    category ? getCategoryBySlug(category, locale) : undefined,
  ]);

  const categoryName = categoryObj
    ? getTranslatedField(categoryObj.translated, locale, 'name')
    : category;

  /*
   * the filters and the sort that the links of the page (pagination included) keep; the default sort
   * adds nothing, so the plain address of the blog stays the canonical one
   */
  const linkSearchParams: Record<string, string> = {
    ...(category ? { category } : {}),
    ...(tag ? { tag } : {}),
    ...(order === 'asc' ? { order } : {}),
  };

  return (
    <ArticlesPage
      articles={(
        <Articles
          category={category}
          locale={locale}
          order={order}
          page={page}
          searchParams={linkSearchParams}
          tag={tag}
        />
      )}
      header={(
        <ArticlesHeader
          category={category}
          categoryName={categoryName ? capitalize(categoryName) : undefined}
          locale={locale}
          sort={order === 'asc' ? 'oldest' : 'newest'}
          tag={tag}
          categories={categories.map((item) => ({
            slug: getTranslatedField(item.translated, locale, 'slug'),
            name: getTranslatedField(item.translated, locale, 'name'),
          }))}
        />
      )}
    />
  );
};

/**
 * this route reads `searchParams` (pagination/filters), which — unlike `params` — is never
 * covered by `generateStaticParams` and so is always request-time data — wrapped in its own
 * `<Suspense>` boundary so `cacheComponents` can still validate/prerender the static shell
 * (nav/footer) around it
 */
const ArticlesApp = (props: Props) => (
  <Suspense fallback={null}>
    <ArticlesContent {...props} />
  </Suspense>
);

export default ArticlesApp;
