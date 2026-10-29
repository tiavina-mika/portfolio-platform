
import { USE_MASTER_KEY } from '@/utils/constants';
import { escapeText, isBoolean } from '@/utils/util';

import { searchUserPointerQuery } from '../services/user.service.cloud';
import { Category } from '../triggers/category.triggers';
import { filtersDatesQuery, multiBooleanQuery } from '../utils/parse.utils.cloud';
import { fromBO, parseFunction } from '../utils/utils.cloud';

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
    } = request.params;
    let query = new Parse.Query(Category);

    if (search) {
      /*
       * full text search
       * should be before all other queries
       */
      if (search.user) {
        // search category by user name or email
        await searchUserPointerQuery(query, search.user);
      }

      // search by translated texts
      if (search.text) {
        const text = escapeText(search.text);
        const or: any[] = [];

        locales.forEach((locale: string) => {
          or.push(
            // ex: translated.fr.name = "Littérature"
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

      // query dates
      filtersDatesQuery(query, search);

      // [true, false] query
      multiBooleanQuery(query, search.active, 'active');
    }

    query.limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .exists('user')
      .include(['user', 'updatedBy']);

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

    return result;
  })
);

Parse.Cloud.define(
  'getCategory',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const category = await new Parse.Query(Category)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .include(['createdBy', ...include])
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!category) return false;

    return category;
  })
);
