import Parse from 'parse';

import { LOCAL_NETWORK_HOSTNAME, SERVER_PORT } from './constants';
import { filter, isNull } from './utils';

/**
 * initialize parse server
 * depending in the environment, it will use the local server or the remote server
 */
export const initializeParse = () => {
  Parse.initialize(import.meta.env.VITE_PARSE_APP_ID, 'xxx');

  const {
    origin,
  } = window.location;

  const LOCAL = origin.includes(LOCAL_NETWORK_HOSTNAME) || origin.includes('127.0.0.1');
  const PREPROD = origin.includes('preprod');
  const PROD = !LOCAL && !PREPROD;

  window.IS_LOCAL = LOCAL;
  window.IS_PREPROD = PREPROD;
  window.IS_PROD = PROD;

  const parseServerURL = LOCAL
    ? `http://localhost:${SERVER_PORT}/parse`
    : `${origin}/parse`;

  Parse.serverURL = parseServerURL;
};

/**
 * get values from parseObject
 * @param {Parse.Object} parseObject
 * @param {Array|Set} fields
 * @param [dest]
 */
export const getValues = (parseObject: Parse.Object, fields: string[], dest: Record<string, any> = {}) => {
  if (parseObject == null) {
    // makes it work with redux-form initialValues
    return {};
  }

  fields.forEach((field: string) => {
    const value = parseObject.get(field);

    if (value != null) {
      dest[field] = value;
    }
  });
  return dest;
};

export const setValue = (parseObject: Parse.Object, name: string, value: any): void => {
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
export const setValues = (
  parseObject: Parse.Object,
  values: Record<string, any>,
  names: Record<string, any>
): void => {
  if (names) {
    values = filter(values, names);
  }
  for (const key in values) {

    if (!values.hasOwnProperty(key)) {
      continue;
    }
    const value = values[key];

    setValue(parseObject, key, value);
  }
};

export const convertIdToPointer = (
  className: string,
  id: string
): Parse.Object => new Parse.Object(className, { objectId: id });

export const convertIdsToPointer = (className: string, ids: string[]): Parse.Object[] => {
  return ids.map((id: string) => convertIdToPointer(className, id));
};
