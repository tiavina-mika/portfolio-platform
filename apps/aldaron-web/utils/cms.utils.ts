import { titleCase } from 'string-ts';

import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { IArticle } from '@/types/article.type';
import { ICategory } from '@/types/cms.type';
import { OgCardLayoutEnum } from '@/types/og.type';

import { AVERAGE_READING_WORDS_PER_MINUTE } from './constants';
import { createQueryString } from './next.utils';
import { getSocialImages } from './og.utils';
import { getTranslatedField } from './translation.utils';

/**
 * article list url with category slug as search param
 * ex: /articles?category=marketing
 * @param category
 * @param locale
 * @returns
 */
export const goToArticlesByCategory = (
  translated: Record<string, string>,
  locale: Locale
) => {
  const translatedSlug = getTranslatedField(translated, locale, 'slug');

  return `${ROUTES.articles.root}?${createQueryString({ category: translatedSlug })}`;
};

/**
 * article list url with category slug as search param
 * ex: /articles?category=marketing
 * @param category
 * @param locale
 * @returns
 */
export const goToItemsByCategory = <T extends Record<string, any> = Record<string, any>>(
  translated: T,
  locale: Locale,
  pathname: string
) => {
  const translatedSlug = getTranslatedField<T>(translated, locale, 'slug');

  return `${(ROUTES as any)[pathname].root}?${createQueryString({ category: translatedSlug })}`;
};

/**
 * subcategory listing page url — nested path (not a query string), used for CMS Page
 * subcategories: `/parent-category-slug/subcategory-slug`, or, when parentCategory is itself a
 * level-2 subcategory, `/root-category-slug/parent-category-slug/subcategory-slug` (max depth: 3 levels)
 * @param parentCategory the subcategory's direct parent (root or level-2 category)
 * @param subcategory the subcategory itself
 * @param locale
 * @returns
 */
export const goToSubcategory = (
  parentCategory: ICategory,
  subcategory: ICategory,
  locale: Locale
): any => {
  const grandParentCategory = parentCategory.parentCategory;
  const parentSlug = getTranslatedField(parentCategory.translated, locale, 'slug');
  const subcategorySlug = getTranslatedField(subcategory.translated, locale, 'slug');

  /*
   * a category missing a slug in both the current and default locale can't build a valid nested
   * route — falls back to the parent's own page (or home, if even that slug is missing) rather
   * than emitting an unresolved `[slug]` href
   */
  if (!subcategorySlug) {
    return parentSlug ? ROUTES.pages.preview(parentSlug) : ROUTES.home;
  }

  if (grandParentCategory) {
    const rootSlug = getTranslatedField(grandParentCategory.translated, locale, 'slug');

    if (!rootSlug || !parentSlug) {
      return parentSlug ? ROUTES.pages.preview(parentSlug) : ROUTES.home;
    }

    return ROUTES.pages.subsubcategory(rootSlug, parentSlug, subcategorySlug);
  }

  if (!parentSlug) return ROUTES.home;

  return ROUTES.pages.category(parentSlug, subcategorySlug);
};

/**
 * estimated reading time, in minutes, of a rich text editor content
 * the content is HTML, so tags and entities are stripped before counting words
 * @param htmlContent translated `content` field of an article or a page
 * @returns a minimum of 1 minute, so a very short content never displays "0 min"
 */
export const getReadingTimeInMinutes = (htmlContent?: string): number => {
  const text = (htmlContent || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .trim();

  if (!text) return 1;

  return Math.max(1, Math.ceil(text.split(/\s+/).length / AVERAGE_READING_WORDS_PER_MINUTE));
};

/**
 * what search engines are given for a category page: the meta title and description the editor set
 * in the back-office, the category name standing in for a missing meta title, and its tags as
 * keywords. The meta fields are read in the page's own language only — falling back to another
 * language's would put a French title on an English page, where the translated name does better.
 * Its share card names the parent category in the chip, so a subcategory says where it belongs.
 */
export const getCategorySeoMetadata = (category: ICategory, locale: Locale) => {
  const localeFields = category.translated?.[locale];
  const tags = getTranslatedField(category.translated, locale, 'tags');
  const title =
    localeFields?.metaTitle || titleCase(getTranslatedField(category.translated, locale, 'name'));
  const description = localeFields?.metaDescription || undefined;
  const parentName = category.parentCategory
    ? getTranslatedField(category.parentCategory.translated, locale, 'name')
    : undefined;

  return {
    title,
    description,
    keywords: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    ...getSocialImages(
      {
        layout: OgCardLayoutEnum.CENTERED, chip: parentName, title, subtitle: description,
      },
      title,
      description
    ),
  };
};

/**
 * the image an article is shared with: its preview (the one the back-office labels as the social
 * share image), else its cover, else its first gallery image
 */
export const getArticleImageUrl = (article: IArticle): string | undefined =>
  article.previewImage?.url || article.image?.url || article.images?.[0]?.url;
