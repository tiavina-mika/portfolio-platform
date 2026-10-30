import * as z from 'zod';

import i18n from '@/config/i18n';
import { Locale } from '@/types/_core/setting.type';
import { displayDate } from '@/utils/_core/date.utils';
import { convertBytesToFileSize, convertMimeTypeToFileExtension, isMimeType } from '@/utils/_core/file.utils';
import { capitalizeFirstLetter } from '@/utils/_core/utils';

/**
 * Get translated error message for a given field.
 * In "globalError" section of the zod.json.
 * E.g., "invalidStringType", "tooBigText", etc.
 */
const getErrorMessage = (i18nData: Record<string, any>, field: string): string => {
  return i18nData.globalError?.[field as keyof typeof i18nData.globalError] || `Error: ${field}`;
};

/**
 * Get translated field name for a given input.
 * In "name" section of the zod.json.
 * E.g., "title", "name", etc.
 * @param i18nData zod.json i18n data
 * @param field key of the field (e.g., "title", "name", etc.)
 * @param valueType optional value type (e.g., "date", "file", etc.)
 * @returns translated field name
 */
const getInputName = (i18nData: Record<string, any>, field: string | string[]): string => {
  if (Array.isArray(field)) {
    const fullKey = field.join('.');
    const lastKey = field[field.length - 1] ?? '';

    return i18nData.name?.[fullKey] || i18nData.name?.[lastKey] || '';
  }
  return i18nData.name?.[field] || '';
};

/**
 * Check if the field is required number input (empty number).
 * z.number().min(0) => empty: required, 0 or more: valid
 * z.number().min(18) => empty: required, 0-17: too small, 18 or more: valid
 */
const isInvalidAsEmptyNumber = (issue: z.core.$ZodIssue): boolean => {
  const invalidTypeIssue = issue as z.core.$ZodIssueInvalidType;

  if (invalidTypeIssue.expected === 'number' && ((issue as any).received === 'undefined' || typeof (issue as any).received === 'undefined')) {
    return true;
  }

  return invalidTypeIssue.expected === 'number' && isNaN(Number(invalidTypeIssue.input));
  // return false;
};

const isInvalidAsEmptyString = (issue: z.core.$ZodIssue): boolean => {
  const invalidTypeIssue = issue as z.core.$ZodIssueInvalidType;

  if (
    invalidTypeIssue.expected === 'string' &&
    ((issue as any).received === 'undefined' || typeof (issue as any).received === 'undefined') &&
    (invalidTypeIssue.input === null || invalidTypeIssue.input === '' || invalidTypeIssue.input === undefined)
  ) {
    return true;
  }

  return invalidTypeIssue.expected === 'string' && (invalidTypeIssue.input === '' || invalidTypeIssue.input === null);
};

/**
 * Check if the field is required array
 * @NOTE the value must be undefined for that to work
 * It's processed in z.process to treat [] and null as invalid for array
 * @param issue
 * @returns
 */
const isInvalidAsEmptyArray = (issue: z.core.$ZodIssue): boolean => {
  const invalidTypeIssue = issue as z.core.$ZodIssueInvalidType;

  if (
    invalidTypeIssue.expected === 'array' &&
    ((issue as any).received === 'undefined' || typeof (issue as any).received === 'undefined') &&
    (invalidTypeIssue.input === null || invalidTypeIssue.input === undefined)
  ) {
    return true;
  }

  return invalidTypeIssue.expected === 'array' && (invalidTypeIssue.input === null || invalidTypeIssue.input === undefined);
};

/**
 * Set global error messages for a given i18n data.
 * This will be applied to every Zod schema.
 * @param i18nData zod.json i18n data
 * @returns
 */
const setGlobalError = (i18nData: Record<string, any>): any => {
  return {
    customError: (issue: z.core.$ZodIssue): {
      message: string;
    } | string | undefined | null => {
      switch (issue.code) {
        /**
         * Cases where the value is not of the expected type
         * (e.g., string instead of number, boolean instead of string, etc.)
         */
        case 'invalid_type': {

          const expected = issue.expected?.charAt(0).toUpperCase() + issue.expected?.slice(1);
          const key = `invalid${expected}Type`;

          /*
           * Translated field name (e.g.: "Le titre", "Le nom", etc.)
           * Tries "departure.country" first, falls back to "country"
           */
          const fieldName = getInputName(i18nData, issue.path?.map(String) ?? []);

          /*
           * ----------------------------------- //
           * ------- Required number field ----- //
           * ----------------------------------- //
           */
          const isRequiredField =
            isInvalidAsEmptyNumber(issue) ||
            isInvalidAsEmptyString(issue) ||
            isInvalidAsEmptyArray(issue);
          // If a number input is required but empty, return "This field is required" message

          if (isRequiredField) {
            // The brute message for required field (e.g.: "{{field}} is required")
            let message = getErrorMessage(i18nData, 'requiredField');

            if (fieldName) {
              // Change {{field}} with the translated field name (e.g., "Name is required")
              message = message.replace('{{field}}', fieldName);
            } else {
              // Use generic "Field is required" if no field name available (e.g., "This field is required")
              message = message.replace('{{field}}', getInputName(i18nData, 'field'));
            }

            return capitalizeFirstLetter(message.trim());
          }

          /*
           * ----------------------------------- //
           * ----------- Other cases ----------- //
           * ----------------------------------- //
           */
          let message = getErrorMessage(i18nData, key) || `Invalid type : ${issue.expected}`;

          // Special case for single file expected but array received
          if (issue.expected === 'file' && Array.isArray(issue.input) && issue.input.length > 0) {
            message = getErrorMessage(i18nData, 'invalidSingleFile');
          }

          /*
           * If we have a field name, replace {{field}} in the message with the translated name
           * Remove {{field}} if no field name is available
           */
          message = message.replace('{{field}}', fieldName || '');

          return capitalizeFirstLetter(message.trim());
        }
        /**
         * Cases where the value is too big
         * (e.g., string length, number value, array length, etc.)
         */
        case 'too_big':
        /**
         * Cases where the value is too small
         * (e.g., string length, number value, array length, etc.)
         * @NOTE: it is handled both "nonempty()" and "min()" here
         */
        // falls through
        case 'too_small': {
          const isTooBig = issue.code === 'too_big';
          const valueType = issue.origin;
          // Keys in the i18n JSON for different types of values in "globalError"
          const typeKeyMap: Record<string, string> = {
            string: isTooBig ? 'tooBigText' : 'tooSmallText',
            number: isTooBig ? 'tooBigNumber' : 'tooSmallNumber',
            bigint: isTooBig ? 'tooBigNumber' : 'tooSmallNumber',
            int: isTooBig ? 'tooBigNumber' : 'tooSmallNumber',
            array: isTooBig ? 'tooBigArray' : 'tooSmallArray',
            date: isTooBig ? 'tooBigDate' : 'tooSmallDate',
            file: isTooBig ? 'tooBigFile' : 'tooSmallFile',
          };
          const key = typeKeyMap[valueType] || (isTooBig ? 'tooBig' : 'tooSmall');
          const defaultMessages: Record<string, string> = {
            tooBigText: 'Too long',
            tooBigNumber: 'Too big',
            tooBigArray: 'Too many elements',
            tooBigDate: 'Too big date',
            tooBigFile: 'Too big file',
            tooBig: 'Too big',
            tooSmallText: 'Too short',
            tooSmallNumber: 'Too small',
            tooSmallArray: 'Too few elements',
            tooSmallDate: 'Too small date',
            tooSmallFile: 'Too small file',
            tooSmall: 'Too small',
          };
          const limitKey = isTooBig ? 'maximum' : 'minimum';
          // max or min value (number, length, etc.)
          const limit = (issue as any)[limitKey]?.toString() || (isTooBig ? '255' : '1');
          /*
           * if nonempty(): Required text field
           * else if min(): min length or value
           */
          const isTextRequired = valueType === 'string' && limit === '1' && !isTooBig;
          // Translated field name — tries "departure.country" first, falls back to "country"
          const fieldName = getInputName(i18nData, issue.path?.length ? issue.path.map(String) : [valueType]);
          // Dynamic message with replacements for {{number}} (e.g.: Should be at most 10)
          let message: string = getErrorMessage(i18nData, key);

          if (isTextRequired) {
            message = getErrorMessage(i18nData, 'requiredField');
          } else {
            let value = limit;

            switch (valueType) {
              case 'date':
                value = displayDate(value, true, true, true);
                break;
              case 'file':
                value = convertBytesToFileSize(value, 'mb', true);
                break;
              // Add more cases if needed
            }
            message = message.replace('{{value}}', value) || defaultMessages[key] || (isTooBig ? 'Too big' : 'Too small');
          }

          // If we have a field name, replace {{field}} in the message with the translated name
          if (fieldName) {
            message = message.replace('{{field}}', fieldName);
          } else {
            if (isTextRequired) {
              // Special case for required text fields, e.g., "Name required"
              message = message.replace('{{field}}', getInputName(i18nData, 'field'));
            } else {
              // Remove {{field}} if no field name is available
              message = message.replace('{{field}}', '');
            }

          }

          return capitalizeFirstLetter(message.trim());
        }
        case 'custom': {
          const params = issue.params ?? {};
          const customMsg = getErrorMessage(i18nData, 'customBadInput').replace(
            '{{field}}',
            params.field as string || 'unknown'
          ) || 'This is a bad input';

          return customMsg;
        }
        /*
         * Cases where the value is not in the expected set of values
         * (e.g., enum values, literal values, etc.)
         */
        case 'invalid_value': {
          const input = (issue as any).input;

          const list = (issue as z.core.$ZodIssueInvalidValue<string>).values as string[] || [];
          // Translated field name — tries "departure.country" first, falls back to "country"
          const field = getInputName(i18nData, issue.path?.map(String) ?? []);

          if (!list.length) return;

          // ISSUE: the issue.type is undefined here.

          // 1. Other invalid value types (e.g., enum, literal, etc.)
          if (!isMimeType(input)) {
            const key = 'InvalidEnumValue';

            // zod.json -> name.articleOption, name.pageOption, etc. (to differentiate from other fields)
            const options = list.map((item) => getInputName(i18nData, `${item}Option`)).join(', ');
            const message = getErrorMessage(i18nData, key)
              .replace('{{options}}', options)
              .replace('{{field}}', field);

            return capitalizeFirstLetter(message.trim());
          }

          // 2. File type invalid value

          // Allowed mime types for file input (e.g., ['image/png', 'application/pdf'])
          const allowedMimeTypes = list;

          // Raw message with {{field}} and {{value}} placeholders
          let message = getErrorMessage(i18nData, 'invalidFileType') || 'Invalid file type';

          const allowedExtensions = [];

          for (const mimeType of allowedMimeTypes) {
            const ext = convertMimeTypeToFileExtension(mimeType);

            if (ext) allowedExtensions.push('.' + ext);
          }
          if (!allowedExtensions.length) return;
          message = message.replace('{{field}}', field); // Replace field name
          message = message.replace('{{value}}', allowedExtensions.join(', '));
          return capitalizeFirstLetter(message.trim());
        }

        case 'invalid_format': {
          const format = (issue as any).format;
          // e.g., invalidEmailFormat, invalidUrlFormat, etc.
          const key = `invalid${format.charAt(0).toUpperCase() + format.slice(1)}Format`;

          const message = getErrorMessage(i18nData, key) || `Invalid format: ${format}`;

          return capitalizeFirstLetter(message.trim());
        }
        default:
          return getErrorMessage(i18nData, 'genericError') || 'Invalid input';
      }
    },
  };
};

/**
 * points the zod error messages at the given language. Its `zod` namespace is one of the i18n
 * resources, so it is read from there rather than fetched again as a separate chunk.
 */
const applyZodI18nLocale = (locale: Locale): void => {
  const i18nData = i18n.getResourceBundle(locale, 'zod');

  z.config(i18nData ? setGlobalError(i18nData) : z.locales.en());
};

/**
 * keeps the zod error messages in the app language, now and after every switch. Driven by the
 * `languageChanged` event rather than by the screens that switch language: i18next only fires it
 * once the new language is downloaded, whereas a screen resuming after the settings update could
 * run before the translations are in. Call once at startup.
 */
export const syncZodWithAppLanguage = (): void => {
  i18n.on('languageChanged', (locale: string) => applyZodI18nLocale(locale as Locale));

  if (i18n.resolvedLanguage) applyZodI18nLocale(i18n.resolvedLanguage as Locale);
};
