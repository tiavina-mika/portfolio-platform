import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';

import { readGroupedObjectId, withComputedFields } from '../../utils/_core/parse.utils.cloud';

type CategorySubcategoryCounts = {
  subcategoriesCount: number;
  activeSubcategoriesCount: number;
};

type CategoryItemCounts = {
  itemsCount: number;
  publishedItemsCount: number;
};

type SubcategoryCountsGroup = {
  objectId?: unknown;
  _id?: unknown;
  subcategoriesCount: number;
  activeSubcategoriesCount: number;
};

type ItemCountsGroup = {
  objectId?: unknown;
  _id?: unknown;
  itemsCount: number;
  publishedItemsCount: number;
};

/**
 * How many subcategories hang under each category, and how many of those are switched on. Grouped
 * over the whole `Category` class in one pass rather than counted per row: the list shows the
 * figure on every row it displays, and a count query per row would be one round trip per row.
 *
 * Categories with no parent all land in the same `null` group, which `readGroupedObjectId` reports
 * as no id at all — that group is the root categories themselves and belongs to no parent.
 */
const aggregateSubcategoryCounts = async (): Promise<Map<string, CategorySubcategoryCounts>> => {
  const pipeline = [
    { $match: { deleted: { $ne: true } } },
    {
      $group: {
        _id: '$parentCategory',
        subcategoriesCount: { $sum: 1 },
        activeSubcategoriesCount: { $sum: { $cond: ['$active', 1, 0] } },
      },
    },
  ];

  const groups: SubcategoryCountsGroup[] = await new Parse.Query(collections.Category)
    .aggregate(pipeline as any);

  const countsByParentId = new Map<string, CategorySubcategoryCounts>();

  groups.forEach((group) => {
    const parentId = readGroupedObjectId(group.objectId ?? group._id);

    if (!parentId) return;

    countsByParentId.set(parentId, {
      subcategoriesCount: group.subcategoriesCount,
      activeSubcategoriesCount: group.activeSubcategoriesCount,
    });
  });

  return countsByParentId;
};

/**
 * How much content each category actually files, and how much of that is live on the website.
 * Read from the two classes that can be categorised (articles and pages), since a category states
 * which of the two it is for but never holds the items back.
 *
 * `categories` is an array of pointers, so it is unwound before being grouped, and the group key is
 * the whole unwound element rather than a sub-field of it: an array element is stored as a pointer
 * object today, but a plain `<Class>$<objectId>` string is the other shape the adapter emits, and
 * reading a sub-field of that would silently group every row under `null`.
 *
 * Only live links are counted. Trashing a category moves it out of every item's `categories` and
 * into `deletedCategories`, so a category sitting in the recycle bin reports zero — which is what
 * it now files, not a figure lost.
 */
const aggregateItemCounts = async (): Promise<Map<string, CategoryItemCounts>> => {
  const pipeline = [
    { $match: { deleted: { $ne: true } } },
    { $unwind: '$categories' },
    {
      $group: {
        _id: '$categories',
        itemsCount: { $sum: 1 },
        publishedItemsCount: { $sum: { $cond: ['$active', 1, 0] } },
      },
    },
  ];

  const [articleGroups, pageGroups]: [ItemCountsGroup[], ItemCountsGroup[]] = await Promise.all([
    new Parse.Query(collections.Article).aggregate(pipeline as any),
    new Parse.Query(collections.Page).aggregate(pipeline as any),
  ]);

  const countsByCategoryId = new Map<string, CategoryItemCounts>();

  [...articleGroups, ...pageGroups].forEach((group) => {
    const categoryId = readGroupedObjectId(group.objectId ?? group._id);

    if (!categoryId) return;

    /*
     * a category belongs to one entity, so the two aggregates never describe the same id — the
     * previous entry is read back anyway rather than assuming it, so a category wrongly linked
     * from both classes reports the sum instead of losing half of it
     */
    const previous = countsByCategoryId.get(categoryId);

    countsByCategoryId.set(categoryId, {
      itemsCount: (previous?.itemsCount ?? 0) + group.itemsCount,
      publishedItemsCount: (previous?.publishedItemsCount ?? 0) + group.publishedItemsCount,
    });
  });

  return countsByCategoryId;
};

/**
 * Returns the categories of the list carrying the (non-persisted) subcategory and item counts.
 * They are what tells an editor whether a category is actually in use or an empty shelf, and none
 * of the four lives on the category itself — the persisted `itemCount` folds items and
 * subcategories into a single figure, which cannot be split back apart for the two columns.
 *
 * Rebuilt copies rather than the fetched objects mutated in place: see `withComputedFields` for
 * why a Cloud Function must never hand back an object holding unsaved changes. The caller has to
 * use the returned array.
 */
export const attachCategoryListCounters = async (
  categories: Parse.Object[]
): Promise<Parse.Object[]> => {
  if (categories.length === 0) return categories;

  const [subcategoryCounts, itemCounts] = await Promise.all([
    aggregateSubcategoryCounts(),
    aggregateItemCounts(),
  ]);

  return categories.map((category) => {
    const subcategories = subcategoryCounts.get(category.id);
    const items = itemCounts.get(category.id);

    return withComputedFields(category, {
      subcategoriesCount: subcategories?.subcategoriesCount ?? 0,
      activeSubcategoriesCount: subcategories?.activeSubcategoriesCount ?? 0,
      itemsCount: items?.itemsCount ?? 0,
      publishedItemsCount: items?.publishedItemsCount ?? 0,
    });
  });
};

export type CategoryTabCounts = {
  // the categories the list opens on
  all: number;
  // the ones sitting in the recycle bin
  deleted: number;
};

/**
 * How many categories each tab of the list holds. Both figures are read whichever tab is being
 * fetched: the strip states what there is to switch to, so the tab the reader is not on has to
 * carry its own total.
 *
 * Deliberately unaffected by the search and the filters applied to the list itself — a reader
 * narrowing the categories down to one is not told that the recycle bin has shrunk with it, and
 * the count they came for is the number of rows waiting in the other tab.
 *
 * `exists('user')` mirrors the list query: a category with no author is an artefact of an
 * interrupted creation and is not a row anywhere, so counting it would advertise a tab holding one
 * row less than it says.
 */
export const getCategoryTabCounts = async (): Promise<CategoryTabCounts> => {
  const countByTab = async (deleted: boolean): Promise<number> => (
    new Parse.Query(collections.Category)
      .equalTo('deleted', deleted)
      .exists('user')
      .count(USE_MASTER_KEY)
  );

  const [all, deleted] = await Promise.all([countByTab(false), countByTab(true)]);

  return { all, deleted };
};

export type CategoryItemsRangeIds = {
  // categories filing at least the requested minimum — `undefined` when no minimum was asked for
  atLeastMinIds?: string[];
  // categories filing more than the requested maximum, to exclude — `undefined` when no maximum was asked for
  aboveMaxIds?: string[];
};

/**
 * Turns an "items between min and max" filter into the two id lists a Parse query can apply. The
 * count is summed across the articles and pages pointing at the category, so it cannot be compared
 * inside the category query itself.
 *
 * The maximum is expressed as an exclusion rather than an inclusion on purpose: a category filing
 * nothing at all holds zero items and satisfies any maximum, but it has no row in the aggregate to
 * be listed by — only the categories that overshoot can be enumerated.
 */
export const getCategoryIdsByItemsRange = async (
  minItems?: number,
  maxItems?: number
): Promise<CategoryItemsRangeIds> => {
  const countsByCategoryId = await aggregateItemCounts();
  const entries = [...countsByCategoryId.entries()];

  /*
   * a minimum of zero excludes nothing, and applying it as an inclusion would wrongly drop the
   * categories filing nothing at all — they have no row in the aggregate to be listed by
   */
  const hasMinimum = minItems !== undefined && minItems > 0;

  return {
    atLeastMinIds: hasMinimum
      ? entries.filter(([, counts]) => counts.itemsCount >= minItems).map(([categoryId]) => categoryId)
      : undefined,
    aboveMaxIds: maxItems === undefined
      ? undefined
      : entries.filter(([, counts]) => counts.itemsCount > maxItems).map(([categoryId]) => categoryId),
  };
};
