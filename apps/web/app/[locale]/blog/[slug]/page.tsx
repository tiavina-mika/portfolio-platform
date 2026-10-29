import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';
import { titleCase } from 'string-ts';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { defaultLocale, locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import {
  getArticle,
  getArticleSlugsForLocale,
  getRelatedArticles,
} from '@/server/queries/article.queries';
import { IError } from '@/types/app.type';
import { IArticle } from '@/types/article.type';
import { OgCard, OgCardLayoutEnum } from '@/types/og.type';
import { getAbsoluteUrl, getAlternates } from '@/utils/app.utils';
import { getArticleImageUrl } from '@/utils/cms.utils';
import { GENERATE_STATIC_PARAMS_FALLBACK_SLUG } from '@/utils/constants';
import { getArticleJsonLd } from '@/utils/jsonLd.utils';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { generateOGImageUrl, getSocialImages } from '@/utils/og.utils';
import { getTranslatedField } from '@/utils/translation.utils';


import ArticlePage from './ArticlePage';

const getCachedArticle = cache(
  async (slug: string, locale: Locale): Promise<IArticle | null> => {
    const article = await getArticle(slug, locale);

    // no article or an error
    if (!article || (article as IError)?.error) return null;

    return article as IArticle;
  }
);

/**
 * the share card of an article: its first category in the chip (the blog when it has none) and
 * its title as the page heading shows it — not the meta title, which is written for search engines
 */
const getArticleOgCard = async (article: IArticle, locale: Locale): Promise<OgCard> => {
  const t = await getTranslations({ locale, namespace: 'OpenGraph' });
  const category = article.categories?.[0];

  return {
    layout: OgCardLayoutEnum.LEFT,
    chip: (category && getTranslatedField(category.translated, locale, 'name')) || t('blog.chip'),
    title: getTranslatedField(article.translated, locale, 'title'),
  };
};

/**
 * prerenders every published article at build time, per locale — combined with the layout's
 * own `generateStaticParams` for `[locale]`, Next.js runs this once per locale and pairs the
 * resulting slugs with it. Slugs missing at build time still render on demand (dynamicParams
 * defaults to true).
 */
export const generateStaticParams = async ({ params }: { params: { locale: string } }) => {
  const locale = params.locale as Locale;
  const slugs = await getArticleSlugsForLocale(locale);

  // `cacheComponents` requires at least one result — see GENERATE_STATIC_PARAMS_FALLBACK_SLUG
  if (slugs.length === 0) return [{ slug: GENERATE_STATIC_PARAMS_FALLBACK_SLUG }];

  return slugs.map((slug) => ({ slug }));
};

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const slug = params.slug;
  const locale = params.locale as Locale;
  const article = await getCachedArticle(slug, locale);

  // it may return an error instead of a parse object, so we need to check if it has an id
  if (!article) return {};

  const translated = article?.translated;

  const title =
    getTranslatedField(translated, locale, 'metaTitle') ||
    getTranslatedField(translated, locale, 'title');
  const description =
    getTranslatedField(translated, locale, 'metaDescription') ||
    getTranslatedField(translated, locale, 'description');
  const tags = getTranslatedField(translated, locale, 'tags') || '';

  /*
   * build the equivalent article URL for every locale, from each locale's own translated slug —
   * derived from route params instead of `headers()`, so this route can be statically prerendered
   */
  const articlesPath = retrievePathnameFromDynamicPathname(ROUTES.articles.preview().pathname);
  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [
      loc,
      getAbsoluteUrl(`/${loc}${articlesPath}${getTranslatedField(translated, loc, 'slug')}`),
    ])
  );
  const url = urlsByLocale[locale];

  const { openGraphImages, twitter } = getSocialImages(
    await getArticleOgCard(article, locale),
    titleCase(title),
    description
  );

  return {
    title: titleCase(title),
    description,
    keywords: tags ? tags.split(',').map((tag: string) => tag.trim()) : undefined,
    alternates: getAlternates(urlsByLocale, locale),
    openGraph: {
      title: titleCase(title),
      description,
      type: 'article',
      url,
      locale: locale || defaultLocale,
      images: openGraphImages,
    },
    twitter,
  };
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const ArticleApp = async (props: Props) => {
  const params = await props.params;

  const slug = params.slug;
  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const tNavBar = await getTranslations('NavBar');

  const article = await getCachedArticle(slug, locale);

  // it may return an error instead of a parse object, so we need to check if it has an id
  if (!article) {
    notFound();
  }

  // derived from route params instead of `headers()`, so this route can be statically prerendered
  const articlesPath = retrievePathnameFromDynamicPathname(ROUTES.articles.preview().pathname);
  const currentPathname = getAbsoluteUrl(`/${locale}${articlesPath}${slug}`);

  const relatedArticlesResponse = await getRelatedArticles(article);
  const relatedArticles = (relatedArticlesResponse as IError)?.error
    ? []
    : (relatedArticlesResponse as IArticle[]);

  const title = getTranslatedField(article.translated, locale, 'title');
  const ogImage = generateOGImageUrl(await getArticleOgCard(article, locale));

  const breadcrumbs: BreadcrumbsSegment[] = [
    { name: tNavBar('blog'), link: ROUTES.articles.root },
    { name: title, link: ROUTES.articles.preview(slug) },
  ];

  return (
    <>
      <JsonLd
        data={getArticleJsonLd({
          article,
          locale,
          url: currentPathname,
          image: getArticleImageUrl(article) || ogImage,
        })}
      />
      <ArticlePage
        article={article}
        breadcrumbs={breadcrumbs}
        currentPathname={currentPathname}
        locale={locale}
        relatedArticles={relatedArticles}
      />
    </>
  );
};

export default ArticleApp;
