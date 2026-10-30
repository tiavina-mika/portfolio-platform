import { CategoryEntityEnum } from '@shared/types';
import Parse from 'parse';

import { locales } from '@/config/i18n';
import { CATEGORY_TREE_QUERY_LIMIT } from '@/constants/_core/cms.constants';
import {
  ICategory, ICategoryTypeEntity,
} from '@/types/_core/category.type';
import { Locale } from '@/types/_core/setting.type';
import { convertIdToPointer, setValues, toJSONWithId } from '@/utils/_core/parse.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { escapeText } from '@/utils/_core/utils';

const collection = 'Category';

export const Category = Parse.Object.extend(collection);

const CATEGORY_PROPERTIES = new Set(['translated', 'active', 'entity', 'image', 'code', 'parentCategory']);

export const fetchCategory = async (id: string, include: string[] = []): Promise<ICategory | undefined> => {
  const category = await Parse.Cloud.run('getCategory', { id, include });

  return category?.toJSON ? toJSONWithId<ICategory>(category) : category;
};

const toParseCategory = (category: ICategory): Parse.Object =>
  Parse.Object.fromJSON({ ...category, className: collection });

export type ISearchCategoriesOptions = {
  // only categories without a parentCategory (root categories)
  rootOnly?: boolean;
  // only categories that can still accept a child (levels 1 and 2 — excludes level-3 leaves, max depth is 3 levels)
  eligibleAsParent?: boolean;
  // only subcategories of this parent category id
  parentCategory?: string;
  // exclude this category id (edition mode — a category cannot be its own parent)
  excludeId?: string;
};

/**
 * search a category for an entity
 * ex: article, page, product
 */
export const searchCategories = async (
  search: string,
  entity: ICategoryTypeEntity = CategoryEntityEnum.ARTICLE,
  options: ISearchCategoriesOptions = {}
): Promise<ICategory[]> => {
  let query = new Parse.Query(Category);

  // search by translated texts
  if (search) {
    const text = escapeText(search);
    const or: any[] = [];

    locales.forEach((locale: string) => {
      or.push(
      // ex: translated.fr.name = "Sports"
        new Parse.Query(Category).matches('translated.' + locale + '.name', text)
      );
    });

    query = Parse.Query.or(...or);
  }

  query
    .equalTo('deleted', false)
    .equalTo('active', true)
    .equalTo('entity', entity);

  if (options.rootOnly) query.doesNotExist('parentCategory');

  if (options.eligibleAsParent) {
    // categories that already have a parent with a parent are level 3 (leaves) — they can't accept a child
    const nonRootCategoriesQuery = new Parse.Query(Category).exists('parentCategory');
    const level3CategoriesQuery = new Parse.Query(Category)
      .matchesKeyInQuery('parentCategory', 'objectId', nonRootCategoriesQuery);

    query.doesNotMatchKeyInQuery('objectId', 'objectId', level3CategoriesQuery);
  }

  if (options.parentCategory) query.equalTo('parentCategory', convertIdToPointer('Category', options.parentCategory));
  if (options.excludeId) query.notEqualTo('objectId', options.excludeId);

  const categories = await query
    .limit(100)
    .select(['translated', 'hasSubcategories', 'parentCategory.translated'])
    .find();

  return categories.map((category) => toJSONWithId<ICategory>(category));
};

export const fetchCategoryOptions = async (
  entity: ICategoryTypeEntity,
  locale: Locale
): Promise<{ value: string; label: string }[]> => {
  const categories = await new Parse.Query(Category)
    .equalTo('deleted', false)
    .equalTo('active', true)
    .equalTo('entity', entity)
    .limit(1000)
    .select('translated')
    .find();

  return categories.map((category: Parse.Object) => ({
    value: category.id!,
    label: getTranslatedField(category.get('translated'), locale, 'name'),
  }));
};

/**
 * every active category of an entity with just what placing a record in the tree needs: its names
 * and its parent. The levels are derived from `parentCategory` by the caller.
 */
export const fetchCategoryTree = async (entity: ICategoryTypeEntity): Promise<ICategory[]> => {
  const categories = await new Parse.Query(Category)
    .equalTo('deleted', false)
    .equalTo('active', true)
    .equalTo('entity', entity)
    .select(['translated', 'parentCategory', 'active', 'deleted', 'entity'])
    .limit(CATEGORY_TREE_QUERY_LIMIT)
    .find();

  return categories.map((category: Parse.Object) => toJSONWithId<ICategory>(category));
};

export const createCategoryEntity = async (
  newValues: Record<string, any>,
  locale: Locale
): Promise<{ category: ICategory; optionLabel: string }> => {
  const category = new Category();

  setValues(category, newValues, CATEGORY_PROPERTIES);

  const savedCategory = await category.save();

  return {
    category: toJSONWithId<ICategory>(savedCategory),
    optionLabel: getTranslatedField(savedCategory.get('translated'), locale, 'name'),
  };
};

/**
 * switches a single category on or off. Writes `active` on its own rather than going through
 * `updateCategoryEntity`: that one re-saves every editable property from the JSON it is handed,
 * and a list row carries only the fields the list selected — the rest would be written back empty.
 */
export const setCategoryActive = async (
  category: ICategory,
  value: boolean
): Promise<ICategory> => {
  const parseCategory = toParseCategory(category);

  parseCategory.set('active', value);

  const savedCategory = await parseCategory.save();

  return toJSONWithId<ICategory>(savedCategory);
};

export const updateCategoryEntity = async (
  existingCategory: ICategory,
  newValues: Record<string, any>
): Promise<ICategory> => {
  const parseCategory = toParseCategory(existingCategory);

  setValues(parseCategory, newValues, CATEGORY_PROPERTIES);

  const savedCategory = await parseCategory.save();

  return toJSONWithId<ICategory>(savedCategory);
};
