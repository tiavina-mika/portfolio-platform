import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { escapeText, isBoolean } from '@/utils/_core/utils';

import { Contact } from '../../triggers/_core/contact.triggers';
import { filtersDatesQuery } from '../../utils/_core/parse.utils.cloud';

// search keys with dedicated handling below, excluded from the generic free-text `matches()` loop
const SEARCH_KEYS_WITH_DEDICATED_HANDLING = ['text', 'createdAt', 'updatedAt'];

type GetContactsFilters = {
  limit: number;
  skip: number;
  orderBy: string;
  order?: 'asc' | 'desc';
  filters?: { deleted?: boolean };
  search?: Record<string, any>;
  include?: string[];
};

export const getContactsService = async ({
  limit, skip, orderBy, order, filters, search, include = [],
}: GetContactsFilters): Promise<{ results: Parse.Object[]; count: number }> => {
  let query = new Parse.Query(Contact);

  if (search) {
    // full text search, before all other queries
    if (search.text) {
      const text = escapeText(search.text);
      const textQuery = Parse.Query.or(
        new Parse.Query(Contact).matches('email', text),
        new Parse.Query(Contact).matches('name', text),
        new Parse.Query(Contact).matches('message', text)
      );

      query = Parse.Query.and(query, textQuery);
    }

    Object.keys(search).forEach((key: string) => {
      if (search[key] && !SEARCH_KEYS_WITH_DEDICATED_HANDLING.includes(key)) {
        query.matches(key, escapeText(search[key]));
      }
    });

    // query dates
    filtersDatesQuery(query, search);
  }

  query.limit(+limit)
    .skip(+skip)
    .equalTo('deleted', false)
    .include(['deletedBy', ...include]);

  // overrides the deleted query above
  if (filters && isBoolean(filters.deleted)) {
    query.equalTo('deleted', filters.deleted);
  }

  if (order === 'desc') {
    query.descending(orderBy);
  }
  else {
    query.ascending(orderBy);
  }

  const result = await query.withCount().find(USE_MASTER_KEY);

  return result as unknown as { results: Parse.Object[]; count: number };
};

export const getContactByIdService = async (
  id: string,
  include: string[] = []
): Promise<Parse.Object | undefined> => {
  const contact = await new Parse.Query(Contact)
    .equalTo('objectId', id)
    .include(['updatedBy', 'seenBy', 'lastSeenBy', ...include])
    .first(USE_MASTER_KEY);

  return contact ?? undefined;
};
