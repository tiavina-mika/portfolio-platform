import { formatAmount, formatAmountInCurrency } from '@shared/utils';
import escapeRegExp from 'lodash/escapeRegExp';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import { ReactNode } from 'react';
import { type FieldErrors } from 'react-hook-form';
import { capitalize } from 'string-ts';

import {
  APP_NAME, PERSISTED_STATE_KEY, SERVER_PORT, WEBSITE_URL,
} from '@/constants/_core/app.constants';
import { IPagination, IQueriesInput, ISelectOption } from '@/types/_core/app.type';
import { boPalette, websitePalette } from '@/utils/_core/theme/theme.utils';

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
 * An amount as a member reads it ("40 000 Ar") — the same formatter as the apps and the e-mails.
 * `currency` is the ISO code the amount is stored in (a payment's, a ride's, a booking's); left out,
 * the amount is read in the default country's currency, which only suits a figure that adds up
 * several payments.
 */
export const formatPriceWithCurrency = (price = 0, currency?: string | null): string => (
  currency ? formatAmountInCurrency(price, currency) : formatAmount(price)
);

// add distance unit to distance
export const formatDistanceWithUnit = (distance = 0, unit = 'km'): string => {
  return distance + ' ' + unit;
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
 * head html element title
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
  const multipleOfValue = typeof item;

  switch (multipleOfValue) {
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

export const cutText = (text: string, limit = 100): string => {
  if (text.length > limit) {
    return `${text.substring(0, limit)}...`;
  }

  return text;
};

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
 *      "multiple": "too_small",
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
    // a translated field is registered as `<locale>:<field>` — see the zod schema builder
    const splittedKey = key.split(':');
    const field = splittedKey[1];

    if (field) {
      /*
       * only for translated fields
       * transform to pure array to use includes (if Set)
       */
      const hasField = Array.from(translatedFields).includes(field);

      if (hasField) {
        const locale = splittedKey[0];

        if (!locales.includes(locale)) {
          locales.push(locale);
        }
      }
    }
  }

  return locales;
};

const hasTranslatedValue = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (value === null || value === undefined) return false;
  if (typeof value === 'object') return !isEmpty(value);
  return true;
};

/**
 * locales whose translation is still missing in a translated form (fields registered as
 * `<locale>:<field>`). The default locale is the reference: another locale is missing as soon as one
 * field filled in the default locale is still empty in it, and the default locale itself is missing
 * while none of its fields hold a value.
 * ex: { 'fr:title': 'Bonjour', 'en:title': '' } => ['en']
 */
export const getTranslatedFormMissingLocales = (
  values: Record<string, unknown>,
  translatedFields: string[] | Set<string>,
  locales: string[],
  defaultLocale: string
): string[] => {
  // only the fields this form actually registers — a shared field list may name fields it lacks
  const fields = Array.from(translatedFields).filter(
    (field: string) => `${defaultLocale}:${field}` in values
  );
  const referenceFields = fields.filter(
    (field: string) => hasTranslatedValue(values[`${defaultLocale}:${field}`])
  );

  return locales.filter((locale: string) => {
    if (locale === defaultLocale) return referenceFields.length === 0;
    return referenceFields.some((field: string) => !hasTranslatedValue(values[`${locale}:${field}`]));
  });
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

/**
 * formats text typed live by an admin into a technical code (ex: Page.code, Category.code)
 * "Privacy policy" => "PRIVACY_POLICY"
 * unlike `slugify`, it never trims a leading/trailing separator while typing — `slugify`'s
 * `.trim()` and end-of-string dash removal silently swallow a space or "_" typed at the end
 * of the field, making it impossible to type a word separator as you go (it only "sticks"
 * once a character is typed after it). Both " " and "_" are accepted and normalized to "_".
 * @param {*} text
 * @returns
 */
export const formatTechnicalCode = (text: string): string => {
  // remove accents, swap ñ for n, etc
  // eslint-disable-next-line @cspell/spellchecker
  const from = 'ÅÀÁÃÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇ';
  // eslint-disable-next-line @cspell/spellchecker
  const to = 'AAAAAAEEEEIIIIOOOOUUUUNC';

  let result = text.toUpperCase();

  for (let i = 0, l = from.length; i < l; i++) {
    result = result.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return result
    .replace(/[^A-Z0-9 _-]/g, '') // remove invalid chars
    .replace(/[\s-]/g, '_') // turn spaces and dashes into the "_" separator
    .replace(/_+/g, '_'); // collapse consecutive separators
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

/*
 * a comma-separated text stored as one string (the CMS tags) read back as its list of values:
 * blank segments dropped, and a value repeated with another case kept once, as first typed
 */
export const splitCommaSeparatedValues = (text = ''): string[] => {
  const values = text.split(',').map(value => value.trim()).filter(Boolean);

  return uniqBy(values, value => value.toLowerCase());
};

export const joinCommaSeparatedValues = (values: string[]): string => values.join(', ');

/**
 * Whether a url may be put in a link: only https. A url a member wrote (an attachment, a link in a
 * message) could otherwise be a `javascript:` one, run in the session of whoever clicks it.
 */
export const isHttpsUrl = (url: string): boolean => /^https:\/\//i.test(url);

export type AppEnvironment = 'local' | 'preprod' | 'production';

/**
 * the environment this build is talking to, read from the flags `initializeParse` sets on the
 * window — anything that is neither local nor pre-production is production
 */
export const getAppEnvironment = (): AppEnvironment => {
  if (window.IS_LOCAL) return 'local';
  if (window.IS_PREPROD) return 'preprod';

  return 'production';
};

/**
 * the host of the server the back-office calls (for example api.example.com), or an empty string when no server
 * url is configured
 */
export const getServerHost = (): string => {
  try {
    return new URL(getServerUrl()).host;
  } catch {
    return '';
  }
};
