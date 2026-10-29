
import { USE_MASTER_KEY } from '@/utils/constants';
import { escapeText, isBoolean } from '@/utils/util';

import { searchUserPointerQuery } from '../services/user.service.cloud';
import { PageSection } from '../triggers/page.triggers';
import {
  filtersDatesQuery, multiBooleanQuery,
} from '../utils/parse.utils.cloud';
import { fromBO } from '../utils/utils.cloud';

Parse.Cloud.define(
  'getPageSections',
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
    let query = new Parse.Query(PageSection);

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
            new Parse.Query(PageSection).matches('translated.' + locale + '.title', text),
            new Parse.Query(PageSection).matches('translated.' + locale + '.description', text)
          );
        });

        query = Parse.Query.or(...or);
      }

      // search by translated fields
      ['title', 'description'].forEach((field: string) => {
        if (search[field]) {
          const or: any[] = [];

          locales.forEach((locale: string) => {
            const key = `translated.${locale}.${search[field]}`;

            or.push(
              new Parse.Query(PageSection).matches(key, escapeText(search[field]))
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
