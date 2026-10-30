import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { escapeText, isBoolean } from '@/utils/_core/utils';
import { getPageSectionsSchema } from '@/validations/_core/page.validations';

import { PageSection } from '../../triggers/_core/pageSection.triggers';
import { filtersDatesQuery, multiBooleanQuery } from '../../utils/_core/parse.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

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

      // query dates
      filtersDatesQuery(query, search);

      // [true, false] query
      multiBooleanQuery(query, search.active, 'active');
    }

    /*
     * NOTE: no `.exists('user')` here (unlike getPages/getArticles) — sections created before
     * the PageSection beforeSave trigger existed have no `user` field, and would be silently
     * hidden from the list if this filter were applied
     */
    query
      .select(['translated', 'active', 'blocks', 'user', 'updatedBy', 'deletedAt', ...include])
      .limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
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
  }, ['find'], collections.PageSection),
  parseFunctionValidation(getPageSectionsSchema)
);
