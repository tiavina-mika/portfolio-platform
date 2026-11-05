/* eslint-disable @cspell/spellchecker */
import escapeRegExp from 'lodash/escapeRegExp';
import { HookActionStatus } from 'next-safe-action/hooks';
import Parse from 'parse';
import toast from 'react-hot-toast';
import { ZodError, type ZodIssue } from 'zod';

import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import { AnimatedDivProps } from '@/components/animation/AnimatedDiv';
import env from '@/env';
import { IActionError } from '@/types/app.type';


/**
 * make the app wait for a specific time
 * mainly used for testing purposes
 * @param ms
 * @returns
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const cutText = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const capitalizeFirstLetter = (string: string): string => {
  if (!string || typeof string !== 'string' || string?.trim().length === 0) return '';

  return string.charAt(0).toUpperCase() + string.slice(1);
};

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
 * check if it's null ( 0, '', null, undefined, {}, [] )
 * @param item
 * @returns {boolean}
 */
export const isNull = (item: string | File): boolean => {
  /*
   * NOTE : typeof null = 'object', typeof undefined = 'undefined'
   * see Loose Equality Comparisons With == at ( https://www.sitepoint.com/javascript-truthy-falsy )
   */
  const typeOfValue = typeof item;

  switch (typeOfValue) {
    case 'string':
      return (item as string).trim() === '';
    case 'object':
      return (
        Object.is(item, null) || Object.values(item).every(val => isNull(val))
      );
    case 'number':
      return !item;
    default:
      return item == null;
  }
};

/**
 * an error message with a dynamic value
 * it will be used to display the error message with a dynamic value
 * it is an object that will be stringified in the server response
 * @param value
 * @returns {boolean}
 */
export const getDynamicValidationError = (
  key: string,
  value: number | string
): string => {
  return JSON.stringify({ translationKey: key, value });
};

const isValidJSON = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  }
  catch (_) {
    return false;
  }
};

/**
 * TODO: remove this function, it's actually not used
 * @param error
 * @returns
 */
export const catchError = (error: unknown): IActionError => {
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue: ZodIssue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      errors,
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      success: false,
    };
  }
  return {
    success: false,
    message: 'Something went wrong, please try again later.',
  };
};

/**
 * set the RHF errors from safe-action result and display it to the user
 * @see: https://next-safe-action.dev/docs/usage-from-client/action-result-object
 * @param form useForm
 * @param result data return by safe-action
 * @param tForm form translation (mainly error messages)
 * @param t entity translation (article, user, ...)
 */
export const setFormError = <I extends FieldValues>(
  form: UseFormReturn<I>,
  result: any,
  tForm: any,
  t: any
) => {
  // form errors
  if (result.validationErrors) {
    const errors = result.validationErrors;

    for (const key of Object.keys(errors)) {
      let errorMessage = '';

      switch (key) {
        // the id is not a field, so we don't need to specify the field name
        case 'id':
          errorMessage = tForm(errors[key][0]);
          break;
        case '_root':
          errorMessage = tForm('error.invalidInput');
          break;
        default: {
          // may be a string or a JSON object
          const message = errors[key]._errors[0];

          const isAnObject = isValidJSON(message);

          if (isAnObject) {
            // @example: { "translationKey": "error.max","value": 500 }
            const errorObject = JSON.parse(message);

            console.log(' ----------2.0', message);
            errorMessage = tForm(errorObject.translationKey, {
              // field to be translated, ex: "Name", "Email", ...
              field: t(key),
              // error value, ex: 500 (max, min, ...)
              value: errorObject.value,
            });
            break;
          }

          errorMessage = message;
          break;
        }
      }

      /**
       * set the error message to the form field
       * key here is the field name in the form, ex: "name", "email", ...
       */
      form.setError(key as FieldPath<I>, {
        type: 'manual',
        message: errorMessage,
      });
    }
  }

  // server action error
  if (result.serverError) {
    toast.error(result.serverError);
  }
};

export const isCleanedString = (
  string: string | Record<string, any> | number
): boolean => {
  return !!(
    !string ||
    typeof string !== 'string' ||
    (string?.trim().length === 0)
  );
};

export const isServerActionLoading = (status: HookActionStatus): boolean =>
  status === 'executing';
export const hasServerActionFailed = (status: HookActionStatus): boolean => {
  if (!status) return false;
  return status === 'hasErrored';
};

export const isString = <T = string>(str: T): boolean =>
  typeof str === 'string';

export const escapeText = (text: string): any =>
  new RegExp(escapeRegExp(text), 'ig');

/**
 * slugify a string
 * @example slugify('Hello World') => 'hello-world'
 * @param originalText
 * @param separator
 * @returns
 */
export const slugify = (originalText: string, separator = '-'): string => {
  let text = originalText;

  text = text.trim();
  text = text.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
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
 * Unslugifies a slugified string.
 *@example unSlugify('hello-world') => 'Hello World'
 * @param {string} slug slugified string.
 * @returns {string} un-slugified string.
 */
export const unSlugify = (slug: string, upperFirstChar = false): string =>
  slug.replace(/-/g, ' ').replace(/\w\S*/g, (text) => {
    if (upperFirstChar) {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    return text.toLowerCase();
  });

export const escapeUnSlugifyText = (text: string): any => {
  return escapeText(unSlugify(text));
};

/**
 * get the server url
 * this function can be used in the client side and the server side
 * @param isClient
 * @returns
 */
const getServerUrl = (isClient = true): string => {
  if (isClient) {
    return env.NEXT_PUBLIC_SERVER_URL || '';
  }
  return env.SERVER_URL;
};

/**
 * download a file from the server
 * this function will open a new tab to download the file
 * we do not use fetch or axios here for calling the API
 * instead we use the window.location (browser url) to call the API
 * NOTE: this function is available only in the browser (client side)
 */
type DownloadFileParams = {
  // endpoint path, ex: my-file.pdf for api app.get('my-file.pdf', { ... })
  pathName: string;
  // data passed to the endpoint as query params
  data?: Record<string, any>;
  // the current user to get the session token for the download
  currentUser?: Parse.User;
  openInNewTab?: boolean;
};
export const downloadFile = ({
  pathName,
  data,
  currentUser,
  openInNewTab = false,
}: DownloadFileParams) => {
  const copiedData = { ...data };

  if (currentUser) {
    copiedData.sessionToken = currentUser.getSessionToken();
  }

  const serverUrl = getServerUrl();
  // convert the data object to query params
  const queryParams = Object.keys(copiedData)
    .map(value => `${value}=${encodeURIComponent(copiedData[value])}`)
    .join('&');

  const location = `${serverUrl}/download/${pathName}?${queryParams}`;

  if (typeof window === 'undefined') return;

  if (!openInNewTab) {
    (window as any).location = location;
    return;
  }

  return window.open(location, '_blank');
};

/**
 * @example 2600 => 2.6K, 1000000 => 1M
 * @param num
 * @returns
 */
export const formatNumberToUnit = (num: number): string => {
  if (num >= 1e6) {
    // 1 million or more
    return `${(num / 1e6).toFixed(1)}M`;
  }
  if (num >= 1e3) {
    // 1 thousand or more
    return `${(num / 1e3).toFixed(1)}K`;
  }
  // Less than 1 thousand
  return num.toString();
};


/**
 * used to get the animation props for the AnimatedDiv component
 * @returns
 */
export const getAnimationProps = ({
  withAnimation,
  animation,
  defaultAnimation,
}: AnimatedDivProps & { defaultAnimation: Record<string, any> }) => {
  if (withAnimation) {
    if (animation) {
      return animation;
    }
    return defaultAnimation;
  }
  return {};
};

/**
 * Turns rich text paragraphs into inline content, for a heading: a heading cannot hold a <p>, so the
 * paragraphs become lines separated by a <br>
 * @example '<p>Share the <strong>road</strong></p><p>and the cost</p>' → 'Share the <strong>road</strong><br>and the cost'
 */
export const unwrapParagraphs = (html: string): string =>
  html
    .trim()
    .replace(/<\/p>\s*<p(\s[^>]*)?>/g, '<br>')
    .replace(/<\/?p(\s[^>]*)?>/g, '');
