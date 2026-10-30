import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { IMPERSONATION_UI_RIGHT } from '@/constants/_core/constants';
import {
  impersonateUserSchema, endImpersonationSessionSchema,
} from '@/validations/_core/impersonation.validations';

import {
  createImpersonationSessionService,
  endImpersonationSessionService,
  endOwnImpersonationSessionService,
} from '../../services/_core/impersonation.service.cloud';
import { assertHasBoRight, isRequestFromManager } from '../../utils/_core/role.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'impersonateUser',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const { userId, reason, locale = DEFAULT_LANGUAGE } = request.params;
    const { user: admin } = request;

    if (!admin) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    await assertHasBoRight(admin, IMPERSONATION_UI_RIGHT, locale);

    return createImpersonationSessionService(admin, userId, reason, locale);
  }),
  parseFunctionValidation(impersonateUserSchema)
);

Parse.Cloud.define(
  'endImpersonationSession',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { sessionId, locale = DEFAULT_LANGUAGE } = request.params;
    const { user } = request;

    if (!user) {
      throw new Error(translate('error.pleaseLogin', locale));
    }

    const isBOUser = await isRequestFromManager(request);

    if (isBOUser) {
      await assertHasBoRight(user, IMPERSONATION_UI_RIGHT, locale);

      return endImpersonationSessionService(sessionId, locale);
    }

    return endOwnImpersonationSessionService(user, sessionId, locale);
  }),
  parseFunctionValidation(endImpersonationSessionSchema)
);
