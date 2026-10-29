import dayjs from 'dayjs';

import type { DBRights, Locale } from '@/types/app.type';
import type { IIdsToTransform } from '@/types/utils.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import {
  ACTING_USER_CONTEXT_KEY, collections, LOG_TOPIC, SEEN_FIELD, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { UNVERIFIED_ACCOUNT_ALLOWED_FUNCTIONS } from '@/constants/_core/user.constants';
import { runAsAgent } from '@/utils/_core/agent-context.utils';
import { formatStatusToCamelCase } from '@/utils/_core/app.utils';
import { logger } from '@/utils/_core/logger';
import { hasNoVerifiedContact } from '@/utils/_core/user.utils';

import { convertIdToPointer, getClientIp } from './parse.utils.cloud';
import {
  assertMfaEnabledForHighestRoles, getAllowedCountryCodes, hasRight, isRequestFromManager, isHighestRole,
} from './role.utils.cloud';

type ParseCloudRequest =
  | Parse.Cloud.FunctionRequest |
  Parse.Cloud.AfterDeleteRequest |
  Parse.Cloud.AfterSaveRequest |
  Parse.Cloud.BeforeSaveRequest;
/**
 * The refusal an account that confirmed none of its contacts gets, from a sign-in (`beforeLogin`) as
 * from any action (`parseFunction`): the one payload the apps already know how to read.
 */
export const createAccountNotVerifiedError = (): Parse.Error => (
  new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, JSON.stringify({ code: 'ACCOUNT_NOT_VERIFIED' }))
);

/**
 * Classes whose saves are the account itself (the sign-up edits its own row, a sign-in opens a
 * session): those triggers are the flow that leads to the confirmation, not an action to refuse.
 */
const UNVERIFIED_ACCOUNT_ALLOWED_CLASSES = ['_User', '_Session'];

/**
 * Parse hands a session out at sign-up, before any code was typed: the confirmation has to be
 * enforced here, not by the screens, or a script could skip them and act as a confirmed account.
 * Every Cloud Function and every trigger goes through `parseFunction`, so this is the one place.
 *
 * It only concerns a session caller: a master-key call (seeds, jobs, admin tools) and a call with
 * no session are not an account acting. A back-office account is no exception: the session it gets
 * at sign-up does not go through `beforeLogin`. An account that predates the flags (`undefined`)
 * is never blocked.
 */
const assertAccountCanAct = (request: any): void => {
  const {
    user, master, object, functionName,
  } = request;

  if (!user || master) return;
  if (object?.className && UNVERIFIED_ACCOUNT_ALLOWED_CLASSES.includes(object.className)) return;
  if (functionName && UNVERIFIED_ACCOUNT_ALLOWED_FUNCTIONS.includes(functionName)) return;

  const isUnverified = hasNoVerifiedContact({
    emailVerified: user.get('emailVerified'),
    phoneVerified: user.get('phoneVerified'),
  });

  if (!isUnverified) return;

  logger.warn(`Blocked an action of the unverified account ${user.id}`, {
    functionName, className: object?.className,
  });
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw createAccountNotVerifiedError();
};

/*
 * --------------------------------------------------------------------------------//
 * --------------------------- Parse Functions ------------------------------------//
 * --------------------------------------------------------------------------------//
 */
export const parseFunction =
  <T extends ParseCloudRequest>(
    action: (request: T) => Promise<any>
  ) =>
    async (req: T): Promise<void> => {
      const request = req as any;
      // log infos
      const logTopic = request.triggerName ? LOG_TOPIC.PARSE_TRIGGER : LOG_TOPIC.PARSE_FUNCTION;
      const { object } = request;
      const logData: Record<string, any> = {
        id: object?.id,
        topic: logTopic,
        triggerName: request.triggerName || 'function',
      };

      const { user } = request;

      if (user) {
        logData.userId = user.id;
        logData.ipAddress = getClientIp(request);
      }
      let logName = object?.className || 'function';


      /*
       * never skips a trigger on its own: each trigger decides with shouldSkipTriggerCascade, after
       * the work that must run on every save (status milestones)
       */
      try {
        logName += object ? (object.existed() ? ' [UPDATE] ' : ' [CREATION] ') : '';
        logger.debug(` ============== ${logName} begin ============== `, logData);

        assertAccountCanAct(request);

        let result = await action(request);

        if (result == null) {
          result = 'ok';
        }
        logger.debug(
          ` ============== ${logName} ${request.triggerName} ${object?.id} end ============== `
        );
        return result;
      }
      catch (error) {
        const message = error ? (error as Error).message : 'Unknown error';

        logger.error(
          ` ============== ${logName} ${request.triggerName} ${object?.id} ==============, ` +
          message
        );

        /*
         * a Parse.Error carries a semantic code (e.g. OPERATION_FORBIDDEN for the MFA_REQUIRED /
         * ACCOUNT_BANNED JSON payloads) that callers dispatch on — rewrapping it as a plain Error
         * here made Parse Server report it as a generic SCRIPT_FAILED (141) instead, so clients
         * checking the original code never matched and fell through to the wrong branch
         */
        if (error instanceof Parse.Error) {
          /*
           * `@types/parse`'s legacy `class Error` (see src/types/global-parse.d.ts) doesn't declare
           * `extends Error`, even though `Parse.Error` does extend the native `Error` at runtime.
           */
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          return Promise.reject(error);
        }

        return Promise.reject(new Error(message));
      }
    };

/**
 * handles security by checking role
 * so use parseFunction in that case
 * @NOTE user is undefined in afterDelete trigger
 * @param action
 * @returns {*}
 */
export const fromBO = <T extends ParseCloudRequest>(
  /**
   * parse function
   */
  action: (request: T) => any,
  /**
   * rights to check
   * @example ['update', 'delete']
   */
  rights?: DBRights[],
  /**
   * class name (collection name) to check rights
   */
  className?: string,
  /**
   * should be false in afterDelete trigger
   */
  shouldLogin = true
): (request: T) => Promise<any> => {
  return parseFunction<T>(async (request: any): Promise<void> => {
    const {
      user, object, context, params,
    } = request;
    // locale for error message
    const defaultLocale = object?.get('locale') || params?.locale || context?.locale || DEFAULT_LANGUAGE;

    if (shouldLogin && !user) {
      const message = translate('error.pleaseLogin', defaultLocale);

      logger.error('Unauthorized - No user defined');
      throw new Error(message);
    }

    if (rights) {
      const hasUserRight = await hasRight(user, object?.className || className, rights);

      if (!hasUserRight) {
        const message = translate('error.unauthorizedToDoThisAction', defaultLocale);

        logger.error(`${object?.className || className} Unauthorized for user id: ${user.id}`);
        throw new Error(message);
      }
    } else if (shouldLogin && user) {
      // No specific rights required — verify the caller has at least one BO role
      const isBOUser = await isRequestFromManager(request);

      if (!isBOUser) {
        const message = translate('error.unauthorizedToDoThisAction', defaultLocale);

        logger.error(`BO access denied for user id: ${user.id}`);
        throw new Error(message);
      }
    }

    // a top-level admin without a second factor may enrol one, nothing else (see MfaRequiredBanner)
    if (shouldLogin && user && !request.master) await assertMfaEnabledForHighestRoles(user);

    // a master-key call is the server itself: nothing limits it to a country
    const allowedCountries = user && !request.master ? await getAllowedCountryCodes(user) : null;

    return runAsAgent(user, allowedCountries, () => action(request));
  });
};

export const cloudValidationRules = async (
  request:
    | Parse.Cloud.AfterSaveRequest |
    Parse.Cloud.BeforeSaveRequest |
    Parse.Cloud.BeforeDeleteRequest |
    Parse.Cloud.AfterDeleteRequest |
    Parse.Cloud.FunctionRequest
): Promise<void> => {
  /*
   * when the user who create or update the class is deleted, no need to be logged in
   * `context` only exists on trigger requests, not on FunctionRequest — this union covers both
   */
  if ((request as any).context?.userDeleted) return;
  if ((request as any).context?.isExpressApi) return;

  if (!request.user) {
    throw Error('Validation failed. Please login to continue.');
  }

  if (request.user && !(await isHighestRole(request.user))) {
    throw Error('Access denied.');
  }
};

/**
 * corrects an issue with dirty() that always return true when the object is new,
 * so dirty can return true for a property that's not returned by dirtyKeys()
 * @NOTE it's only work in beforeSave trigger
 * @param parseObj
 * @param field
 * @returns {*}
 */
export const isDirty = (parseObj: Parse.Object, field: string) => {
  if (parseObj.isNew()) {
    return parseObj.get(field) != null; // dirty() always returns true there
  }

  return parseObj.dirty(field);
};

/**
 * Whether a trigger may skip its own work because the save asked for it (`disableTriggers`, or
 * `disableBeforeSave` / `disableAfterSave` for the matching trigger). A client can send any context
 * it likes, so the flag is honoured on the server's own master-key saves only — otherwise a member
 * could save their own row with it and walk past every check the trigger enforces. Call it after
 * whatever must run on every save (status milestones), never before.
 */
export const shouldSkipTriggerCascade = (request: {
  master?: boolean;
  triggerName?: string;
  context?: Record<string, unknown>;
}): boolean => {
  if (!request.master) return false;

  const context = request.context || {};

  if (context.disableTriggers) return true;
  if (request.triggerName === 'beforeSave') return !!context.disableBeforeSave;
  if (request.triggerName === 'afterSave') return !!context.disableAfterSave;
  return false;
};

export const Context = {
  context: {
    disableAfterSave: true,
    disableBeforeSave: true,
  },
};

export const saveTriggerOptions = {
  ...USE_MASTER_KEY,
  ...Context,
};

export const transformIdsToPointersForValues = (
  values: Record<string, any>,
  options: IIdsToTransform[] = []
) => {
  for (const option of options) {
    if (values[option.key]) {
      values[option.className.toLowerCase()] = convertIdToPointer(option.className, values[option.key]);
    }
  }
};

/**
 * The admin behind the write, whether it reached the trigger with their session or through a
 * master-key `save()`/`saveAll()` fired by a Cloud Function on their behalf. A master-key write
 * carries no `request.user` at all, so a bulk "mark as seen" used to stamp `seenBy` with nothing
 * and lose who did it — the Cloud Function now passes the caller's id in the save context
 * (`ACTING_USER_CONTEXT_KEY`) and this resolves it back to a pointer.
 */
export const getActingUser = (
  request: BooleanFieldsRequest
): Parse.User | undefined => {
  if (request.user) return request.user;

  const actingUserId = request.context?.[ACTING_USER_CONTEXT_KEY];

  if (typeof actingUserId !== 'string' || !actingUserId) return undefined;

  return convertIdToPointer<Parse.User>(collections.User, actingUserId);
};

/**
 * What a Cloud Function adds to its master-key save options so the triggers underneath still know
 * which admin asked for the write (see `getActingUser`).
 */
export const actingUserContext = (
  user: Parse.User | undefined
): { context: Record<string, unknown> } => ({
  context: { [ACTING_USER_CONTEXT_KEY]: user?.id },
});

type BooleanFieldsRequest = {
  user?: Parse.User;
  original?: Parse.Object;
  context?: Record<string, any>;
};

/**
 * @NOTE it's only work in beforeSave trigger
 * @example [deleted] => { deletedAt: date, deletedBy: user }
 *
 * `seen` carries three extra fields on top of that pair, because a single date could not say both
 * when a queue item was first picked up and whether anyone has looked at it since:
 * - `seenAt`/`seenBy` are the FIRST opening and are never rewritten — the previous stored value is
 *   read from `request.original`, not from the object being saved, so a partially-loaded object
 *   (a `createWithoutData` save, or a bulk toggle that only selected `objectId`) cannot erase it;
 * - `lastSeenAt`/`lastSeenBy` are rewritten on every opening;
 * - `seenCount` counts the openings, through `increment` so two admins opening the same row at the
 *   same moment do not each write `count + 1` over the other.
 *
 * @param object
 * @param request the trigger request — its `user`, or the admin named in its context (see
 *   `getActingUser`), is who the audit fields name
 * @param fields
 */
export const setBooleanFields = (
  object: Parse.Object,
  request: BooleanFieldsRequest,
  fields: string[] = ['deleted', 'seen']
) => {
  const user = getActingUser(request);

  for (const field of fields) {
    if (!isDirty(object, field)) continue;

    if (object.get(field) !== true) {
      object.set(`un${field}At`, dayjs().toDate());
      object.set(`un${field}By`, user);
      continue;
    }

    if (field !== SEEN_FIELD) {
      object.set(`${field}At`, dayjs().toDate());
      object.set(`${field}By`, user);
      continue;
    }

    const now = dayjs().toDate();
    const hasBeenSeenBefore = !!request.original?.get(`${SEEN_FIELD}At`);

    // first opening only — kept as the record of who took the row out of the queue
    if (!hasBeenSeenBefore) {
      object.set(`${SEEN_FIELD}At`, now);
      object.set(`${SEEN_FIELD}By`, user);
    }

    object.set('lastSeenAt', now);
    object.set('lastSeenBy', user);
    object.increment('seenCount');
  }
};

/**
 * Dates a status change as `<prefix>At` / `<prefix>By`, the prefix being the first two words of the
 * status in camelCase: `CANCELED_BY_DRIVER` → `canceledByAt`, `COMPLETED` → `completedAt`.
 *
 * It runs whoever saves. Most transitions are made by server flows with the master key, which reach
 * the trigger with no user: the date is still written, and the author too when the flow named the
 * admin behind it (see `getActingUser`). Saving back the status an object already had is not a
 * transition and keeps the first date; a save that sets the date itself keeps its own.
 * @NOTE it only works in a beforeSave trigger
 * @param ignoredValues statuses that are not a milestone (e.g. a default written at creation)
 */
export const setStatusFields = (
  object: Parse.Object,
  request: BooleanFieldsRequest,
  field = 'status',
  ignoredValues: string[] = []
): void => {
  if (!isDirty(object, field)) return;

  const status = object.get(field);

  if (typeof status !== 'string' || ignoredValues.includes(status)) return;
  if (request.original?.get(field) === status) return;

  const prefix = formatStatusToCamelCase(status);

  if (!prefix) return;

  if (!isDirty(object, `${prefix}At`)) {
    object.set(`${prefix}At`, dayjs().toDate());
  }

  const user = getActingUser(request);

  if (user && !isDirty(object, `${prefix}By`)) {
    object.set(`${prefix}By`, user);
  }
};

/**
 * Refuses a client save that writes a column only the server may set.
 *
 * The owner pointer permissions give a booking's passenger and driver, and a ride's driver, write
 * access to the whole row — Parse has no per-column CLP. The columns listed by the caller carry
 * money or identity (amounts, seats, payout state, who the row belongs to): written straight from
 * the SDK, they let a passenger raise their own refund or a driver inflate their payout. Throwing
 * rather than reverting keeps a forged save from looking like a success to whoever sent it.
 * @NOTE call it only for saves made without the master key — every server flow uses it
 */
export const assertServerManagedFieldsNotWritten = (
  object: Parse.Object,
  dirtyKeys: string[],
  serverManagedFields: string[],
  locale: Locale = DEFAULT_LANGUAGE
): void => {
  const forbiddenKeys = dirtyKeys.filter((key) => serverManagedFields.includes(key));

  if (forbiddenKeys.length === 0) return;

  logger.warn(
    `Blocked a client write of server-managed fields on ${object.className} ${object.id ?? '(new)'}`,
    { fields: forbiddenKeys }
  );
  throw new Error(translate('error.unauthorizedToDoThisAction', locale));
};
