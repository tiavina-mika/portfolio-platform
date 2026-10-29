
import { USE_MASTER_KEY } from '@/utils/constants';
import { escapeText, isBoolean } from '@/utils/util';

import { Contact } from '../triggers/contact.triggers';
import {
  filtersDatesQuery, multiBooleanQuery,
} from '../utils/parse.utils.cloud';
import { fromBO } from '../utils/utils.cloud';

Parse.Cloud.define(
  'getContacts',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      include = [],
    } = request.params;

    let query = new Parse.Query(Contact);

    if (search) {
      /*
       * full text search
       * should be before all other queries
       */
      if (search?.user) {
        const text = escapeText(search.user);

        query = Parse.Query.or(
          new Parse.Query(Parse.User).matches('email', text),
          new Parse.Query(Parse.User).matches('lastName', text),
          new Parse.Query(Parse.User).matches('firstName', text)
        );
      }

      if (search.text) {
        const text = escapeText(search.text);

        query = Parse.Query.or(
          new Parse.Query(Contact).matches('email', text),
          new Parse.Query(Contact).matches('name', text),
          new Parse.Query(Contact).matches('message', text)
        );
      }


      Object.keys(search).forEach((key: string) => {
        if (search[key] && key !== 'user' && key !== 'text') {
          query.matches(key, escapeText(search[key]));
        }
      });

      // query.equalTo('name', search.name);

      // query dates
      filtersDatesQuery(query, search);

      // [true, false] query
      multiBooleanQuery(query, search.replied, 'replied');
    }

    query.limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .include(['user', 'repliedBy', 'deletedBy', ...include]);

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

Parse.Cloud.define(
  'getContact',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const contact = await new Parse.Query(Contact)
      .equalTo('objectId', id)
      .include(['user', 'updatedBy', ...include])
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!contact) return false;

    return contact;
  })
);
