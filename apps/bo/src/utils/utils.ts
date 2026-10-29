import { cutText } from '@shared/utils';
import escapeRegExp from 'lodash/escapeRegExp';
import { ReactNode } from 'react';
import { capitalize } from 'string-ts';

import type { FieldErrors } from 'react-hook-form';

import { IPagination, IQueriesInput, ISelectOption } from '@/types/app.type';

import {
  APP_NAME, CURRENCY, PERSISTED_STATE_KEY, SERVER_PORT, WEBSITE_URL,
} from './constants';
import { boPalette, websitePalette } from './theme.utils';

export const wait = (ms = 1000): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const isCleanedString = (string: string | Record<string, any> | number): boolean => {
  return !!(!string || typeof string !== 'string' || (string?.trim().length === 0));
};

export const capitalizeFirstLetter = (string: string): string => {
  if (isCleanedString(string)) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const lowerFirstLetter = (string: string): string => {
  if (isCleanedString(string)) return '';
  return string.charAt(0).toLocaleLowerCase() + string.slice(1);
};

export const parseDeepJSON = (json: string): Record<string, any> => {
  const object = JSON.parse(json);
  const transformedObject: Record<string, any> = {};

  for (const key of Object.keys(object)) {
    if (typeof object[key] !== 'object') {
      const nestedObject = JSON.parse(object[key]);

      transformedObject[key] = nestedObject;
    }
    else {
      transformedObject[key] = object[key];
    }
  }
  return transformedObject;
};

export const generateToken = (n = 22): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';

  for (let i = 0; i < n; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
};

/**
 * add currency to price
 * @param price
 * @returns
 */
export const formatPriceWithCurrency = (price = 0): string => {
  const text = price + ' ' + CURRENCY;

  return text;
};

/**
 * store data to the local storage
 * @param key key of the storage
 * @param value value to store
 */
export const setLocalStorage = (key: string, value: Record<string, any> | string): void => {
  try {
    if (!key || !value) {
      throw new Error('Missing key and data params');
    }
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);

    localStorage.setItem(key, valueToStore);
  }
  catch (e) {
    console.error('setLocalStorage error:', e);
  }
};


/**
 * get the stored data to the local storage
 * @param key key of the storage
 */
export const getLocalStorage = (key: string): any => {
  try {
    if (!key) {
      throw new Error('Missing key params');
    }
    const value = localStorage.getItem(key);

    return value;
  }
  catch (e) {
    console.error('getLocalStorage error:', e);
  }
};

/**
 * remove stored value to the local storage
 * @param key key of the storage
 */
export const removeLocalStorage = (key: string = PERSISTED_STATE_KEY): void => {
  try {
    if (!key) {
      throw new Error('Missing key params');
    }
    localStorage.removeItem(key);
  }
  catch (e) {
    console.error('deleteLocalStorage error:', e);
  }
};

/**
 * get the server url
 * we need it to connect to the parse server or an server side api (ex: via axios)
 * NOTE: this function should be called after defining the window.LOCAL, window.PREPROD, window.PROD first
 * see: initParse function
 * @returns
 */
export const getServerUrl = (): string => {
  if (window.IS_LOCAL) {
    const {
      location,
    } = window;

    return location.protocol + '//' + location.hostname + ':' + SERVER_PORT;
  }

  return import.meta.env.VITE_SERVER_URL ?? '';
};

/**
 * get the client url (website)
 * we need it mainly to redirect to the website
 * @returns
 */
export const getWebsiteUrl = (): string => {
  if (window.IS_LOCAL) {
    return WEBSITE_URL.local;
  }

  return import.meta.env.VITE_WEBSITE_URL ?? '';
};

/**
 * head html title
 * @param {string} title
 * @returns {string}
 */
export const formatPageTitle = (title: string): string => {
  const appName = capitalizeFirstLetter(APP_NAME);

  if (title) {
    return title + ' - ' + appName;
  }

  return appName;
};

/**
 * @param object
 * @param {array|Set} names
 * @returns {*}
 */

export const filter = (object: Record<string, any>, names: Record<string, any>): Record<string, any> => {
  return Object.keys(object)
    .filter(key => (names.has
      ? names.has(key)
      : names.includes(key)))
    .reduce((obj, key) => {
      (obj as any)[key] = object[key];
      return obj;
    }, {});
};

/**
 * check if it's null ( 0, '', null, undefined, {}, [] )
 * @param item
 * @returns {boolean}
 */
export const isNull = (item: string): boolean => {
  /*
   * NOTE : typeof null = 'object', typeof undefined = 'undefined'
   * see Loose Equality Comparisons With == at ( https://www.sitepoint.com/javascript-truthy-falsy )
   */
  const typeOfValue = typeof item;

  switch (typeOfValue) {
    case 'string':
      return item.trim() === '';
    case 'object':
      return Object.is(item, null) || Object.values(item).every(val => isNull(val));
    case 'number':
      return !item;
    default:
      return item == null;
  }
};

export { cutText };

export const BOOLEAN_LIKES = ['true', 1, 'false', 0, '0', '1'];

export const isBoolean = (value: any): any => {
  return typeof value === 'boolean';
};

export const isString = (value: any): any => {
  return typeof value === 'string';
};

export const isStringOrNumber = (value: string | number | ReactNode): any => {
  return isString(value) || typeof value === 'number';
};

/**
 * change 'true' or 'false' to true or false
 * or 0 or 1 to false or true
 * @param value 0, 1, 'true', or 'false'
 * @returns
 */
export const booleanLikeToBoolean = (value: string | number): boolean => {
  if (['true', 1, '1'].includes(value)) {
    return true;
  }

  if (['false', 0, '0'].includes(value)) {
    return false;
  }

  return !!value;
};

// text to search
export const escapeText = (text: string): any => new RegExp(escapeRegExp(text), 'ig');

export const pagePaginationToQueryInput = (pagination: IPagination): IQueriesInput => {
  const values: Record<string, any> = {
    ...pagination,
    limit: pagination.rowsPerPage,
    skip: pagination.currentPage,
  };

  delete values.rowsPerPage;
  delete values.currentPage;

  return values as IQueriesInput;
};

/**
 * get errors for tabs (locale)
 * "title+fr": {
 *      "message": "Title required",
 *      "type": "too_small",
 *      "ref": {}
 *}
 * to
 * ['fr']
 */
export const getTranslatedFormTabErrors = (
  errors: FieldErrors,
  translatedFields: string[] | Set<string>
): string[] => {
  const locales: string[] = [];

  for (const key of Object.keys(errors)) {
    const splittedKey = key.split(':');
    const field = splittedKey[1];

    if (field) {
      /*
       * only for translated fields
       * transform to pure array to use includes (if Set)
       */
      const hasField = Array.from(translatedFields).includes(field);

      if (hasField) {
        const locale = splittedKey[splittedKey.length - 1];

        if (!locales.includes(locale)) {
          locales.push(locale);
        }
      }
    }
  }

  return locales;
};

export const getMUIColorsList = (): string[] => {
  const newColors: string[] = [];

  [...Object.values(websitePalette), ...Object.values(boPalette)].forEach(
    (color: Record<string | number, string> | string): void => {
      newColors.push(...Object.values(color));
    }
  );

  return newColors;
};

/**
 * for ulr name
 * my Site => my-site
 * @param {*} text
 * @param {*} separator
 * @returns
 */
export const slugify = (text: string, separator = '-'): string => {
  text = text.trim();
  text = text.toLowerCase();

  // remove accents, swap ñ for n, etc
  // eslint-disable-next-line @cspell/spellchecker
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
  // eslint-disable-next-line @cspell/spellchecker
  const to = 'aaaaaaeeeeiiiioooouuuunc------';

  for (let i = 0, l = from.length; i < l; i++) {
    text = text.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return text
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, '') // trim - from end of text
    .replace(/-/g, separator);
};

export const getOptionsByList = (items: string[]): ISelectOption[] => {
  return items.map(
    (item: string): ISelectOption => ({
      value: item,
      label: item,
    })
  );
};

/**
 * cut the meta title or meta description in submit form
 * this is used to limit the number of characters to submit
 * it's used with zod field schema validation (transform)
 */
export const cutMetaText = (limit: number) => (value: string) => {
  const textCut = cutText(value.trim(), limit);

  return capitalize(textCut);
};
