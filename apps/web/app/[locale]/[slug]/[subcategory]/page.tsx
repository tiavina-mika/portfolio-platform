import { CategoryEntityEnum } from '@shared/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import CategoryPagesView from '@/containers/pages/CategoryPagesView';
import { defaultLocale, locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getCategoryBySlug, getSubcategories } from '@/server/queries/category.queries';
import { getPagesByCategory, getPagesPreviewByCategories } from '@/server/queries/page.queries';
import { ICategory, IPage } from '@/types/cms.type';
import {
  getAlternates, getPaginatedQuery, getTranslatedAbsoluteUrl,
} from '@/utils/app.utils';
import { getCategorySeoMetadata } from '@/utils/cms.utils';
import { CATEGORY_SUBCATEGORY_PAGES_PREVIEW_LIMIT, PAGINATION } from '@/utils/constants';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
    subcategory: string;
  }>;
  searchParams: Promise<{ page?: string }>;
};

const resolveSubcategory = async (categorySlug: string, subcategorySlug: string, locale: Locale) => {
  const subcategory = await getCategoryBySlug(subcategorySlug, locale);
  const parentCategory = subcategory?.parentCategory;

  if (
    !subcategory ||
    subcategory.entity !== CategoryEntityEnum.PAGE ||
    !parentCategory ||
    getTranslatedField(parentCategory.translated, locale, 'slug') !== categorySlug
  ) {
    return undefined;
  }

  return { subcategory, parentCategory };
};

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;
  const resolved = await resolveSubcategory(params.slug, params.subcategory, locale);

  if (!resolved) return {};

  const { subcategory } = resolved;
  const {
    title, description, keywords, openGraphImages, twitter,
  } = getCategorySeoMetadata(subcategory, locale);

  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [
      loc,
      getTranslatedAbsoluteUrl(ROUTES.pages.category().pathname, {
        locale: loc,
        slug: getTranslatedField(resolved.parentCategory.translated, loc, 'slug'),
        subcategory: getTranslatedField(subcategory.translated, loc, 'slug'),
      }),
    ])
  );

  return {
    title,
    description,
    keywords,
    alternates: getAlternates(urlsByLocale, locale),
    openGraph: {
      title,
      description,
      type: 'website',
      url: urlsByLocale[locale],
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
const SubcategoryContent = async (props: Props) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const resolved = await resolveSubcategory(params.slug, params.subcategory, locale);

  if (!resolved) {
    notFound();
  }

  const { subcategory, parentCategory } = resolved;
  const { perPage } = PAGINATION;
  const currentPage = parseInt(searchParams.page || '1', 10) || 1;

  const parentCategoryName = getTranslatedField(parentCategory.translated, locale, 'name');
  const subcategoryName = getTranslatedField(subcategory.translated, locale, 'name');

  const breadcrumbs: BreadcrumbsSegment[] = [
    {
      name: parentCategoryName,
      link: ROUTES.pages.preview(getTranslatedField(parentCategory.translated, locale, 'slug')),
    },
    {
      name: subcategoryName,
      link: ROUTES.pages.category(
        getTranslatedField(parentCategory.translated, locale, 'slug'),
        getTranslatedField(subcategory.translated, locale, 'slug')
      ),
    },
  ];

  const data = await getPagesByCategory(subcategory.id, locale, getPaginatedQuery(perPage, currentPage));

  if ((data as any).error) {
    notFound();
  }

  /*
   * level-2 category with its own children (level 3, max depth: 3 levels) — list them, plus
   * any pages attached directly to this subcategory
   */
  if (subcategory.hasSubcategories) {
    const subsubcategories = (await getSubcategories(subcategory.id)) as ICategory[] | undefined;
    const subcategoriesWithPages = subsubcategories?.length
      ? await getPagesPreviewByCategories(subsubcategories, locale, CATEGORY_SUBCATEGORY_PAGES_PREVIEW_LIMIT)
      : undefined;

    return (
      <CategoryPagesView
        breadcrumbs={breadcrumbs}
        category={subcategory}
        categoryName={subcategoryName}
        locale={locale}
        pages={(data as any).pages as IPage[]}
        subcategoriesWithPages={subcategoriesWithPages}
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
      category={subcategory}
      categoryName={subcategoryName}
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

/**
 * this route has no `generateStaticParams` (subcategories are unbounded), so `params` and
 * `searchParams` are always request-time data — wrapped in its own `<Suspense>` boundary so
 * `cacheComponents` can still validate/prerender the static shell around it
 */
const SubcategoryPage = (props: Props) => (
  <Suspense fallback={null}>
    <SubcategoryContent {...props} />
  </Suspense>
);

export default SubcategoryPage;
