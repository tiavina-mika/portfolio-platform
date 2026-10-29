import { capitalize } from 'string-ts';
import * as z from 'zod';

import { Locale } from '@/i18n/config';
import { convertBytesToFileSize, convertMimeTypeToFileExtension, isMimeType } from '@/utils/file.utils';

/**
 * Get translated error message for a given field.
 * In "globalError" section of the form.json.
 * E.g., "invalidStringType", "tooBigText", etc.
 */
const getErrorMessage = (i18nData: Record<string, any>, field: string): string => {
  return i18nData.globalError?.[field as keyof typeof i18nData.globalError] || `Error: ${field}`;
};

/**
 * Get translated field name for a given input.
 * In "name" section of the form.json.
 * E.g., "title", "name", etc.
 * @param i18nData form.json i18n data
 * @param field key of the field (e.g., "title", "name", etc.)
 * @param valueType optional value type (e.g., "date", "file", etc.)
 * @returns translated field name
 */
const getInputName = (i18nData: Record<string, any>, field: string): string => {
  return i18nData.name?.[field as keyof typeof i18nData.name] || '';
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
 * @param i18nData form.json i18n data
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

          // Name of the field (e.g.: "title", "name", etc.)
          const field = issue.path?.length ? issue.path[issue.path.length - 1] as string : '';
          // Translated field name (e.g.: "Le titre", "Le nom", etc.)
          const fieldName = getInputName(i18nData, field);

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

            /*
             * DEBUG
             * return JSON.stringify(issue)
             * return issue.input + ', ' + typeof issue.input + ', ' + issue.received + ', ' + issue.expected;
             */

            return capitalize(message.trim());
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

          return capitalize(message.trim());
        }
        /**
         * Cases where the value is too big
         * (e.g., string length, number value, array length, etc.)
         */
        case 'too_big': {
          const valueType = issue.origin;
          // Keys in the i18n JSON for different types of values in "globalError"
          const typeKeyMap: Record<string, string> = {
            string: 'tooBigText',
            number: 'tooBigNumber',
            bigint: 'tooBigNumber',
            int: 'tooBigNumber',
            array: 'tooBigArray',
            date: 'tooBigDate',
            file: 'tooBigFile',
          };
          const key = typeKeyMap[valueType] || 'tooBig';
          const defaultMessages: Record<string, string> = {
            tooBigText: 'Too long',
            tooBigNumber: 'Too big',
            tooBigArray: 'Too many elements',
            tooBigDate: 'Too big date',
            tooBigFile: 'Too big file',
            tooBig: 'Too big',
          };
          const limitKey = 'maximum';
          // max value (number, length, etc.)
          const limit = (issue as any)[limitKey]?.toString() || '255';
          // Name of the field (e.g.: "title", "name", etc.)
          const field = issue.path?.length ? issue.path[issue.path.length - 1] as string : '';
          // Translated field name (e.g.: "Le titre", "Le nom", etc.)
          const fieldName = getInputName(i18nData, field || valueType);
          // Dynamic message with replacements for {{number}} (e.g.: Should be at most 10)
          let message: string = getErrorMessage(i18nData, key);

          let value = limit;

          switch (valueType) {
            case 'file':
              value = convertBytesToFileSize(value, 'mb', true);
              break;
            // Add more cases if needed
          }
          message = message.replace('{{value}}', value) || defaultMessages[key] || 'Too big';

          // If we have a field name, replace {{field}} in the message with the translated name
          if (fieldName) {
            message = message.replace('{{field}}', fieldName);
          } else {
            // Remove {{field}} if no field name is available
            message = message.replace('{{field}}', '');
          }

          // return issue.input + ', ' + typeof issue.input + ', ' + issue.received + ', ' + issue.expected;
          return capitalize(message.trim());
        }
        case 'too_small': {
          const valueType = issue.origin;
          // Keys in the i18n JSON for different types of values in "globalError"
          const typeKeyMap: Record<string, string> = {
            string: 'tooSmallText',
            number: 'tooSmallNumber',
            bigint: 'tooSmallNumber',
            int: 'tooSmallNumber',
            array: 'tooSmallArray',
            date: 'tooSmallDate',
            file: 'tooSmallFile',
          };
          const key = typeKeyMap[valueType] || 'tooSmall';
          const defaultMessages: Record<string, string> = {
            tooSmallText: 'Too short',
            tooSmallNumber: 'Too small',
            tooSmallArray: 'Too few elements',
            tooSmallDate: 'Too small date',
            tooSmallFile: 'Too small file',
            tooSmall: 'Too small',
          };
          const limitKey = 'minimum';
          // min value (number, length, etc.)
          const limit = (issue as any)[limitKey]?.toString() || '1';
          /*
           * if nonempty(): Required text field
           * else if min(): min length or value
           */
          const isTextRequired = valueType === 'string' && limit === '1';
          // Name of the field (e.g.: "title", "name", etc.)
          const field = issue.path?.length ? issue.path[issue.path.length - 1] as string : '';
          // Translated field name (e.g.: "Le titre", "Le nom", etc.)
          const fieldName = getInputName(i18nData, field || valueType);
          // Dynamic message with replacements for {{number}} (e.g.: Should be at least 1)
          let message: string = getErrorMessage(i18nData, key);

          if (isTextRequired) {
            message = getErrorMessage(i18nData, 'requiredField');
          } else {
            let value = limit;

            switch (valueType) {
              case 'file':
                value = convertBytesToFileSize(value, 'mb', true);
                break;
              // Add more cases if needed
            }
            message = message.replace('{{value}}', value) || defaultMessages[key] || 'Too small';
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

          return capitalize(message.trim());
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
          // Name of the field (e.g.: "title", "name", etc.)
          const path = issue.path?.length ? issue.path[issue.path.length - 1] as string : '';
          // e.g: globalError.invalidFileType or name.file in form.json
          const field = getInputName(i18nData, path);

          if (!list.length) return;

          // ISSUE: the issue.type is undefined here.

          // 1. Other invalid value types (e.g., enum, literal, etc.)
          if (!isMimeType(input)) {
            const key = 'InvalidEnumValue';

            // form.json -> name.articleEnum, name.pageEnum, etc. (to differentiate from other fields)
            const options = list.map((item) => getInputName(i18nData, `${item}Enum`)).join(', ');
            const message = getErrorMessage(i18nData, key)
              .replace('{{options}}', options)
              .replace('{{field}}', field);

            return capitalize(message.trim());
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
          return capitalize(message.trim());
        }
        default:
          return getErrorMessage(i18nData, 'genericError') || 'Invalid input';
      }
    },
  };
};

/**
 * Load i18n JSON and configure Zod globally.
 * Use for init at startup or runtime switch.
 */
export const loadZodI18nLocale = async (locale: Locale) => {
  try {
    // Dynamically import the locale JSON for form
    const { default: i18nData } = await import(`../../translations/${locale}/zod.json`);

    // Configure Zod with the loaded i18n data
    z.config(setGlobalError(i18nData));
  } catch (error) {
    console.error(`Error loading locale "${locale}":`, error);
    // Fallback to 'en' or built-in
    z.config(z.locales.en());
  }
};
