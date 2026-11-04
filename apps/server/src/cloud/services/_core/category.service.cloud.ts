import { CategoryEntityEnum } from '@shared/types';

import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';

import { runJob } from '../../utils/_core/job.utils.cloud';

// maps a category's own entity to the collection its itemCount/hasSubcategories recompute must target
const CATEGORY_ENTITY_CLASS_NAMES: Record<CategoryEntityEnum, string> = {
  [CategoryEntityEnum.ARTICLE]: collections.Article,
  [CategoryEntityEnum.PAGE]: collections.Page,
};

/**
 * Remove permanently a category from all linked items
 * @param category
 */
export const destroyCategoryFromLinkedItems = async (
  category: Parse.Object
): Promise<void> => {
  const removeCategoryFromItems = async (query: Parse.Query) => {
    query.equalTo('deletedCategories', category);
    await query.each(async (item) => {
      item.remove('deletedCategories', category);
      await item.save(null, USE_MASTER_KEY);
    }, {
      ...USE_MASTER_KEY,
      batchSize: 1000,
    });
  };

  const articleQuery = new Parse.Query('Article');

  await removeCategoryFromItems(articleQuery);

  const pageQuery = new Parse.Query('Page');

  await removeCategoryFromItems(pageQuery);
};

/**
 * when moving a category to trash
 * we move the category to a temporary field (deletedCategories)
 * so when it is restored, we can move it back to the original field (categories)
 * or when it is deleted permanently, we can remove it from the items
 *
 * also cascades the trash to every linked article/page: the BO warns the admin before
 * confirming that linked content will be trashed too, so once confirmed it must actually happen —
 * otherwise the category disappears from the article/page while the content silently stays live
 * @param category
 */
export const moveCategoryFromLinkedItems = async (
  category: Parse.Object
): Promise<void> => {
  // the category's own deletedBy/deletedAt, already set in memory by the caller (category afterSave)
  const deletedBy = category.get('deletedBy');
  const deletedAt = category.get('deletedAt');

  const moveCategoryForItemsToTrash = async (query: Parse.Query) => {
    query.equalTo('categories', category);
    await query.each(async (item) => {
      // add category to deletedCategories (trash)
      item.add('deletedCategories', category);
      // remove category from categories
      item.remove('categories', category);

      /*
       * cascade delete: only set deletion metadata if not already deleted, otherwise we'd
       * overwrite the original deletedBy/deletedAt of an item deleted independently before
       */
      if (!item.get('deleted')) {
        item.set('deleted', true);
        item.set('deletedBy', deletedBy);
        item.set('deletedAt', deletedAt);
      }

      await item.save(null, USE_MASTER_KEY);
    }, {
      ...USE_MASTER_KEY,
      batchSize: 1000,
    });
  };

  const articleQuery = new Parse.Query('Article');

  await moveCategoryForItemsToTrash(articleQuery);

  const pageQuery = new Parse.Query('Page');

  await moveCategoryForItemsToTrash(pageQuery);
};

/**
 * restore category from linked items from trash
 * NOTE: this function is not used in the current implementation
 * NOTE: add the item increment logic when it will be used
 * @param category
 */
export const restoreCategoryFromLinkedItems = async (category: Parse.Object): Promise<void> => {
  const restoreCategoryForItems = async (query: Parse.Query) => {
    query.equalTo('deletedCategories', category);
    await query.each(async (item) => {
      // remove category from deletedCategories (trash)
      item.remove('deletedCategories', category);
      // add category to categories
      item.add('categories', category);
      await item.save(null, USE_MASTER_KEY);
    }, {
      ...USE_MASTER_KEY,
      batchSize: 1000,
    });
  };

  const articleQuery = new Parse.Query('Article');

  await restoreCategoryForItems(articleQuery);

  const pageQuery = new Parse.Query('Page');

  await restoreCategoryForItems(pageQuery);
};

/**
 * update linked (pointer) category item count
 * ex: article count for each category
 * @param className
 * @param parseObj
 * @param prevParseObj
 */
export const updateLinkedCategoryItemCount = async (
  className: string,
  parseObj: Parse.Object,
  prevParseObj: Parse.Object | undefined
): Promise<void> => {
  // many-to-many relation
  const prevCategories = prevParseObj?.get('categories') || [];
  const currentCategories = parseObj.get('categories') || [];

  const categoryIds = [
    ...prevCategories,
    ...currentCategories,
  ].map((category: Parse.Object) => category.id);

  await runJob('updateLinkedCategoryItemCountJob', { categoryIds, className });
};

/**
 * recompute and persist hasSubcategories on a parent category
 * counts only active, non-deleted subcategories — this is the value the web reads
 * to decide whether to list subcategories or content directly, so it never has to count them itself
 * @param parentCategoryId
 */
export const updateParentHasSubcategories = async (parentCategoryId: string): Promise<void> => {
  const parent = await new Parse.Query('Category').get(parentCategoryId, USE_MASTER_KEY);

  const count = await new Parse.Query('Category')
    .equalTo('parentCategory', parent)
    .equalTo('active', true)
    .notEqualTo('deleted', true)
    .count(USE_MASTER_KEY);

  parent.set('hasSubcategories', count > 0);
  await parent.save(null, USE_MASTER_KEY);
};

/**
 * full recompute of a parent category's itemCount (linked items + subcategories)
 * used whenever a subcategory is attached, detached, reparented, restored, or (de)activated —
 * i.e. every case where the exact delta isn't known, mirroring updateLinkedCategoryItemCount for Article/Page
 * @param parentCategoryId
 */
export const refreshParentCategoryItemCount = async (parentCategoryId: string): Promise<void> => {
  const parent = await new Parse.Query('Category').get(parentCategoryId, USE_MASTER_KEY);
  const className = CATEGORY_ENTITY_CLASS_NAMES[parent.get('entity') as CategoryEntityEnum];

  await runJob('updateLinkedCategoryItemCountJob', { categoryIds: [parentCategoryId], className });
};

/**
 * decrement category item count when an item is deleted (recycle bin)
 * @param className
 * @param parseObj
 */
export const decrementCategoryItemCount = async (
  className: string,
  parseObj: Parse.Object
): Promise<void> => {
  const tempDeletedCategories = parseObj.get('deletedCategories') || [];

  const categoryIds = tempDeletedCategories.map((category: Parse.Object) => category.id);

  await runJob('updateLinkedCategoryItemCountJob', { categoryIds, className, isRecycleBin: true });
};

/**
 * decrement the parent's itemCount when a subcategory is moved to trash (recycle bin)
 * a known -1 delta, so this skips the full recompute — mirrors decrementCategoryItemCount for Article/Page
 * @param parentCategoryId
 */
export const decrementParentCategoryItemCount = async (parentCategoryId: string): Promise<void> => {
  const parent = await new Parse.Query('Category').get(parentCategoryId, USE_MASTER_KEY);
  const className = CATEGORY_ENTITY_CLASS_NAMES[parent.get('entity') as CategoryEntityEnum];

  await runJob('updateLinkedCategoryItemCountJob', { categoryIds: [parentCategoryId], className, isRecycleBin: true });
};
