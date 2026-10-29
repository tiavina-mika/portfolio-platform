import dayjs from 'dayjs';
import isEqual from 'lodash/isEqual.js';

import type { DateType } from '@/types/utils.type';

import { unixToDate } from '@/utils/date.utils';

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
  const query = await new Parse.Query(className).matches('slug', new RegExp('^' + slug, 'i'));

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
 * query between 2 dates
 * @param query
 * @param field field to query
 * @param range [start, end]
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

  // greater or equal than start date
  if (start && !end) {
    query
      .greaterThanOrEqualTo(field, dayjs(start).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(start).endOf('day').toDate());
  }
  // lesser or equal than end date
  if (end && !start) {
    query
      .greaterThanOrEqualTo(field, dayjs(end).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(end).endOf('day').toDate());
  }
  // between 2 dates
  if (start && end) {
    query
      .greaterThanOrEqualTo(field, dayjs(start).startOf('day').toDate())
      .lessThanOrEqualTo(field, dayjs(end).endOf('day').toDate());
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
  otherDateFields = []
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
 * convert a id to a pointer
 * NOTE: the className must be a string
 * @param className
 * @param id
 * @returns
 */
export const convertIdToPointer = (
  className: string,
  id: string
): Parse.Object => new Parse.Object(className, { objectId: id });

export const convertIdsToPointer = (className: string, ids: string[]): Parse.Object[] => {
  return ids.map((id: string) => convertIdToPointer(className, id));
};

export const getClientIp = (request: any): string => {
  const headers = request.headers;
  const ip = headers['x-forwarded-for'] || request.ip || request.connection?.remoteAddress;

  return ip;
};
