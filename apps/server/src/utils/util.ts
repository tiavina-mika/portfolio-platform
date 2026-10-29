import crypto from 'crypto';
import { promisify } from 'util';

import { t } from 'i18next';
import escapeRegExp from 'lodash/escapeRegExp.js';

import { DEFAULT_LANGUAGE } from '@/config/i18next';

import { FORCE_PROD, IS_LOCAL, LOCAL_NETWORK_HOSTNAME } from './constants';
import { encrypt } from './encrypt.utils';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  }
  if (typeof value !== 'number' && value === '') {
    return true;
  }
  if (typeof value === 'undefined' || value === undefined) {
    return true;
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    !Object.keys(value).length
  ) {
    return true;
  }
  return false;
};


export const isBoolean = (value: Record<string, string> | boolean | string | number | undefined): boolean => {
  return typeof value === 'boolean';
};

export const generate6DigitNumber = (): number => {
  return Math.floor(100000 + (Math.random() * 900000));
};

export const generateToken = (len = 64): string => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len)
    .toUpperCase(); // return required number of characters
};

/**
 * check if it's null ( 0, '', null, undefined, {}, [] )
 * @param item
 * @returns {boolean}
 */
export const isNull = (
  item: string | Record<string, any> | number | null
): boolean => {
  /*
   * NOTE : typeof null = 'object', typeof undefined = 'undefined'
   * see Loose Equality Comparisons With == at ( https://www.sitepoint.com/javascript-truthy-falsy )
   */
  const typeOfValue = typeof item;

  switch (typeOfValue) {
    case 'string':
      return (item as any).trim() === '';
    case 'object':
      return (
        Object.is(item, null) || Object.values(item as Record<string, any>).every(val => isNull(val))
      );
    case 'number':
      return !item;
    default:
      return item === null;
  }
};

const setValue = (
  parseObject: Record<string, any>,
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
 * @param object
 * @param {array|Set} names
 * @returns {*}
 */
export const filter = (
  object: Record<string, any>,
  names: Record<string, any>
): Record<string, any> => {
  return Object.keys(object)
    .filter(key => (names.has ? names.has(key) : names.includes(key)))
    .reduce((obj, key) => {
      (obj as any)[key] = object[key];
      return obj;
    }, {});
};

/**
 * . null or undefined values aren't set
 * . a value is set only when it's different
 * @param parseObject
 * @param values
 * @param {Array|Set} names (optional), ensures we only set the right properties
 */
export const setValues = (
  parseObject: Record<string, any>,
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

/**
 * Generates a random number with n digits.
 *
 * @param {number} n - The number of digits we want.
 * @returns {string} - The generated number as a string,
 * so the number will not be chopped if it starts with
 * one or more zeros.
 *
 * @example
 * const myNumber = generateNumber(6); // '004892'
 */
export const generateNumber = (digit: number): string => Math.random().toFixed(digit).split('.')[1]!;

/**
 * get server url to serve the client and the api
 * @returns
 */
export const getServerUrl = (): string => {
  const localHostName = `http://${LOCAL_NETWORK_HOSTNAME}:${process.env.PORT}`;

  // use local .env file in local environment or force prod (test prod in local)
  if (IS_LOCAL || FORCE_PROD) {
    return localHostName;
  }

  return process.env.SERVER_URL!;
};

export const generateCloudinaryUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/f_auto,q_auto/${publicId}`;
};

/**
 * get logo url
 * https://res.cloudinary.com/your-cloud-name/image/upload/f_auto,q_auto/logo
 * @Note rename the file in cloudinary to logo, it should be in the root folder
 * @returns
 */
export const getLogoUrl = (): string => {
  return getServerUrl() + '/logo.svg';
};

/**
 * for url name
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

export const cutMetaTitle = (text: string): string => text?.substring(0, 70) || '';
export const cutMetaDescription = (text: string): string => text?.substring(0, 170) || '';
// text to search
export const escapeText = (text: string): any => new RegExp(escapeRegExp(text), 'ig');

/**
 * cut html string and add closing tag
 */
export const cutHtmlString = (text: string, position = 600, separator = '<p'): string => {
  const prevText = text.slice(0, position);
  const nextText = text.slice(position, text.length);

  // add automatically closing tag
  const copySeparator = [...separator];

  copySeparator.splice(1, 0, '/');
  const closingTag = copySeparator.join('') + '>';

  const nextIndex = nextText.indexOf(closingTag);

  const truncatedText = prevText + nextText.slice(0, nextIndex) + closingTag + ' ...';

  return truncatedText;
};

/**
 * wait a little bit before processing the next treatment
 * @param {number} duration (by default 100ms)
 * @returns {Promise<void>}
 */
export const delay = async (duration = 100) => {
  const wait = promisify(setTimeout);

  await wait(duration);
};

export const getTranslatedField = <T extends Record<string, any>>(
  translated: T,
  language: string,
  field: string
): string => {
  const value = translated[language]?.[field];

  if (!value) {
    const defaultFieldValue = translated[DEFAULT_LANGUAGE][field];

    return defaultFieldValue;
  }

  return translated[language]?.[field];
};

export const getClientUrl = (): string => {
  if (IS_LOCAL) {
    return `http://${LOCAL_NETWORK_HOSTNAME}:9002`;
  }

  return process.env.WEBSITE_URL!;
};

/**
 * open the page in the website
 * NOTE: change this if the website url structure change
 * @param locale
 * @param slug
 * @returns website url, ex: https://www.example.com/en/articles/my-article
 */
export const getArticleClientUrl = (translated: Record<string, any>, locale = DEFAULT_LANGUAGE): string => {
  const hostname = getClientUrl();
  const pathname = t('routes.articles');
  const slug = getTranslatedField(translated, locale, 'slug');

  return `${hostname}/${locale}/${pathname}/${slug}`;
};

/**
 * unsubscribe newsletter from a url
 * NOTE: we should encrypt the email before sending it
 * in the client, we will decrypt it
 * @param email
 * @param locale
 * @returns
 */
export const getUnsubscribeNewsletterClientUrl = (email: string, locale = DEFAULT_LANGUAGE): string => {
  const hostname = getClientUrl();
  const unsubscribePathname = t('routes.unsubscribe');
  const encryptedEmail = encrypt(email, null, false) as string;

  // change it if the client url structure change
  return `${hostname}/${locale}/newsletter/${encryptedEmail}/${unsubscribePathname}`;
};
