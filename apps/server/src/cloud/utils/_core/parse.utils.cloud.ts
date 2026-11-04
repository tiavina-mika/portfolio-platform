import {
  endOfInZone, getContentCountriesConstraint, getContentCountryConstraint, startOfInZone,
} from '@shared/utils';
import isEqual from 'lodash/isEqual.js';

import type { DateType } from '@/types/utils.type';

import { STATISTICS_TIME_ZONE } from '@/constants/_core/statistics.constants';
import { getAgentAllowedCountries } from '@/utils/_core/agent-context.utils';
import { unixToDate } from '@/utils/_core/date.utils';


/**
 * checked if a value of a field in database is changed
 * @param newObject
 * @param oldObject
 * @param propertyName
 * @returns
 */
export const isFieldChanged = (
  newObject: Parse.Attributes | Parse.User,
  oldObject: Parse.Attributes | Parse.User | undefined,
  propertyName: string
): boolean => {
  if (!oldObject) return false;
  return !isEqual(newObject.get(propertyName), oldObject.get(propertyName));
};

/**
 * check if a subfield (level 2 object) is changed
 * @param newObject
 * @param oldObject
 * @param field
 * @param level2Field
 * @param level3Field
 * @returns
 */
type IsSubFieldChangedType = {
  newObject: Parse.Attributes | Parse.User;
  oldObject: Parse.Attributes | Parse.User | undefined;
  field: string;
  level2Field: string;
  level3Field?: string;
};
export const isSubFieldChanged = ({
  newObject,
  oldObject,
  field,
  level2Field,
  level3Field,
}: IsSubFieldChangedType): boolean => {
  if (!oldObject) return false;

  if (!level3Field) {
    if (!isFieldChanged(newObject, oldObject, field)) return false;
    return !isEqual(newObject.get(field)[level2Field], oldObject.get(field)[level2Field]);
  }

  if (!isFieldChanged(newObject, oldObject, field)) return false;

  // @example article.translated.fr
  if (isEqual(newObject.get(field)[level2Field], oldObject.get(field)[level2Field])) return false;

  // @example article.translated.fr.content
  return !isEqual(
    newObject.get(field)[level2Field][level3Field],
    oldObject.get(field)[level2Field][level3Field]
  );
};

/**
 *  transform a parse object unix timestamp value to date
 *  format birthday field from unix to js date
 *  the React Native SDK can not save the date as a js date format
 *  so from the UI form, save it as unix timestamp
 * @param {*} parseObj
 * @param {*} field
 * @returns
 */
export const changeParseFieldUnixToDate = (parseObj: Record<string, any>, field: string): void => {
  if (!parseObj) {
    throw new Error('Parse object undefined');
  }

  // if the field does not exist
  if (!parseObj.has(field)) return;

  const value = parseObj.get(field);

  if (typeof value === 'number') {
    parseObj.set(field, unixToDate(value));
  }
};

/**
 * generate incremented slug
 * @param className
 * @param slug
 * @param workspaceId
 * @returns
 */
export const getIncrementedSlug = async (
  className: string | (new (...args: any[]) => Parse.Object),
  slug: string
): Promise<string> => {
  const query = new Parse.Query(className).matches('slug', new RegExp('^' + slug, 'i'));

  // get the last slug with max number
  const viewWithSameSlug = await query.ascending('slug').first();

  if (viewWithSameSlug) {
    const splittedSlugs = viewWithSameSlug.get('slug').split('-');
    const numberToIncrement = splittedSlugs[splittedSlugs.length - 1];
    const isNotFirst = numberToIncrement && !Number.isNaN(+numberToIncrement);
    const number = isNotFirst ? numberToIncrement : 0;
    const incrementNumber = +number + 1;

    if (isNotFirst) {
      splittedSlugs[splittedSlugs.length - 1] = incrementNumber.toString();
    }
    else {
      splittedSlugs.push(incrementNumber.toString());
    }
    const newIncrementedSlug = splittedSlugs.join('-');

    return newIncrementedSlug;
  }

  return slug;
};

/**
 * check if any given fields are changed
 * @param newObject
 * @param oldObject
 * @param fields
 * @returns
 */
export const hasFieldsChanged = (
  newObject: Parse.Attributes,
  oldObject: Parse.Attributes,
  fields: string[] = []
): boolean => {
  return fields.some((field: string): boolean => isFieldChanged(newObject, oldObject, field));
};

/**
 * query a date field against an optionally open-ended range
 * @param query
 * @param field field to query
 * @param range [start, end] — either side may be null to leave that bound open
 * @returns
 */
export const dateRangeQuery = (
  query: Parse.Query,
  field: string,
  range: (DateType | null)[]
): void => {
  if (!Array.isArray(range)) return;
  const start = range[0];
  const end = range[1];

  // only a start date picked → from that date onward, no upper bound
  if (start) {
    query.greaterThanOrEqualTo(field, startOfInZone(start, STATISTICS_TIME_ZONE, 'day'));
  }
  // only an end date picked → up to that date, no lower bound
  if (end) {
    query.lessThanOrEqualTo(field, endOfInZone(end, STATISTICS_TIME_ZONE, 'day'));
  }
};

/**
 * query multiple date fields
 * @param query
 * @param search
 */
export const filtersDatesQuery = (
  query: Parse.Query,
  search: Record<string, string | (DateType | null)[]>,
  otherDateFields: string[] = []
) => {
  ['createdAt', 'updatedAt', ...otherDateFields].forEach((field) => {
    if (search[field]) {
      dateRangeQuery(query, field, search[field] as (DateType | null)[]);
    }
  });
};

/**
 * query multiple boolean fields (array of boolean)
 * if the array has 2 values, it will query for true and false => so no need to query
 * @param query parse query
 * @param booleanSearches ex: search.active = [true, false]
 * @param field database field
 * @returns
 */
export const multiBooleanQuery = (
  query: Parse.Query,
  booleanSearches: boolean[] | undefined,
  field: string
) => {
  if (!booleanSearches) return;
  // if online or offline => [true, false]
  if (booleanSearches.length !== 2) {
    // offline
    if (booleanSearches.length === 1 && !booleanSearches[0]) {
      query.notEqualTo(field, true);
      // online
    }
    else {
      query.equalTo(field, true);
    }
  }
};

/**
 * Keeps the rows of some countries, crossing with a country condition the query already carries
 * instead of replacing it: asking for "MG" on an agent who covers "MG" and "FR" must stay "MG", not
 * widen to both.
 * @param query parse query, narrowed in place
 * @param countryCodes the countries to keep; none matches nothing
 */
export const keepCountries = (query: Parse.Query, countryCodes: string[]): void => {
  const existing = (query.toJSON().where as Record<string, unknown> | undefined)?.country;
  const requested = typeof existing === 'string'
    ? [existing]
    : (existing as { $in?: string[] } | undefined)?.$in;

  query.containedIn(
    'country',
    requested ? requested.filter((code) => countryCodes.includes(code)) : countryCodes
  );
};

/**
 * Keeps a query inside the countries the acting back-office agent may work on. For the code that
 * reads with the master key, which the country triggers never narrow. Outside a back-office request,
 * or for an agent nothing limits, the query is left as it is.
 * @param query parse query, narrowed in place
 * @returns the same query
 */
export const scopeToAgentCountries = <Q extends Parse.Query>(query: Q): Q => {
  const allowed = getAgentAllowedCountries();

  if (allowed) keepCountries(query, allowed);

  return query;
};

/**
 * keeps the editorial content (articles, pages) of one country. The default country also keeps the
 * rows saved before the field existed, which carry no country.
 * @param query parse query, narrowed in place
 * @param countryCode the country whose content is read
 */
export const contentCountryQuery = (query: Parse.Query, countryCode?: string | null): void => {
  const constraint = getContentCountryConstraint(countryCode);

  if ('equalTo' in constraint) {
    query.equalTo('country', constraint.equalTo);
  }
  else {
    query.notContainedIn('country', constraint.notContainedIn);
  }
};

/**
 * `contentCountryQuery` for several countries: the back-office lists of articles and pages, filtered
 * on some countries or kept inside the ones the editor's roles cover. A row with no country is read as
 * the default country's here too, as on the website.
 * @param query parse query, narrowed in place
 * @param countryCodes the countries to keep; none matches nothing
 */
export const contentCountriesQuery = (query: Parse.Query, countryCodes: string[]): void => {
  const constraint = getContentCountriesConstraint(countryCodes);

  if ('containedIn' in constraint) {
    keepCountries(query, constraint.containedIn);
  }
  else {
    query.notContainedIn('country', constraint.notContainedIn);
  }
};

/**
 * convert a id to a pointer
 * NOTE: the className must be a string
 * @param className
 * @param id
 * @returns
 */
export const convertIdToPointer = <O extends Parse.Object | Parse.User>(
  className: string,
  id: string
): O => {
  const PointerClass = Parse.Object.extend(className);
  const pointer = new PointerClass();

  pointer.id = id;

  return pointer as O;
};

export const convertIdsToPointer = <O extends Parse.Object | Parse.User>(
  className: string, ids: string[]
): O[] => {
  return ids.map((id: string) => convertIdToPointer<O>(className, id));
};

/**
 * The caller's address as Express derived it from the proxies it is configured to trust. Never the
 * raw `X-Forwarded-For` header: the caller writes that one, so a script could send a new value on
 * every request and walk around every per-address limit.
 */
export const getClientIp = (request: any): string => {
  const ip = request.ip || request.connection?.remoteAddress;

  return ip;
};

export const createQuery = (collection: string, {
  include = [],
  select = [],
  filters = [],
}: {
  include?: string[];
  select?: string[];
  filters?: { key: string; value: any }[];
} = {}) => {
  let query = new Parse.Query(collection);

  if (include.length) query = query.include(include);
  if (select.length) query = query.select(select);
  query = query.equalTo('deleted', false);
  filters.forEach(({ key, value }) => query = query.equalTo(key, value));
  return query;
};

export const checkIsParseDateObject = (value: any): boolean => {
  return value && typeof value === 'object' && value.__type === 'Date' && typeof value.iso === 'string';
};

/**
 * When we receive a date from a Parse object, then convert it to json with toJSON method
 * the date will be in the format { __type: 'Date', iso: '2022-01-01T00:00:00.000Z' }
 * so we need to convert it to a js date object
 * @param value
 * @returns
 */
export const parseDateFromParseObjectToJSON = (value: Date | { __type: 'Date'; iso: string } | string | null): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'string') {
    const d = new Date(value);

    return isNaN(d.getTime()) ? null : d;
  }

  if (checkIsParseDateObject(value)) {
    const d = new Date(value.iso);

    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

/**
 * Reads the object id out of the `_id` an aggregate `$group` returns when it groups on a pointer
 * field. The shape depends on what the storage adapter emits — the `<Class>$<objectId>` string
 * Mongo stores, the object Parse rebuilds it into, or the bare id — so all three are handled
 * rather than one of them assumed.
 * @param groupId the `_id`/`objectId` of one aggregate group
 * @returns the object id, or undefined when the group id carries none
 */
export const readGroupedObjectId = (groupId: unknown): string | undefined => {
  if (typeof groupId === 'string') return groupId.split('$').pop();
  if (groupId && typeof groupId === 'object') {
    return (groupId as { objectId?: string }).objectId;
  }

  return undefined;
};

/**
 * The value MongoDB stores for a pointer field: `<Class>$<objectId>`.
 *
 * An aggregate pipeline reaches the storage layer with its `$match` stage untranslated, so a
 * pipeline filtering on a pointer has to name the stored column (`_p_<field>`) and the stored
 * value itself. A `{ __type: 'Pointer' }` value there matches nothing at all — and it fails
 * silently, as an empty result rather than an error.
 * @param className class the pointer points at
 * @param objectId id of the pointed object
 * @returns the stored representation of that pointer
 */
export const toStoredPointer = (className: string, objectId: string): string =>
  `${className}$${objectId}`;

/**
 * Rebuilds an object with extra, non-persisted fields on it — the way to hand a list row a fact
 * that is computed rather than stored.
 *
 * A plain `.set()` cannot be used for this. Every Cloud Function result goes through
 * `Parse._encode`, which serialises an object holding unsaved changes as a **bare pointer** — the
 * caller then receives `{ __type: 'Pointer', objectId }` and every single attribute is gone. It
 * fails silently: the request succeeds and the list simply renders empty rows. Going back through
 * `fromJSON` makes the extra fields server data instead of pending changes, so the object is clean
 * again and encodes in full.
 * @param object the fetched object
 * @param fields the computed fields to carry alongside its stored ones
 * @returns a new object holding both — the original is left untouched, so the caller must use this
 */
export const withComputedFields = <T extends Parse.Object>(
  object: T,
  fields: Record<string, unknown>
): T => {
  if (Object.keys(fields).length === 0) return object;

  /*
   * `fromJSON` is typed as returning an object whose id is optional, which does not overlap with
   * `Parse.Object` at the type level — the source here always comes from a query, so it carries an
   * `objectId` and `fromJSON` preserves it
   */
  return Parse.Object.fromJSON({
    ...object.toJSON(),
    className: object.className,
    ...fields,
  }) as unknown as T;
};

/**
 * A query on a class that carries a `country`, already kept inside the countries the acting
 * back-office agent may work on (see `scopeToAgentCountries`). The master-key counts and lists of the
 * back-office start from it.
 * @param className the collection
 */
export const newAgentQuery = (
  className: ConstructorParameters<typeof Parse.Query>[0]
): Parse.Query => (
  scopeToAgentCountries(new Parse.Query(className))
);

/**
 * The `$match` condition that keeps an aggregate inside the countries the acting back-office agent may
 * work on, to spread into the pipeline's first `$match`. Empty when nothing limits the agent.
 */
export const agentCountryMatch = (): { country?: { $in: string[] } } => {
  const allowed = getAgentAllowedCountries();

  return allowed ? { country: { $in: allowed } } : {};
};
