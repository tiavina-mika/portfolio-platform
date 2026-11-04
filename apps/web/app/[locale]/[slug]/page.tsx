
import { CategoryEntityEnum } from '@shared/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { cache, Suspense } from 'react';
import { titleCase } from 'string-ts';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import CategoryPagesView from '@/containers/pages/CategoryPagesView';
import { defaultLocale, locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import {
  getCategoryBySlug, getRootPageCategorySlugsForLocale, getSubcategories,
} from '@/server/queries/category.queries';
import {
  getPage, getPagesByCategory, getPageSectionsByPageId, getPageSlugsForLocale,
} from '@/server/queries/page.queries';
import { ICategory, IPage } from '@/types/cms.type';
import { OgCardLayoutEnum } from '@/types/og.type';
import {
  getAbsoluteUrl, getAlternates, getPaginatedQuery,
} from '@/utils/app.utils';
import { getCategorySeoMetadata } from '@/utils/cms.utils';
import { GENERATE_STATIC_PARAMS_FALLBACK_SLUG, PAGINATION } from '@/utils/constants';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { getSocialImages } from '@/utils/og.utils';
import { getTranslatedField } from '@/utils/translation.utils';

import CmsPage from './CmsPage';

const getCachedPage = cache(async (slug: string, locale: Locale) => {
  const page = (await getPage(slug, locale)) as IPage | undefined;

  return page;
});

const getCachedPageSections = cache(async (pageId: string, locale: Locale) => {
  const result = await getPageSectionsByPageId(pageId, locale);

  return Array.isArray(result) ? result : [];
});

/**
 * a slug that doesn't match any CMS page may instead match a root category (no `parentCategory`)
 * flagged for the `page` entity — in that case the route renders a category-listing view instead
 * of a 404, mirroring the blog category pattern, but path-based instead of query-string-based.
 */
const getCachedRootCategory = cache(async (slug: string, locale: Locale) => {
  const category = (await getCategoryBySlug(slug, locale)) as ICategory | undefined;

  if (!category) return undefined;
  if (category.entity !== CategoryEntityEnum.PAGE || category.parentCategory) return undefined;

  return category;
});

/**
 * prerenders every published CMS page AND every root page-category (the fallback listing view
 * this same route serves — see `getCachedRootCategory` below) at build time, per locale. Slugs
 * missing at build time still render on demand (dynamicParams defaults to true).
 */
export const generateStaticParams = async ({ params }: { params: { locale: string } }) => {
  const locale = params.locale as Locale;
  const [pageSlugs, categorySlugs] = await Promise.all([
    getPageSlugsForLocale(locale),
    getRootPageCategorySlugsForLocale(locale),
  ]);
  const slugs = [...new Set([...pageSlugs, ...categorySlugs])];

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
  searchParams: Promise<{ page?: string }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const slug = params.slug;
  const locale = params.locale as Locale;
  const page = await getCachedPage(slug, locale);

  if (!page) {
    const category = await getCachedRootCategory(slug, locale);

    if (!category) return {};

    const {
      title, description, keywords, openGraphImages, twitter,
    } = getCategorySeoMetadata(category, locale);

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: locale || defaultLocale,
        images: openGraphImages,
      },
      twitter,
    };
  }

  const translated = page?.translated;
  const title = titleCase(getTranslatedField(translated, locale, 'name') || '');
  const description =
    getTranslatedField(translated, locale, 'metaDescription') ||
    getTranslatedField(translated, locale, 'description');
  const tags = getTranslatedField(translated, locale, 'tags') || '';

  // build the equivalent page URL for every locale, from each locale's own translated slug
  const pagesPath = retrievePathnameFromDynamicPathname(ROUTES.pages.preview().pathname);
  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [
      loc,
      getAbsoluteUrl(`/${loc}${pagesPath}${getTranslatedField(translated, loc, 'slug')}`),
    ])
  );
  const url = urlsByLocale[locale];

  // the page's first category names it in the chip of its share card ("Security", "Drivers")
  const category = page.categories?.[0];
  const { openGraphImages, twitter } = getSocialImages(
    {
      layout: OgCardLayoutEnum.CENTERED,
      chip: category ? getTranslatedField(category.translated, locale, 'name') : undefined,
      title,
      subtitle: description,
    },
    title,
    description
  );

  return {
    title,
    description,
    keywords: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    alternates: getAlternates(urlsByLocale, locale),
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      locale: locale || defaultLocale,
      images: openGraphImages,
    },
    twitter,
  };
};

/**
 * pagination reads `searchParams`, which — unlike `params` — is never covered by
 * `generateStaticParams` and so is always request-time data; isolated in its own component so
 * the `<Suspense>` boundary around it doesn't force the rest of the route (the CMS-content branch
 * below, which never needs `searchParams`) out of the static shell
 */
type CategoryListingProps = {
  category: ICategory;
  categoryName: string;
  breadcrumbs: BreadcrumbsSegment[];
  locale: Locale;
  searchParams: Props['searchParams'];
};

const CategoryListing = async ({
  category, categoryName, breadcrumbs, locale, searchParams: searchParamsPromise,
}: CategoryListingProps) => {
  const searchParams = await searchParamsPromise;
  const { perPage } = PAGINATION;
  const currentPage = parseInt(searchParams.page || '1', 10) || 1;
  const data = await getPagesByCategory(category.id, locale, getPaginatedQuery(perPage, currentPage));

  if ((data as any).error) {
    notFound();
  }

  // root category with children — list them, plus any pages attached directly to this category
  if (category.hasSubcategories) {
    const subcategories = (await getSubcategories(category.id)) as ICategory[] | undefined;

    return (
      <CategoryPagesView
        breadcrumbs={breadcrumbs}
        category={category}
        categoryName={categoryName}
        locale={locale}
        pages={(data as any).pages as IPage[]}
        subcategories={subcategories}
        pagination={{
          page: currentPage,
          perPage,
          total: (data as any).count as number,
        }}
      />
    );
  }

  return (
    <CategoryPagesView
      breadcrumbs={breadcrumbs}
      category={category}
      categoryName={categoryName}
      locale={locale}
      pages={(data as any).pages as IPage[]}
      pagination={{
        page: currentPage,
        perPage,
        total: (data as any).count as number,
      }}
    />
  );
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const PageApp = async (props: Props) => {
  const params = await props.params;

  const slug = params.slug;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const page = await getCachedPage(slug, locale);

  if (!page) {
    const category = await getCachedRootCategory(slug, locale);

    if (!category) {
      notFound();
    }

    const categoryName = getTranslatedField(category.translated, locale, 'name');
    const breadcrumbs: BreadcrumbsSegment[] = [
      { name: categoryName, link: ROUTES.pages.preview(slug) },
    ];

    // the header is known already: it stays while the pages are read, skeleton cards in their place
    return (
      <Suspense
        fallback={(
          <CategoryPagesView
            breadcrumbs={breadcrumbs}
            category={category}
            categoryName={categoryName}
            locale={locale}
            status="loading"
          />
        )}
      >
        <CategoryListing
          breadcrumbs={breadcrumbs}
          category={category}
          categoryName={categoryName}
          locale={locale}
          searchParams={props.searchParams}
        />
      </Suspense>
    );
  }

  const sections = await getCachedPageSections(page.id, locale);
  const pageTitle = getTranslatedField(page.translated, locale, 'title');
  const pageBreadcrumbs: BreadcrumbsSegment[] = [
    { name: pageTitle, link: ROUTES.pages.preview(slug) },
  ];

  return (
    <CmsPage
      breadcrumbs={pageBreadcrumbs}
      locale={locale}
      page={page}
      sections={sections}
    />
  );
};

export default PageApp;
