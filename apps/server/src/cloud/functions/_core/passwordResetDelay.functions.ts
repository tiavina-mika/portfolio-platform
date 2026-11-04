import { cancelPasswordResetDelaySchema } from '@/validations/_core/auth.validations';

import { cancelPasswordResetDelayService } from '../../services/_core/passwordResetDelay.service.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * The "it wasn't me" answer to the alert sent when a password reset was held back on a long-unused
 * account: cancels the pending reset and, when the owner asks for it, warns the support team.
 * Signed-in members only — it is the owner's own session that proves who is answering.
 */
Parse.Cloud.define(
  'cancelPasswordResetDelay',
  parseFunction(async (
    request: Parse.Cloud.FunctionRequest
  ): Promise<{ cancelled: boolean; supportWarned: boolean }> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { warnSupport } = request.params;

    return cancelPasswordResetDelayService(currentUser, { warnSupport });
  }),
  parseFunctionValidation(cancelPasswordResetDelaySchema)
);
