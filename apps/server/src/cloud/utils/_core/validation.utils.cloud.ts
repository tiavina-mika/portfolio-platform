import type { Locale } from '@/types/app.type';
import type { ZodObject, ZodRawShape } from 'zod';

import { DEFAULT_LANGUAGE } from '@/config/i18n';
import { throwTranslatedErrorMessage } from '@/config/i18n/zod-i18n';
import { FROM_PROJECT } from '@/constants/_core/constants';
import { RegisterStepEnum } from '@/types/user.type';
import { emailSignUpSchema, phoneSignUpSchema } from '@/validations/_core/auth.validations';
import { imageHttpResponseSchema } from '@/validations/_core/file.validations';
import {
  signUpInfoSchema, userCreationFromBOSchema, sexChangeSchema, consentSchema,
} from '@/validations/_core/user.validations';

import { checkIsParseDateObject, parseDateFromParseObjectToJSON } from './parse.utils.cloud';
import { shouldSkipTriggerCascade } from './utils.cloud';

/**
 * Parse trigger validation
 * It's the second parameter of beforeSave trigger, it will validate the object with the corresponding schema
 * If any error occurs, it will throw an error with the translated message based on the locale of the object or the context
 * @param schema
 * @returns
 */
export const parseTriggerValidation = <T extends Record<string, any>>(
  schema: ZodObject<ZodRawShape> | ((locale: Locale) => ZodObject<ZodRawShape>),
  fieldsToValidate?: string[]
) => async (request: T): Promise<void> => {
  const { object, context, triggerName }: T = request;

  // validate only beforeSave trigger
  if (triggerName !== 'beforeSave') return;

  // Parse runs this validator before the handler, so a server save that asked to skip triggers skips it here too
  if (shouldSkipTriggerCascade(request)) return;

  const locale = context.locale || object.get('locale') || DEFAULT_LANGUAGE;

  let validation: ZodObject<ZodRawShape> | ((locale: Locale) => ZodObject<ZodRawShape>) | null = null;

  // if the schema is a function, it means that it needs a locale to translate the error message
  if (typeof schema === 'function') {
    validation = schema(locale);
  }
  else {
    validation = schema;
  }

  const objectJson = object.toJSON();
  let objectToValidate = objectJson;

  // Select only the fields to validate if fieldsToValidate is provided, otherwise validate the whole object
  if (fieldsToValidate && fieldsToValidate.length > 0) {
    objectToValidate = fieldsToValidate.reduce((acc, field) => {
      let value = objectJson[field];

      const isDate = checkIsParseDateObject(value);

      if (isDate) {
        value = parseDateFromParseObjectToJSON(value);
      }
      acc[field] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  const validate = validation.safeParse(objectToValidate);

  await throwTranslatedErrorMessage(validate, locale);
};

export const parseFunctionValidation = (
  schema: ZodObject<ZodRawShape> | ((locale: Locale) => ZodObject<ZodRawShape>)
) => async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
  const { params }: Parse.Cloud.FunctionRequest = request;

  const locale = params.locale || DEFAULT_LANGUAGE;
  let validation: ZodObject<ZodRawShape> | ((locale: Locale) => ZodObject<ZodRawShape>) | null = null;

  // if the schema is a function, it means that it needs a locale to translate the error message
  if (typeof schema === 'function') {
    validation = schema(locale);
  }
  else {
    validation = schema;
  }

  const validate = validation.safeParse(params);

  await throwTranslatedErrorMessage(validate, locale);
};

/**
 * trigger validation for signup or update profile
 * for BO, check if the user is from BO (fromBO)
 * @returns
 */
export const signupTriggerValidation = <T extends Record<string, any>>() => {
  return async (request: T): Promise<void> => {
    const { object, context }: T = request;
    const dirtyFields = context.dirtyKeys || [];

    const isFromBO = object.get('platform') === FROM_PROJECT.BO || object.get('fromBO');

    let schema: ZodObject<ZodRawShape> | null = null;

    // Creation
    if (!object.existed()) {
      if (isFromBO) {
        schema = userCreationFromBOSchema;
      }
      else {
        if (object.get('registerStep') === RegisterStepEnum.VERIFY_EMAIL) {
          schema = emailSignUpSchema;
        } else if (object.get('registerStep') === RegisterStepEnum.VERIFY_PHONE) {
          schema = phoneSignUpSchema;
        }

        // explicit RGPD consent is mandatory for every mobile/web sign-up
        await parseTriggerValidation(consentSchema)(request);
      }
    // Edition
    } else {
      if (!isFromBO) {
        if (dirtyFields.includes('registerStep') && object.get('registerStep') === RegisterStepEnum.PROFILE) {
          schema = signUpInfoSchema;
        }

        if (dirtyFields.includes('image')) {
          schema = imageHttpResponseSchema;
        }

        if (dirtyFields.includes('sex')) {
          await parseTriggerValidation(sexChangeSchema, ['sexChangeCount'])(request);
        }
      }
    }

    if (!schema) return;
    await parseTriggerValidation(schema)(request);
  };
};
