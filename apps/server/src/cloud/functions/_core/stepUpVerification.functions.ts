import type { StepUpRequestResult } from '@/types/auth.type';

import {
  requestStepUpVerificationSchema, verifyStepUpCodeSchema,
} from '@/validations/_core/auth.validations';

import {
  confirmStepUpVerificationService, requestStepUpVerificationService,
} from '../../services/_core/stepUpVerification.service.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * Sends a fresh re-verification code to the current user, to be confirmed via verifyStepUpCode
 * right before a sensitive action (e.g. deleteAccount) — see stepUpVerification.service.cloud.ts.
 */
Parse.Cloud.define(
  'requestStepUpVerification',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<StepUpRequestResult> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { locale } = request.params;

    return requestStepUpVerificationService(currentUser, locale);
  }),
  parseFunctionValidation(requestStepUpVerificationSchema)
);

Parse.Cloud.define(
  'verifyStepUpCode',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ success: true }> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { code, locale } = request.params;

    await confirmStepUpVerificationService(currentUser, code, locale);

    return { success: true };
  }),
  parseFunctionValidation(verifyStepUpCodeSchema)
);
