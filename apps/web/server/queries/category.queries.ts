import { CategoryEntityEnum } from '@shared/types';
import { cacheLife, cacheTag } from 'next/cache';

import { getParseServer } from '@/config/parse-server.config';
import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ICategory } from '@/types/cms.type';
import { ARTICLE_CATEGORIES_LIMIT, collections } from '@/utils/constants';
import { serializeParseObject } from '@/utils/parse.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { escapeText } from '@/utils/utils';

const Parse = getParseServer();

/**
 * get articles only for urls used in sitemap page
 * slug and title are the only fields needed
 * @returns
 */
export const getCategoriesForUrls = async (): Promise<
  ICategory[] | void
> => {
  'use cache';
  cacheLife('hours');
  cacheTag('categories');

  try {
    const categories = await new Parse.Query(collections.Category)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated', 'entity'])
      .find();

    return serializeParseObject<ICategory[]>(categories) || [];
  }
  catch (e) {
    console.log('getCategoriesForUrls e: ', e);
  }
};

/**
 * resolve a category by its translated slug (any locale)
 * used to turn the `?category=<slug>` search param into a Category object
 * (root or leaf/subcategory)
 * @param slug
 * @param locale
 * @returns
 */
export const getCategoryBySlug = async (
  slug: string,
  locale: string = defaultLocale
): Promise<ICategory | void> => {
  'use cache';
  cacheLife('hours');
  cacheTag('categories');

  try {
    const or: any[] = [];

    locales.forEach((locale: string) => {
      or.push(
        new Parse.Query(collections.Category).matches(`translated.${locale}.slug`, escapeText(slug))
      );
    });

    const category = await Parse.Query.or(...or)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .equalTo(`translated.${locale}.slug`, slug)
      // parentCategory.parentCategory is needed to resolve a level-3 category's root ancestor (max depth: 3 levels)
      .include(['parentCategory', 'parentCategory.parentCategory'])
      .select(['translated', 'entity', 'image', 'parentCategory', 'hasSubcategories'])
      .first();

    return serializeParseObject<ICategory | undefined>(category);
  }
  catch (e) {
    console.log('getCategoryBySlug e: ', e);
  }
};

/**
 * get the subcategories of a category
 * used by the category page to decide whether to list subcategories or content directly
 * (a category with subcategories shows them as a list, one without shows its content)
 * @param parentCategoryId
 * @returns
 */
/**
 * get every root category slug (no `parentCategory`) flagged for the `page` entity, for a given
 * locale — used by `generateStaticParams` on the `[slug]` CMS route, which falls back to a
 * category-listing view when a slug doesn't match a CMS page (see `getCachedRootCategory` in
 * `app/[locale]/[slug]/page.tsx`)
 * @param locale
 * @returns
 */
export const getRootPageCategorySlugsForLocale = async (locale: Locale): Promise<string[]> => {
  try {
    const slugs: string[] = [];

    await new Parse.Query(collections.Category)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .equalTo('entity', CategoryEntityEnum.PAGE)
      .doesNotExist('parentCategory')
      .select(['translated'])
      .each(
        // raw Parse.Object from `.each()` — only slugs (plain strings) leave this function
        (category: any) => {
          const slug = getTranslatedField(category.get('translated'), locale, 'slug');

          if (slug) slugs.push(slug);
        },
        { batchSize: 1000 }
      );

    return slugs;
  }
  catch (e) {
    console.log('getRootPageCategorySlugsForLocale e: ', e);
    return [];
  }
};

export const getSubcategories = async (parentCategoryId: string): Promise<ICategory[] | void> => {
  'use cache';
  cacheLife('hours');
  cacheTag('categories');

  try {
    const ParentCategory = Parse.Object.extend(collections.Category);
    const parentCategory = new ParentCategory();

    parentCategory.id = parentCategoryId;

    const subcategories = await new Parse.Query(collections.Category)
      .equalTo('parentCategory', parentCategory)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated', 'entity'])
      .find();

    return serializeParseObject<ICategory[]>(subcategories) || [];
  }
  catch (e) {
    console.log('getSubcategories e: ', e);
  }
};

/**
 * get the root categories of the articles, shown as the filter chips of the blog
 * a failure returns an empty list: the blog stays usable with the "all" chip alone
 * @returns
 */
export const getArticleCategories = async (): Promise<ICategory[]> => {
  'use cache';
  cacheLife('hours');
  cacheTag('categories');

  try {
    const categories = await new Parse.Query(collections.Category)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .equalTo('entity', CategoryEntityEnum.ARTICLE)
      .doesNotExist('parentCategory')
      .select(['translated'])
      .ascending('createdAt')
      .limit(ARTICLE_CATEGORIES_LIMIT)
      .find();

    return serializeParseObject<ICategory[]>(categories) || [];
  }
  catch (e) {
    console.log('getArticleCategories e: ', e);
    return [];
  }
};
