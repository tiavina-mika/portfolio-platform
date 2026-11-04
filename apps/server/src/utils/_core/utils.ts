import crypto from 'crypto';
import { promisify } from 'util';

import { t } from 'i18next';
import escapeRegExp from 'lodash/escapeRegExp.js';


import { DEFAULT_LANGUAGE } from '@/config/i18n';

import { encrypt } from './encrypt.utils';
import {
  FORCE_PROD, IS_LOCAL, IS_TEST,
  USE_MASTER_KEY, WEB_DEV_PORT,
} from '../../constants/_core/constants';

export const wait = (ms = 1000): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

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

// ----- email validation -----//

const regexEmail = new RegExp(
  // eslint-disable-next-line @stylistic/max-len
  /^(([^<>()[\]\\.,;:\s@]+(\.[^<>()[\]\\.,;:\s@]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

export const isValidEmail = (email: string): boolean => {
  return !!(regexEmail.exec(email));
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

    if (!Object.prototype.hasOwnProperty.call(values, key)) {
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
export const generateNumber = (digit: number): string => crypto.randomInt(0, 10 ** digit).toString().padStart(digit, '0');

export const capitalizeFirstLetter = (string: string): string => {
  if (
    !string ||
    typeof string !== 'string' ||
    (string?.trim().length === 0)
  )
    return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Get server url to serve the client and the api
 * For local environment, we use ip address instead of localhost (via ipconfig ipv4)
 * because in some cases (mobile) localhost does not work
 * @returns
 */
export const getServerUrl = (): string => {
  const localHostName = `http://${process.env.LOCAL_NETWORK_HOSTNAME}:${process.env.PORT}`;

  // use local .env file in local environment or force prod (test prod in local)
  if (IS_LOCAL || FORCE_PROD || IS_TEST) {
    return localHostName;
  }

  return process.env.SERVER_URL!;
};

export const generateCloudinaryUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/f_auto,q_auto/${publicId}`;
};

/**
 * get logo url
 * cloudinary: https://res.cloudinary.com/your-cloud-name/image/upload/f_auto,q_auto/logo
 * @Note rename the file in cloudinary to logo, it should be in the root folder
 * @param isLocalServer
 * @returns
 */
export const getLogoUrl = (): string =>
  `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/f_png,q_auto/logo`;

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

/** the accented forms each plain Latin letter can be stored as, lower case — upper case is derived */
const ACCENT_VARIANTS: Record<string, string> = {
  a: 'àáâãäå',
  c: 'ç',
  e: 'èéêë',
  i: 'ìíîï',
  n: 'ñ',
  o: 'òóôõö',
  u: 'ùúûü',
  y: 'ýÿ',
};

/**
 * A search pattern that ignores case and accents: typing `rene` finds `René`, and typing `é`
 * finds `e`. A database regular expression cannot fold accents on its own, so each plain letter
 * of the text becomes the class of its accented forms.
 * @param text what the user typed — taken literally, never as a pattern
 * @returns the pattern to match a stored string against
 */
export const escapeAccentInsensitiveText = (text: string): RegExp => {
  const plainText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const pattern = Array.from(plainText).map((char) => {
    const lowerChar = char.toLowerCase();
    const variants = ACCENT_VARIANTS[lowerChar];

    if (!variants) return escapeRegExp(char);

    return `[${lowerChar}${variants}${lowerChar.toUpperCase()}${variants.toUpperCase()}]`;
  }).join('');

  return new RegExp(pattern, 'i');
};

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;',
};

/**
 * Makes a string safe to drop into an HTML document. Everything an agent or a user types and that
 * ends up in an email is text, never markup: without this a stray `<` silently swallows the rest
 * of the paragraph, and a crafted one would let the writer style someone else's inbox.
 * @param text the raw string
 * @returns the same string with its five HTML-significant characters replaced by entities
 */
export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (character: string): string => HTML_ENTITIES[character] ?? character);

/**
 * Turns typed text into HTML paragraphs. HTML collapses newlines, so a message written in three
 * paragraphs arrives as one block unless its line breaks are made explicit — which is what every
 * multi-line field the back office sends by email produces.
 * @param text the raw, unescaped text
 * @returns escaped HTML, one `<p>` per block of text, single newlines kept as `<br />`
 */
export const renderTextAsHtml = (text: string): string =>
  escapeHtml(text.trim())
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph: string) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');

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
    return `http://${process.env.LOCAL_NETWORK_HOSTNAME}:${WEB_DEV_PORT}`;
  }

  return process.env.WEBSITE_URL ?? '';
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

/**
 * pass the session token to save the object
 * so we can access the current connected user in the parse cloud
 * @NOTE it's mainly used for testing
 * @NOTE if master key is used, the session token is not used
 * @returns
 */
export const getSessionTokenOption = (withMasterKey = false) => {
  if (IS_TEST && !!global.sessionTokenForTest) {
    return {
      sessionToken: global.sessionTokenForTest,
    };
  }

  if (withMasterKey) {
    return USE_MASTER_KEY;
  }

  return {};
};
