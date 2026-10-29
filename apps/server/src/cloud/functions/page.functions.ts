
import { USE_MASTER_KEY } from '@/utils/constants';
import { escapeText, isBoolean } from '@/utils/util';

import { searchUserPointerQuery } from '../services/user.service.cloud';
import { Page } from '../triggers/page.triggers';
import {
  convertIdToPointer, convertIdsToPointer, filtersDatesQuery, multiBooleanQuery,
} from '../utils/parse.utils.cloud';
import { fromBO } from '../utils/utils.cloud';

Parse.Cloud.define(
  'getPages',
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
    let query = new Parse.Query(Page);

    if (search) {
      /*
       * full text search
       * should be before all other queries
       */
      if (search.user) {
        // search page by user name or email
        await searchUserPointerQuery(query, search.user);
      }

      // search by translated texts
      if (search.text) {
        const text = escapeText(search.text);
        const or: any[] = [];

        locales.forEach((locale: string) => {
          or.push(
            // ex: translated.fr.title = "Bonjour"
            new Parse.Query(Page).matches('translated.' + locale + '.name', text),
            new Parse.Query(Page).matches('translated.' + locale + '.title', text),
            new Parse.Query(Page).matches('translated.' + locale + '.description', text),
            new Parse.Query(Page).matches('translated.' + locale + '.content', text)
          );
        });

        query = Parse.Query.or(...or);
      }

      // search by a category
      if (search.category) {
        query.equalTo('categories', convertIdToPointer('Category', search.category));
      }

      // search by translated fields
      ['name', 'title', 'metaTitle', 'metaDescription', 'slug', 'tags', 'content'].forEach((field: string) => {
        if (search[field]) {
          const or: any[] = [];

          locales.forEach((locale: string) => {
            const key = `translated.${locale}.${search[field]}`;

            or.push(
              new Parse.Query(Page).matches(key, escapeText(search[field]))
            );
          });

          query = Parse.Query.or(...or);
        }
      });

      // query dates
      filtersDatesQuery(query, search);

      // [true, false] query
      multiBooleanQuery(query, search.active, 'active');
    }

    query.limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .exists('user')
      .include(['user', 'updatedBy', ...include]);

    if (filters) {
      // override the deleted query below
      if (isBoolean(filters?.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }

      if (filters.categories) {
        query.containedIn('categories', convertIdsToPointer('Category', filters.categories));
      }

      if (filters.category) {
        query.equalTo('categories', convertIdToPointer('Category', filters.category));
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
  'getPage',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const page = await new Parse.Query(Page)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .include(['createdBy', ...include])
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!page) return false;

    return page;
  })
);
