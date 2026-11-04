import {
  confirmContactChangeSchema, requestContactChangeSchema,
} from '@/validations/_core/user.validations';

import {
  type ContactChangeInput, confirmContactChangeService, requestContactChangeService,
} from '../../services/_core/contactChange.service.cloud';
import { getClientIp } from '../../utils/_core/parse.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * Sends a code to the email or phone number the current user wants to sign in with instead — see
 * contactChange.service.cloud.ts. Nothing changes on the account until `confirmContactChange`.
 * Refused with `STEP_UP_REQUIRED` until the member has confirmed a code sent to their current contact
 * (`requestStepUpVerification` then `verifyStepUpCode`).
 */
Parse.Cloud.define(
  'requestContactChange',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { locale, ...input } = request.params;

    const ip = getClientIp(request);

    return requestContactChangeService(currentUser, input as ContactChangeInput, locale, ip);
  }),
  parseFunctionValidation(requestContactChangeSchema)
);

Parse.Cloud.define(
  'confirmContactChange',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ success: true }> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { code, locale } = request.params;

    await confirmContactChangeService(currentUser, code, locale);

    return { success: true };
  }),
  parseFunctionValidation(confirmContactChangeSchema)
);
