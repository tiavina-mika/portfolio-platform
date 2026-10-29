import { getParseServer } from '@/config/parse-server.config';

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
