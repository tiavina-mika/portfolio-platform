import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { scopeCountries } from '@/utils/_core/agent-context.utils';
import { escapeText, isBoolean } from '@/utils/_core/utils';
import {
  getPagesSchema, getPageSchema,
} from '@/validations/_core/page.validations';

import {
  attachPageListCounters, getPageIdsByBlocksRange, getPageTabCounts,
} from '../../services/_core/page-list.service.cloud';
import { searchUserPointerQuery } from '../../services/_core/user.service.cloud';
import { Page } from '../../triggers/_core/page.triggers';
import {
  contentCountriesQuery, convertIdToPointer, convertIdsToPointer, filtersDatesQuery, multiBooleanQuery,
} from '../../utils/_core/parse.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

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
      // full text search — should be before all other queries
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

      // search by translated fields
      ['name', 'title', 'metaTitle', 'metaDescription', 'slug', 'tags', 'content'].forEach((field: string) => {
        if (search[field]) {
          const or: any[] = [];

          locales.forEach((locale: string) => {
            or.push(
              new Parse.Query(Page).matches(`translated.${locale}.${field}`, escapeText(search[field]))
            );
          });

          query = Parse.Query.or(...or);
        }
      });

      /*
       * every constraint below is added after the `Parse.Query.or(...)` blocks above, which each
       * replace `query` outright — anything set on the previous instance is dropped with it
       */

      // search page by author name or email — the author is a pointer, so it goes through a sub-query
      if (search.user) {
        searchUserPointerQuery(query, search.user);
      }

      // search by a category
      if (search.category) {
        query.equalTo('categories', convertIdToPointer('Category', search.category));
      }

      /*
       * where the page is linked from. `linkLocations` holds every location at once, so a page
       * linked from both the menu and the footer matches either side of the filter.
       */
      if (search.linkLocation) {
        query.equalTo('linkLocations', search.linkLocation);
      }

      /*
       * how much content the page holds is summed across its sections, so the bound cannot be
       * compared inside this query — it is resolved to page ids first. The maximum comes back as
       * the pages that overshoot it, since a page with no section at all satisfies any maximum but
       * has no row in that aggregate to be listed by.
       */
      if (search.minBlocks !== undefined || search.maxBlocks !== undefined) {
        const { atLeastMinIds, aboveMaxIds } = await getPageIdsByBlocksRange(
          search.minBlocks,
          search.maxBlocks
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

    // the countries the agent's roles cover, whether or not a filter asks for any
    const countries = scopeCountries(search?.countries);

    if (countries) contentCountriesQuery(query, countries);

    query
      .select(['translated', 'code', 'country', 'updatedBy', 'active', 'deleted', ...include])
      .limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .exists('user')
      .include([...include]);

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

    /*
     * how many sections a page holds, how many of them are published, and how many blocks they add
     * up to — read for the whole page of results at once, since none of the three is stored on the
     * page itself. The rebuilt objects replace the fetched ones: a Cloud Function cannot hand back
     * an object holding unsaved changes (see `withComputedFields`).
     */
    result.results = await attachPageListCounters(result.results);

    /*
     * how many pages each tab of the list holds — the count of the tab the reader is not on cannot
     * be derived from the rows just fetched, and the strip states both at once
     */
    result.tabCounts = await getPageTabCounts();

    return result;
  }, ['find'], collections.Page),
  parseFunctionValidation(getPagesSchema)
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
  }, ['get'], collections.Page),
  parseFunctionValidation(getPageSchema)
);
