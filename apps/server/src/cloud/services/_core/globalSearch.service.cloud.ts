import { collections, GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY, USE_MASTER_KEY } from '@/constants/_core/constants';
import { CONTENT_CLASSES, COUNTRY_SCOPED_BULK_CLASSES } from '@/constants/_core/country-scope.constants';
import { getAgentAllowedCountries } from '@/utils/_core/agent-context.utils';
import { toPhoneSearchDigits } from '@/utils/_core/phone.utils';
import { escapeText } from '@/utils/_core/utils';

import { buildClassQuery } from './badgeCount.service.cloud';
import { getNotificationTextSearchQuery } from './notification-list.service.cloud';
import { buildUserTextQuery } from './user.service.cloud';
import { Article } from '../../triggers/_core/article.triggers';
import { Category } from '../../triggers/_core/category.triggers';
import { Contact } from '../../triggers/_core/contact.triggers';
import { Page } from '../../triggers/_core/page.triggers';
import { Payment } from '../../triggers/_core/payment.triggers';
import { contentCountriesQuery } from '../../utils/_core/parse.utils.cloud';
import { hasRight } from '../../utils/_core/role.utils.cloud';
import { getUserPhoneSearchQueries } from '../../utils/_core/user-search.utils.cloud';

export type GlobalSearchQuery = (rawText: string, locales: string[]) => Promise<Parse.Object[]>;

export interface IGlobalSearchEntityConfig {
  className: string;
  search: GlobalSearchQuery;
}

const searchArticles: GlobalSearchQuery = (rawText, locales) => {
  const text = escapeText(rawText);
  const or = locales.map((locale) => new Parse.Query(Article).matches(`translated.${locale}.title`, text));

  return Parse.Query.or(...or)
    .equalTo('deleted', false)
    .select(['translated', 'updatedAt'])
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

const searchCategories: GlobalSearchQuery = (rawText, locales) => {
  const text = escapeText(rawText);
  const or = locales.map((locale) => new Parse.Query(Category).matches(`translated.${locale}.name`, text));

  return Parse.Query.or(...or)
    .select(['translated', 'updatedAt'])
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

const searchPages: GlobalSearchQuery = (rawText, locales) => {
  const text = escapeText(rawText);
  const or = locales.map((locale) => new Parse.Query(Page).matches(`translated.${locale}.title`, text));

  return Parse.Query.or(...or)
    .equalTo('deleted', false)
    .select(['translated', 'updatedAt'])
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

const searchContacts: GlobalSearchQuery = (rawText) => {
  const text = escapeText(rawText);
  // a requester who wrote with a number only is found by it, whatever way the operator types it
  const phoneDigits = toPhoneSearchDigits(rawText);

  return Parse.Query.or(
    new Parse.Query(Contact).matches('name', text),
    new Parse.Query(Contact).matches('email', text),
    new Parse.Query(Contact).matches('message', text),
    ...(phoneDigits ? [new Parse.Query(Contact).matches('phone', escapeText(phoneDigits))] : [])
  )
    .equalTo('deleted', false)
    .select(['name', 'email', 'phone', 'message', 'createdAt'])
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

const searchUsers: GlobalSearchQuery = (rawText) => {
  const text = escapeText(rawText);

  return Parse.Query.or(
    new Parse.Query(Parse.User).matches('firstName', text),
    new Parse.Query(Parse.User).matches('lastName', text),
    new Parse.Query(Parse.User).matches('username', text),
    new Parse.Query(Parse.User).matches('email', text),
    // a member who signed up by phone has no email: their number is what finds them
    ...getUserPhoneSearchQueries(rawText)
  )
    .select(['firstName', 'lastName', 'username', 'email', 'phone', 'image'])
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

const searchPayments: GlobalSearchQuery = (rawText) => {
  // read off the members themselves: the snapshot copy keeps a first and a last name, no `name`
  const usersQuery = buildUserTextQuery(rawText);

  return Parse.Query.or(
    new Parse.Query(Payment).matchesQuery('payer', usersQuery),
    new Parse.Query(Payment).matchesQuery('receiver', usersQuery)
  )
    .equalTo('deleted', false)
    .select(['snapshot', 'status', 'createdAt'])
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

const searchNotifications: GlobalSearchQuery = (rawText) => {
  return getNotificationTextSearchQuery(rawText)
    .equalTo('deleted', false)
    .select(['snapshot', 'type', 'createdAt'])
    .limit(GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY)
    .find(USE_MASTER_KEY);
};

const GLOBAL_SEARCH_ENTITIES = new Map<string, IGlobalSearchEntityConfig>([
  ['article', { className: collections.Article, search: searchArticles }],
  ['category', { className: collections.Category, search: searchCategories }],
  ['page', { className: collections.Page, search: searchPages }],
  ['contact', { className: collections.Contact, search: searchContacts }],
  ['user', { className: collections.User, search: searchUsers }],
  ['payment', { className: collections.Payment, search: searchPayments }],
  ['notification', { className: collections.Notification, search: searchNotifications }],
]);

/**
 * Drops the hits that belong to a country the acting agent's roles do not cover. Each entity runs its
 * own text search with the master key, so the hits are checked afterwards with one query on their ids,
 * which carries the countries of the agent. A class with no country is left as it is.
 */
const keepAgentCountries = async (className: string, hits: Parse.Object[]): Promise<Parse.Object[]> => {
  const allowed = getAgentAllowedCountries();
  const isContent = CONTENT_CLASSES.includes(className);

  if (!allowed || hits.length === 0 || !(isContent || COUNTRY_SCOPED_BULK_CLASSES.includes(className))) {
    return hits;
  }

  const query = isContent ? new Parse.Query(className) : buildClassQuery(className);

  if (isContent) contentCountriesQuery(query, allowed);

  const kept = await query
    .containedIn('objectId', hits.map((hit) => hit.id))
    .select(['objectId'])
    .limit(hits.length)
    .find(USE_MASTER_KEY);
  const keptIds = new Set(kept.map((hit) => hit.id));

  return hits.filter((hit) => keptIds.has(hit.id));
};

/**
 * Lets a business domain (ride/vehicle/request, ...) register its own search entity without
 * this generic service importing any domain type directly — mirrors the dashboard/statistics
 * registry pattern.
 */
export const registerGlobalSearchEntity = (key: string, config: IGlobalSearchEntityConfig): void => {
  GLOBAL_SEARCH_ENTITIES.set(key, config);
};

/**
 * queries every entity the given user has `find` rights on, in parallel, and returns only the
 * non-empty groups — the BO client renders whatever collections come back without re-checking
 * rights itself, this is the single enforcement point
 */
export const globalSearch = async (
  user: Parse.User,
  text: string,
  locales: string[]
): Promise<Partial<Record<string, Parse.Object[]>>> => {
  const entries = [...GLOBAL_SEARCH_ENTITIES.entries()];

  const allowedEntries = await Promise.all(
    entries.map(async ([key, config]) => {
      const hasFindRight = await hasRight(user, config.className, ['find']);

      return hasFindRight
        ? [key, config] as const
        : null;
    })
  );

  const results = await Promise.all(
    allowedEntries
      .filter((entry): entry is [string, IGlobalSearchEntityConfig] => entry !== null)
      .map(async ([key, config]) => {
        const hits = await config.search(text, locales);

        return [key, await keepAgentCountries(config.className, hits)] as const;
      })
  );

  return Object.fromEntries(results.filter(([, items]) => items.length > 0));
};
