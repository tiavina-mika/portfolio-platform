import { getContentCountryConstraint } from '@shared/utils';

import { getParseServer } from '@/config/parse-server.config';
import { WEB_COUNTRY_CODE } from '@/utils/constants';

import { filter, isNull } from './utils';

export const setValue = <T extends Record<string, any>>(
  parseObject: T,
  name: string,
  value: any
): void => {
  const oldValue = parseObject.get(name);

  if (isNull(value)) {
    parseObject.unset(name);
  }
  else if (oldValue !== value) {
    parseObject.set(name, value);
  }
};

/**
 * . null or undefined values aren't set
 * . a value is set only when it's different
 * @param parseObject
 * @param values
 * @param {Array|Set} names (optional), ensures we only set the right properties
 */
export const setValues = <T extends Record<string, any>>(
  parseObject: T,
  values: Record<string, any>,
  names: Record<string, any>
): void => {
  let newValues = { ...values };

  if (names) {
    newValues = filter(newValues, names);
  }
  for (const key in newValues) {
    /* eslint-disable-next-line no-prototype-builtins */
    if (!newValues.hasOwnProperty(key)) {
      continue;
    }
    const value = newValues[key];

    setValue(parseObject, key, value);
  }
};

/**
 * FormData values setter for Parse.Object
 * Note: not used for now
 * @param parseObj
 * @param formDataValues
 * @param properties
 */
export const setFormDataValues = <T extends Record<string, any>>(
  parseObj: T,
  formDataValues: FormData,
  properties: Set<string>
): void => {
  formDataValues.forEach((value, key) => {
    const oldValue = parseObj.get(key);

    if (properties.has(key) && oldValue !== value) {
      parseObj.set(key, value);
    }
    else if (isNull(value)) {
      parseObj.unset(key, value);
    }
  });
};

/**
 * Mocks a Parse.Object instance
 * used for testing purposes and to avoid using the real Parse SDK
 * @example with jest or storybook
 * @param className class of the Parse.Object ex: 'Article'
 * @param attributes values to set on the Parse.Object
 * @returns
 */
export const createMockParseObject = <O extends Record<string, any>>(
  className: string,
  attributes: Record<string, any> = {}
): O => {
  const Parse = getParseServer();
  const parseObject = new Parse.Object(className);

  parseObject.id = attributes.objectId || `fakeId_${Math.random().toString(36).substring(2, 11)}`;
  Object.keys(attributes).forEach(key => parseObject.set(key, attributes[key]));
  return parseObject;
};

/**
 * recursively converts a Parse.Object (or an array/tree of them) into a plain JSON value.
 * `id` is kept alongside the attributes (not just `objectId`) so existing `.id` call sites keep
 * working unchanged after a query result switches from a Parse.Object to raw JSON — needed so the
 * server/queries/* layer can be cached ('use cache' / unstable_cache serializes its return value,
 * which silently strips Parse.Object methods like `.get()`)
 * @param value
 * @returns
 */
export const serializeParseObject = <T = any>(value: unknown): T => {
  const Parse = getParseServer();

  if (Array.isArray(value)) {
    return value.map((item) => serializeParseObject(item)) as T;
  }

  if (value instanceof Parse.Object) {
    /*
     * `Parse` is a runtime value (from `getParseServer()`), not a type-level namespace, so
     * `instanceof` narrows `value` but TS can't infer its shape from it — cast explicitly instead
     */
    const object: any = value;
    const serialized: Record<string, any> = {
      id: object.id,
      createdAt: object.createdAt ? new Date(object.createdAt).toISOString() : undefined,
      updatedAt: object.updatedAt ? new Date(object.updatedAt).toISOString() : undefined,
    };

    for (const key of Object.keys(object.attributes)) {
      serialized[key] = serializeParseObject(object.attributes[key]);
    }

    return serialized as T;
  }

  return value as T;
};

type CountryQuery = {
  equalTo: (key: string, value: string) => unknown;
  notContainedIn: (key: string, values: string[]) => unknown;
};

/**
 * Keeps the editorial content (articles, pages) of the website's country. The default country also
 * keeps the rows saved before the field existed, which carry no country.
 * @param query the query to narrow, returned to keep chaining
 */
export const withContentCountry = <Q extends CountryQuery>(query: Q): Q => {
  const constraint = getContentCountryConstraint(WEB_COUNTRY_CODE);

  if ('equalTo' in constraint) {
    query.equalTo('country', constraint.equalTo);
  }
  else {
    query.notContainedIn('country', constraint.notContainedIn);
  }

  return query;
};
