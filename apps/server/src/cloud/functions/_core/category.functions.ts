import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { escapeText, isBoolean } from '@/utils/_core/utils';
import { getCategoriesSchema, getCategorySchema } from '@/validations/_core/category.validations';

import {
  attachCategoryListCounters, getCategoryIdsByItemsRange, getCategoryTabCounts,
} from '../../services/_core/category-list.service.cloud';
import { searchUserPointerQuery } from '../../services/_core/user.service.cloud';
import { Category } from '../../triggers/_core/category.triggers';
import { convertIdToPointer, filtersDatesQuery, multiBooleanQuery } from '../../utils/_core/parse.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'getCategories',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
      include = [],
    } = request.params;
    let query = new Parse.Query(Category);

    if (search) {
      /*
       * full text search
       * should be before all other queries
       */
      if (search.user) {
        // search category by user name or email
        searchUserPointerQuery(query, search.user);
      }

      // search by translated texts
      if (search.text) {
        const text = escapeText(search.text);
        const or: any[] = [];

        locales.forEach((locale: string) => {
          or.push(
            // ex: translated.fr.name = "Sports"
            new Parse.Query(Category).matches('translated.' + locale + '.name', text)
          );
        });

        query = Parse.Query.or(...or);
      }

      if (search.name) {
        const text = escapeText(search.name);
        const or: any[] = [];

        locales.forEach((locale: string) => {
          or.push(
            new Parse.Query(Category).matches('translated.' + locale + '.name', text)
          );
        });

        query = Parse.Query.or(...or);
      }

      if (search.entity) query.equalTo('entity', search.entity);
      if (isBoolean(search.active)) query.equalTo('active', search.active);

      // children of a given parent category (subcategories)
      if (search.parentCategory) {
        query.equalTo('parentCategory', convertIdToPointer('Category', search.parentCategory));
      }

      // root categories only (no parentCategory)
      if (search.rootOnly) query.doesNotExist('parentCategory');

      /*
       * where the category sits in the tree. Read off `parentCategory` alone rather than off a
       * stored depth: the level is what having a parent means, and a stored copy of it would go
       * stale the moment a category is reparented.
       */
      if (search.level === 'root') query.doesNotExist('parentCategory');
      if (search.level === 'subcategory') query.exists('parentCategory');

      /*
       * how much a category files is summed across the articles and pages pointing at it, so the
       * bound cannot be compared inside this query — it is resolved to category ids first. The
       * maximum comes back as the categories that overshoot it, since a category filing nothing at
       * all satisfies any maximum but has no row in that aggregate to be listed by.
       */
      if (search.minItems !== undefined || search.maxItems !== undefined) {
        const { atLeastMinIds, aboveMaxIds } = await getCategoryIdsByItemsRange(
          search.minItems,
          search.maxItems
        );

        if (atLeastMinIds) {
          query.containedIn('objectId', atLeastMinIds);
        }

        if (aboveMaxIds?.length) {
          query.notContainedIn('objectId', aboveMaxIds);
        }
      }

      // query dates
      filtersDatesQuery(query, search);

      // [true, false] query
      multiBooleanQuery(query, search.active, 'active');
    }

    query
      /*
       * `image` is not drawn in any column, but the edit dialog opens on the row the list already
       * holds rather than re-fetching it — leaving it out would blank the image of every category
       * edited from the list
       */
      .select([
        'translated', 'code', 'entity', 'active', 'deleted', 'itemCount', 'hasSubcategories',
        'image', 'user', 'updatedBy', 'parentCategory', ...include,
      ])
      .limit(+limit)
      .skip(+skip)
      .exists('user')
      /*
       * the name cell prints the whole ancestor path, and a category can sit three levels deep —
       * one level of `parentCategory` would leave the middle of that path as a bare pointer
       */
      .include(['user', 'updatedBy', 'parentCategory', 'parentCategory.parentCategory', ...include]);

    if (filters) {
      if (isBoolean(filters?.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }
    }

    if (order === 'desc') {
      query.descending(orderBy);
    }
    else {
      query.ascending(orderBy);
    }

    const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

    /*
     * how many subcategories hang under each category and how much content it files — read for the
     * whole page of results at once, since the persisted `itemCount` folds the two together and
     * cannot be split back apart. The rebuilt objects replace the fetched ones: a Cloud Function
     * cannot hand back an object holding unsaved changes (see `withComputedFields`).
     */
    result.results = await attachCategoryListCounters(result.results);

    /*
     * how many categories each tab of the list holds — the count of the tab the reader is not on
     * cannot be derived from the rows just fetched, and the strip states both at once
     */
    result.tabCounts = await getCategoryTabCounts();

    return result;
  }, ['find'], collections.Category),
  parseFunctionValidation(getCategoriesSchema)
);

Parse.Cloud.define(
  'getCategory',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const category = await new Parse.Query(Category)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .include(['createdBy', ...include])
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!category) return false;

    return category;
  }, ['get'], collections.Category),
  parseFunctionValidation(getCategorySchema)
);
