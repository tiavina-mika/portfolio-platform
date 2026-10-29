import { ZodObject, type ZodRawShape } from 'zod';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE } from '@/config/i18next';
import { LOG_TOPIC } from '@/utils/constants';
import { logger } from '@/utils/logger';
import { getSignUpFromBOSchema, getSignUpSchema } from '@/validations/user.validation';

import { getClientIp } from './parse.utils.cloud';
import { hasRight, isAdministrator } from './role.utils.cloud';

type ParseCloudRequest =
  | Parse.Cloud.FunctionRequest |
  Parse.Cloud.AfterDeleteRequest |
  Parse.Cloud.AfterSaveRequest |
  Parse.Cloud.BeforeSaveRequest;
/*
 * --------------------------------------------------------------------------------//
 * --------------------------- Parse Functions ------------------------------------//
 * --------------------------------------------------------------------------------//
 */
export const parseFunction =
  <T extends ParseCloudRequest>(
    innerFunction: (request: T) => Promise<any>
  ) =>
    async (request: T): Promise<void> => {
    // log infos
      const logTopic = (request as any).triggerName ? LOG_TOPIC.PARSE_TRIGGER : LOG_TOPIC.PARSE_FUNCTION;
      const { object } = request as any;
      const logData: Record<string, any> = {
        id: object?.id,
        topic: logTopic,
      };

      const { user } = request;

      if (user) {
        logData.userId = user.id;
        logData.ipAddress = getClientIp(request);
      }
      let logName = object?.className || 'function';


      logName += object ? (object.existed() ? ' [UPDATE] ' : ' [CREATION] ') : '';

      if (logName !== 'function') {
        const dirtyKeys = object
          ? JSON.stringify(object?.dirtyKeys())
          : JSON.stringify((request as any)?.context?.dirtyKeys || []);

        logger.info(`Keys changed: ${dirtyKeys}`);
      }
      logger.info(` ============== ${logName} begin ============== `, logData);


      try {
        let result = await innerFunction(request);

        if (result == null) {
          result = 'ok';
        }
        logger.info(
          ` ============== ${logName} ${logTopic} ${object?.id} end ============== `
        );
        return result;
      }
      catch (error) {
        console.log('parseFunction ~ error:', error);
        let message;

        if (error) {
          message = (error as Error).message;
        }
        else {
          message = 'Unknown error';
        }

        logger.error(
          ` ============== ${logName} ${logTopic} ${object?.id} ==============, ` +
          message
        );
        return Promise.reject(new Error(message));
      }
    };

/**
 * handles security by checking role
 * NOTE: user is undefined in afterDelete trigger
 * so use parseFunction in that case
 * @param action
 * @returns {*}
 */
export const fromBO = <T extends ParseCloudRequest>(
  action: (request: T) => any,
  rights?: ('create' | 'update' | 'get' | 'find' | 'delete' | 'destroy')[],
  className?: string
): (request: T) => Promise<any> => {
  return parseFunction<T>(async (request: any): Promise<void> => {
    const { user, object } = request;

    if (rights) {
      const hasUserRight = await hasRight(user, object?.className || className, rights);

      if (!hasUserRight) {
        const message = `${object?.className || className} Unauthorized for user id: ${user.id}`;

        logger.error(message);
        throw new Error(message);
      }
    }

    if (!user) {
      const message = 'Unauthorized - No user defined';

      logger.error(message);
      throw new Error(message);
    }

    return action(request); // the second argument is rarely used
  });
};

export const cloudValidationRules = async (
  request:
    | Parse.Cloud.AfterSaveRequest |
    Parse.Cloud.BeforeSaveRequest |
    Parse.Cloud.BeforeDeleteRequest |
    Parse.Cloud.AfterDeleteRequest |
    Parse.Cloud.FunctionRequest
) => {
  // when the user who create or update the class is deleted, no need to be logged in
  if ((request as any).context?.userDeleted) return;
  if ((request as any).context?.isExpressApi) return;

  if (!request.user) {
    throw Error('Validation failed. Please login to continue.');
  }

  if (request.user && !(await isAdministrator(request.user))) {
    throw Error('Access denied.');
  }
};

export const parseFunctionValidation = (
  schema: ZodObject<ZodRawShape> | ((locale: Locale) => ZodObject<ZodRawShape>)
) => (request: Parse.Cloud.FunctionRequest): void => {
  const { params }: Parse.Cloud.FunctionRequest = request;
  let validation: ReturnType<ZodObject<ZodRawShape>['safeParse']>;

  // if the schema is a function, it means that it needs a locale to translate the error message
  if (typeof schema === 'function') {
    validation = schema(params.locale || DEFAULT_LANGUAGE).safeParse(params);
  }
  else {
    validation = schema.safeParse(params);
  }

  if (!validation.success) {
    const { issues } = (validation as any).error;

    throw new Error(issues[0].message);
  }
};

/**
 * Parse trigger validation
 * @param schema
 * @returns
 */
export const parseTriggerValidation = <T extends Record<string, any>>(
  schema: ZodObject<ZodRawShape> | ((locale: Locale) => ZodObject<ZodRawShape>)
) => (request: T): void => {
  const { object, context, triggerName }: T = request;

  // validate only beforeSave trigger
  if (triggerName !== 'beforeSave') return;
  let validation: ReturnType<ZodObject<ZodRawShape>['safeParse']>;

  if (typeof schema === 'function') {
    validation = schema(context.locale || DEFAULT_LANGUAGE).safeParse(object.toJSON());
  }
  else {
    validation = schema.safeParse(object.toJSON());
  }

  if (!validation.success) {
    const { issues } = (validation as any).error;

    throw new Error(issues[0].message);
  }
};

/**
 * trigger validation for signup or update profile
 * for BO, check if the user is from BO (fromBO)
 * @returns
 */
export const signupTriggerValidation = <T extends Record<string, any>>() => (request: T): void => {
  const { object, context, triggerName }: T = request;

  // validate only beforeSave trigger
  if (triggerName !== 'beforeSave') return;
  const locale = context.locale || DEFAULT_LANGUAGE;

  /*
   * if the object is existed, no need to validate (only for creation)
   * or if the object is existed and it's a profile update
   */
  if (object.existed() || (object.existed() && !context.isProfileUpdate)) return;

  let validation: ZodObject<ZodRawShape> | null = null;

  if (object.get('fromBO')) {
    validation = getSignUpFromBOSchema(locale);
  }
  else {
    validation = getSignUpSchema(locale);
  }
  const validate = validation.safeParse(object.toJSON());

  if (!validate.success) {
    const { issues } = (validation as any).error;

    throw new Error(issues[0].message);
  }
};
