'use server';

import { MetadataRoute } from 'next';
import { cacheLife, cacheTag } from 'next/cache';

import { getParseServer } from '@/config/parse-server.config';
import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import {
  IInputQuery, IPaginationQuery, ISelectOption, IServerResponse,
} from '@/types/app.type';
import {
  ICategory,
  ICategoryWithPagesPreview,
  IPage,
  IPageSection,
  PageLinkPositionEnum,
  PagesForUrlsOutput,
} from '@/types/cms.type';
import { getAbsoluteUrl, goToItemBySlug } from '@/utils/app.utils';
import { goToSubcategory } from '@/utils/cms.utils';
import { collections } from '@/utils/constants';
import { serializeParseObject, withContentCountry } from '@/utils/parse.utils';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { getTranslatedField } from '@/utils/translation.utils';

const Parse = getParseServer();

export const getPage = async (
  slug: string,
  locale: Locale
): Promise<IServerResponse<IPage | any | undefined>> => {
  'use cache';
  cacheLife('hours');
  cacheTag('pages');

  try {
    const page = await withContentCountry(new Parse.Query(collections.Page))
      .equalTo(`translated.${locale}.slug`, slug)
      .select(['translated', 'bannerImage', 'previewImage', 'images', 'blocks', 'code'])
      .include('blocks')
      .first();

    return serializeParseObject<IPage | undefined>(page);
  }
  catch (error) {
    return { error: (error as Error).message };
  }
};

export const getPaginatedPages = async ({
  limit,
  skip,
  orderedBy,
  order,
}: IInputQuery): Promise<
  IServerResponse<{ pages: IPage[]; count: number }>
> => {
  'use cache';
  cacheLife('minutes');
  cacheTag('pages');

  try {
    const query = withContentCountry(new Parse.Query(collections.Page)).limit(limit).skip(skip);

    if (orderedBy) {
      if (order === 'asc') {
        query.ascending(orderedBy);
      }
      else {
        query.descending(orderedBy);
      }
    }

    const result = (await query.withCount().find()) as any;
    const pages = serializeParseObject<IPage[]>(result.results);

    return {
      pages,
      count: result.count,
    };
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};

/**
 * get pages only for urls used in sitemap page
 * slug and title are the only fields needed
 * @returns
 */
export const getPagesForMenusUrls = async (
  locale: Locale
): Promise<PagesForUrlsOutput> => {
  'use cache';
  cacheLife('hours');
  cacheTag('pages');

  const footers: ISelectOption[] = [];
  const footersGroupedByCategory: ISelectOption<ISelectOption[]>[] = [];
  const menus: ISelectOption[] = [];

  // a category only becomes its own footer column once we know it has more than one footer
  // line item — that count is only known after every page has been visited. Keyed by category
  // id (not translated name) so an untranslated name never breaks bucketing or collides with
  // another category that happens to share the same translated name.
  // page links and subcategory links are tracked separately so subcategory links can always be
  // appended last in the final column, regardless of the order pages come back from `.each()`
  const categoryBucketsMap = new Map<
    string,
    { label: string; pageLinks: ISelectOption[]; subcategoryLinks: ISelectOption[] }
  >();
  // dedupes the subcategory link itself — a subcategory can surface either because one of its
  // own pages is footer-flagged, or because its parent root category is (see below) — either
  // way the footer must only ever contribute a single line item for it
  const subcategoryLinksById = new Map<string, ISelectOption>();
  // root categories encountered while walking footer pages, keyed by id so each is resolved
  // once — their subcategories are fetched in a single batched query after the page loop
  // instead of one query per category (previously N+1 queries inside `.each()`)
  const rootCategoriesById = new Map<string, any>();

  const addPageLink = (categoryId: string, label: string, link: ISelectOption) => {
    const bucket = categoryBucketsMap.get(categoryId) ?? { label, pageLinks: [], subcategoryLinks: [] };

    bucket.pageLinks.push(link);
    categoryBucketsMap.set(categoryId, bucket);
  };

  const addSubcategoryLink = (categoryId: string, label: string, link: ISelectOption) => {
    const bucket = categoryBucketsMap.get(categoryId) ?? { label, pageLinks: [], subcategoryLinks: [] };

    bucket.subcategoryLinks.push(link);
    categoryBucketsMap.set(categoryId, bucket);
  };

  await withContentCountry(new Parse.Query(collections.Page))
    .equalTo('deleted', false)
    .equalTo('active', true)
    .include(['categories', 'categories.parentCategory'])
    .select(['translated', 'linkLocations', 'categories'])
    // raw Parse.Object from `.each()` — only footer/menu links (plain data) leave this function
    .each((page: any) => {
      const translated = page.get('translated');
      const linkLocations = page.get('linkLocations') || [];
      const name = getTranslatedField(translated, locale, 'name');
      const url = goToItemBySlug(translated, locale, 'pages');

      for (const linkLocation of linkLocations) {
        if (linkLocation === PageLinkPositionEnum.FOOTER) {
          const categories = page.get('categories') || [];
          const category = categories[0];
          const parentCategory = category?.get('parentCategory');
          const footer = { label: name, value: url };

          if (category && parentCategory) {
            // page's own category IS a subcategory → bucket under the PARENT's id,
            // contributing a single deduped subcategory link instead of a page link
            const parentCategoryName = parentCategory.has('translated')
              ? getTranslatedField(parentCategory.get('translated'), locale, 'name')
              : '';
            const subcategoryName = category.has('translated')
              ? getTranslatedField(category.get('translated'), locale, 'name')
              : '';

            if (parentCategoryName && subcategoryName && !subcategoryLinksById.has(category.id)) {
              const subcategoryLink = {
                label: subcategoryName,
                value: goToSubcategory(parentCategory, category, locale),
              };

              subcategoryLinksById.set(category.id, subcategoryLink);
              addSubcategoryLink(parentCategory.id, parentCategoryName, subcategoryLink);
            }
          }
          else if (category) {
            // page's own category is a root category → same bucket as before; its
            // subcategories are resolved after the page loop, once per category
            const categoryName = category.has('translated')
              ? getTranslatedField(category.get('translated'), locale, 'name')
              : '';

            if (categoryName) {
              addPageLink(category.id, categoryName, footer);
              rootCategoriesById.set(category.id, category);
            }
            else {
              // category has no translated name for this locale — falls back to the flat
              // list instead of silently disappearing from the footer
              footers.push(footer);
            }
          }
          else {
            // uncategorized page
            footers.push(footer);
          }
        }
        else {
          menus.push({
            label: name,
            value: url,
          });
        }
      }
    });

  // resolve every root category's subcategories in a single batched query instead of one
  // query per category
  if (rootCategoriesById.size > 0) {
    const subCategories = await new Parse.Query(collections.Category)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .containedIn('parentCategory', Array.from(rootCategoriesById.values()))
      .select(['translated', 'parentCategory'])
      .find();

    subCategories.forEach((subCategory: any) => {
      if (subcategoryLinksById.has(subCategory.id)) return;

      const parentCategoryId = subCategory.get('parentCategory')?.id;
      const category = parentCategoryId ? rootCategoriesById.get(parentCategoryId) : undefined;

      if (!category) return;

      const subcategoryName = subCategory.has('translated')
        ? getTranslatedField(subCategory.get('translated'), locale, 'name')
        : '';

      if (!subcategoryName) return;

      const categoryName = category.has('translated')
        ? getTranslatedField(category.get('translated'), locale, 'name')
        : '';

      const subcategoryLink = {
        label: subcategoryName,
        value: goToSubcategory(category, subCategory, locale),
      };

      subcategoryLinksById.set(subCategory.id, subcategoryLink);
      addSubcategoryLink(parentCategoryId, categoryName, subcategoryLink);
    });
  }

  // >1 line item in a category (direct pages + subcategory links) → own column, exactly 1 →
  // falls back to the flat list. Subcategory links are always appended after page links.
  categoryBucketsMap.forEach(({ label, pageLinks, subcategoryLinks }) => {
    const links = [...pageLinks, ...subcategoryLinks];

    if (links.length > 1) {
      footersGroupedByCategory.push({ label, value: links });
    }
    else {
      footers.push(...links);
    }
  });

  return {
    footers,
    menus,
    footersGroupedByCategory,
  };
};

/**
 * keep only the slugs that match a published CMS page for the locale, so a link is never rendered
 * toward a page that does not exist yet (e.g. the legal pages on a first deploy with an empty database)
 * @param slugs
 * @param locale
 * @returns
 */
export const getExistingPageSlugs = async (
  slugs: string[],
  locale: Locale
): Promise<string[]> => {
  'use cache';
  cacheLife('hours');
  cacheTag('pages');

  try {
    const pages = await withContentCountry(new Parse.Query(collections.Page))
      .equalTo('deleted', false)
      .equalTo('active', true)
      .containedIn(`translated.${locale}.slug`, slugs)
      .select([`translated.${locale}.slug`])
      .limit(slugs.length)
      .find();

    return pages.map((page: any) => getTranslatedField(page.get('translated'), locale, 'slug'));
  }
  catch (e) {
    console.log('getExistingPageSlugs e: ', e);
    return [];
  }
};

/**
 * get paginated CMS pages belonging to a given category (root or subcategory)
 * used by the `[slug]/[subcategory]` route, and by the `[slug]` fallback when the slug
 * resolves to a root category with no subcategories of its own
 * @param categoryId
 * @param locale
 * @param pagination
 * @returns
 */
export const getPagesByCategory = async (
  categoryId: string,
  locale: Locale,
  { limit, skip }: IPaginationQuery
): Promise<IServerResponse<{ pages: IPage[]; count: number }>> => {
  'use cache';
  cacheLife('minutes');
  cacheTag('pages');

  try {
    const CategoryPointer = Parse.Object.extend(collections.Category);
    const categoryPointer = new CategoryPointer();

    categoryPointer.id = categoryId;

    const result = (await withContentCountry(new Parse.Query(collections.Page))
      .equalTo('deleted', false)
      .equalTo('active', true)
      .equalTo('categories', categoryPointer)
      .select([`translated.${locale}`, 'bannerImage'])
      .limit(limit)
      .skip(skip)
      .withCount()
      .find()) as any;

    return {
      pages: serializeParseObject<IPage[]>(result.results),
      count: result.count,
    };
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};

/**
 * for each of the given subcategories, fetch a small preview of its own pages plus the total
 * count — used to render a level-3 subcategory's content inline on its level-2 parent's page.
 * bounded by the number of subcategories (small, admin-curated), not by page volume, so one
 * query per subcategory stays cheap here unlike a true per-row N+1
 * @param categories
 * @param locale
 * @param previewLimit
 * @returns
 */
export const getPagesPreviewByCategories = async (
  categories: ICategory[],
  locale: Locale,
  previewLimit: number
): Promise<ICategoryWithPagesPreview[]> => {
  'use cache';
  cacheLife('minutes');
  cacheTag('pages');

  return Promise.all(
    categories.map(async (category) => {
      const data = await getPagesByCategory(category.id, locale, { limit: previewLimit, skip: 0 });

      if ((data as any).error) {
        return { category, pages: [], total: 0 };
      }

      return {
        category,
        pages: (data as any).pages as IPage[],
        total: (data as any).count as number,
      };
    })
  );
};

/**
 * get every published CMS page slug for a given locale, used by `generateStaticParams` to
 * prerender page routes at build time instead of rendering each one on first visit
 * @param locale
 * @returns
 */
export const getPageSlugsForLocale = async (locale: Locale): Promise<string[]> => {
  try {
    const slugs: string[] = [];

    await withContentCountry(new Parse.Query(collections.Page))
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select([`translated.${locale}.slug`])
      .each(
        // raw Parse.Object from `.each()` — only slugs (plain strings) leave this function
        (page: any) => {
          const slug = getTranslatedField(page.get('translated'), locale, 'slug');

          if (slug) slugs.push(slug);
        },
        { batchSize: 1000 }
      );

    return slugs;
  }
  catch (e) {
    console.log('getPageSlugsForLocale e: ', e);
    return [];
  }
};

/**
 * generate a sitemap for each CMS page in database
 * doc: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @returns
 */
export const generatePagesSitemap = async (): Promise<
  MetadataRoute.Sitemap | undefined
> => {
  'use cache';
  cacheLife('hours');
  cacheTag('pages');

  try {
    const siteMaps: MetadataRoute.Sitemap = [];

    // translated main path, ex: /
    const pagesPath = retrievePathnameFromDynamicPathname(
      ROUTES.pages.preview().pathname
    );

    await withContentCountry(new Parse.Query(collections.Page))
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated', 'updatedAt'])
      .each(
        // raw Parse.Object from `.each()` — only sitemap entries (plain data) leave this function
        (page: any) => {
          const siteMap: Record<string, any> = {
            lastModified: new Date(page.updatedAt as Date).toISOString(),
            alternates: { languages: {} },
          };

          // loop through all locales
          locales.forEach((locale) => {
            const slug = getTranslatedField(
              page.get('translated'),
              locale,
              'slug'
            );
            // full url
            const url = getAbsoluteUrl(`/${locale}${pagesPath}${slug}`);

            if (locale === defaultLocale) {
              siteMap.url = url;
            }
            else {
              siteMap.alternates.languages[locale] = url;
            }
          });

          siteMaps.push(siteMap as any);
        },
        {
          batchSize: 1000,
        }
      );

    return siteMaps;
  }
  catch (e) {
    console.log('getPagesForSiteMap e: ', e);
  }
};

export const getPageSectionsByPageId = async (
  pageId: string,
  locale: Locale
): Promise<IServerResponse<IPageSection[]>> => {
  'use cache';
  cacheLife('hours');
  cacheTag('pages');

  try {
    const PagePointer = Parse.Object.extend(collections.Page);
    const pagePointer = new PagePointer();
    pagePointer.id = pageId;
    const sections = await new Parse.Query(collections.PageSection)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .equalTo('pages', pagePointer)
      .select([`translated.${locale}`, 'blocks'])
      .ascending('createdAt')
      .limit(100)
      .find();

    return serializeParseObject<IPageSection[]>(sections);
  }
  catch (error) {
    return { error: (error as Error).message };
  }
};
