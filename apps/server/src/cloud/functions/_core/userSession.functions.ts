import type { Locale } from '@/types/app.type';
import type { AdminUserSession } from '@/types/userSession.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import { consumeDeviceRegistrationQuota } from '@/utils/_core/rate-limit.utils';
import {
  registerSessionSchema, revokeSessionSchema, getUserSessionsSchema, registerPushTokenSchema,
  revokeOtherSessionsSchema, adminGetUserSessionsSchema, adminRevokeUserSessionSchema,
  adminRevokeAllUserSessionsSchema, unregisterPushTokenSchema,
} from '@/validations/_core/userSession.validations';

import {
  getUserSessionsService, registerSessionService, revokeSessionService, registerPushTokenService,
  revokeOtherSessionsService, getActiveSessionsForAdminService, revokeSessionForAdminService,
  revokeAllSessionsForAdminService, unregisterPushTokenService,
} from '../../services/_core/userSession.service.cloud';
import { assertInAgentCountries } from '../../utils/_core/agent-scope.utils.cloud';
import { getClientIp } from '../../utils/_core/parse.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * The two login-time device registrations share one allowance per account and per address — each
 * new device id they accept can send a "new device" alert, by SMS for an account with no e-mail.
 */
const assertDeviceRegistrationAllowed = async (
  request: Parse.Cloud.FunctionRequest,
  user: Parse.User,
  locale: Locale
): Promise<void> => {
  if (!(await consumeDeviceRegistrationQuota(user.id, getClientIp(request)))) {
    throw new Error(translate('error.tooManyDeviceRegistrations', locale));
  }
};

Parse.Cloud.define(
  'registerSession',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const {
      deviceId, deviceName, platform, appVersion, locale = DEFAULT_LANGUAGE,
    } = request.params;
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    await assertDeviceRegistrationAllowed(request, user, locale);

    return registerSessionService(user, { deviceId, deviceName, platform, appVersion }, locale);
  }),
  parseFunctionValidation(registerSessionSchema)
);

Parse.Cloud.define(
  'getUserSessions',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ results: any[] }> => {
    const { locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    const sessions = await getUserSessionsService(user);
    const currentSessionToken = user.getSessionToken();

    const results = sessions.map((session) => ({
      id: session.id,
      deviceName: session.get('deviceName'),
      platform: session.get('platform'),
      appVersion: session.get('appVersion'),
      lastActiveAt: session.get('lastActiveAt'),
      isCurrent: session.get('sessionToken') === currentSessionToken,
    }));

    return { results };
  }),
  parseFunctionValidation(getUserSessionsSchema)
);

Parse.Cloud.define(
  'registerPushToken',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { deviceId, pushToken, locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    await assertDeviceRegistrationAllowed(request, user, locale);

    return registerPushTokenService(user, deviceId, pushToken);
  }),
  parseFunctionValidation(registerPushTokenSchema)
);

/**
 * Called by the app right before it logs out: this device stops receiving the account's pushes
 * even if the logout request that follows never reaches the server.
 */
Parse.Cloud.define(
  'unregisterPushToken',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { deviceId, locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    await unregisterPushTokenService(user, deviceId);
  }),
  parseFunctionValidation(unregisterPushTokenSchema)
);

Parse.Cloud.define(
  'revokeSession',
  parseFunction((request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { sessionId, locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      return Promise.reject(new Error(translate('error.pleaseLogin', locale)));
    }

    return revokeSessionService(user, sessionId, locale);
  }),
  parseFunctionValidation(revokeSessionSchema)
);

Parse.Cloud.define(
  'revokeOtherSessions',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ count: number }> => {
    const { locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    const count = await revokeOtherSessionsService(user, user.getSessionToken());

    return { count };
  }),
  parseFunctionValidation(revokeOtherSessionsSchema)
);

/*
 * ------------------------------------------------------------------------------------------------ //
 * back-office: support acting on the sessions of another user (stolen phone, SIM swap). Reading
 * them takes the `get` right on users, closing them the `update` right — the same split as reading
 * and editing the rest of the account.
 * ------------------------------------------------------------------------------------------------ //
 */

Parse.Cloud.define(
  'adminGetUserSessions',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<{ results: AdminUserSession[] }> => {
    const { userId, locale = DEFAULT_LANGUAGE } = request.params;

    await assertInAgentCountries(collections.User, userId);

    const results = await getActiveSessionsForAdminService(userId, locale);

    return { results };
  }, ['get'], collections.User),
  parseFunctionValidation(adminGetUserSessionsSchema)
);

Parse.Cloud.define(
  'adminRevokeUserSession',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { userId, sessionId, locale = DEFAULT_LANGUAGE } = request.params;

    await assertInAgentCountries(collections.User, userId);

    await revokeSessionForAdminService(request.user!, userId, sessionId, locale);
  }, ['update'], collections.User),
  parseFunctionValidation(adminRevokeUserSessionSchema)
);

Parse.Cloud.define(
  'adminRevokeAllUserSessions',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { userId, locale = DEFAULT_LANGUAGE } = request.params;

    await assertInAgentCountries(collections.User, userId);

    await revokeAllSessionsForAdminService(request.user!, userId, locale);
  }, ['update'], collections.User),
  parseFunctionValidation(adminRevokeAllUserSessionsSchema)
);
