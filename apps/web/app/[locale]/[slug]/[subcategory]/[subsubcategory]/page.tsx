import { CategoryEntityEnum } from '@shared/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import CategoryPagesView from '@/containers/pages/CategoryPagesView';
import { defaultLocale, locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getCategoryBySlug } from '@/server/queries/category.queries';
import { getPagesByCategory } from '@/server/queries/page.queries';
import { IPage } from '@/types/cms.type';
import {
  getAlternates, getPaginatedQuery, getTranslatedAbsoluteUrl,
} from '@/utils/app.utils';
import { getCategorySeoMetadata } from '@/utils/cms.utils';
import { PAGINATION } from '@/utils/constants';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
    subcategory: string;
    subsubcategory: string;
  }>;
  searchParams: Promise<{ page?: string }>;
};

/**
 * resolves a level-3 leaf category, validating that its ancestor chain (level-2 parent, root
 * grandparent) matches the URL segments — max depth is 3 levels, so a level-3 category never has
 * its own children
 */
const resolveSubsubcategory = async (
  rootSlug: string,
  subcategorySlug: string,
  subsubcategorySlug: string,
  locale: Locale
) => {
  const subsubcategory = await getCategoryBySlug(subsubcategorySlug, locale);
  const subcategory = subsubcategory?.parentCategory;
  const rootCategory = subcategory?.parentCategory;

  if (
    !subsubcategory ||
    subsubcategory.entity !== CategoryEntityEnum.PAGE ||
    !subcategory ||
    !rootCategory ||
    getTranslatedField(subcategory.translated, locale, 'slug') !== subcategorySlug ||
    getTranslatedField(rootCategory.translated, locale, 'slug') !== rootSlug
  ) {
    return undefined;
  }

  return { subsubcategory, subcategory, rootCategory };
};

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;
  const resolved = await resolveSubsubcategory(
    params.slug, params.subcategory, params.subsubcategory, locale
  );

  if (!resolved) return {};

  const { subsubcategory, subcategory, rootCategory } = resolved;
  const {
    title, description, keywords, openGraphImages, twitter,
  } = getCategorySeoMetadata(subsubcategory, locale);

  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [
      loc,
      getTranslatedAbsoluteUrl(ROUTES.pages.subsubcategory().pathname, {
        locale: loc,
        slug: getTranslatedField(rootCategory.translated, loc, 'slug'),
        subcategory: getTranslatedField(subcategory.translated, loc, 'slug'),
        subsubcategory: getTranslatedField(subsubcategory.translated, loc, 'slug'),
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
const SubsubcategoryContent = async (props: Props) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const resolved = await resolveSubsubcategory(
    params.slug, params.subcategory, params.subsubcategory, locale
  );

  if (!resolved) {
    notFound();
  }

  const { subsubcategory, subcategory, rootCategory } = resolved;
  const { perPage } = PAGINATION;
  const currentPage = parseInt(searchParams.page || '1', 10) || 1;

  const rootCategoryName = getTranslatedField(rootCategory.translated, locale, 'name');
  const subcategoryName = getTranslatedField(subcategory.translated, locale, 'name');
  const subsubcategoryName = getTranslatedField(subsubcategory.translated, locale, 'name');

  const rootSlug = getTranslatedField(rootCategory.translated, locale, 'slug');
  const subcategorySlug = getTranslatedField(subcategory.translated, locale, 'slug');

  const breadcrumbs: BreadcrumbsSegment[] = [
    {
      name: rootCategoryName,
      link: ROUTES.pages.preview(rootSlug),
    },
    {
      name: subcategoryName,
      link: ROUTES.pages.category(rootSlug, subcategorySlug),
    },
    {
      name: subsubcategoryName,
      link: ROUTES.pages.subsubcategory(
        rootSlug,
        subcategorySlug,
        getTranslatedField(subsubcategory.translated, locale, 'slug')
      ),
    },
  ];

  const data = await getPagesByCategory(subsubcategory.id, locale, getPaginatedQuery(perPage, currentPage));

  if ((data as any).error) {
    notFound();
  }

  return (
    <CategoryPagesView
      breadcrumbs={breadcrumbs}
      category={subsubcategory}
      categoryName={subsubcategoryName}
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
 * this route has no `generateStaticParams` (subsubcategories are unbounded), so `params` and
 * `searchParams` are always request-time data — wrapped in its own `<Suspense>` boundary so
 * `cacheComponents` can still validate/prerender the static shell around it
 */
const SubsubcategoryPage = (props: Props) => (
  <Suspense fallback={null}>
    <SubsubcategoryContent {...props} />
  </Suspense>
);

export default SubsubcategoryPage;
