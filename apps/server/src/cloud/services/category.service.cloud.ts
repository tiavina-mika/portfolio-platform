
import { USE_MASTER_KEY } from '@/utils/constants';

import { runJob } from '../utils/job.utils.cloud';

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
 * @param category
 */
export const moveCategoryFromLinkedItems = async (
  category: Parse.Object
): Promise<void> => {
  const moveCategoryForItemsToTrash = async (query: Parse.Query) => {
    query.equalTo('categories', category);
    await query.each(async (item) => {
      // add category to deletedCategories (trash)
      item.add('deletedCategories', category);
      // remove category from categories
      item.remove('categories', category);

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
