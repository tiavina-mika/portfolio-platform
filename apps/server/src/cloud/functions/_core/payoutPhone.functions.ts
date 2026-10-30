import type { Locale } from '@/types/app.type';
import type { Phone } from '@/types/user.type';

import {
  confirmPayoutPhoneVerificationSchema, requestPayoutPhoneVerificationSchema,
} from '@/validations/_core/user.validations';

import {
  confirmPayoutPhoneVerificationService, requestPayoutPhoneVerificationService,
} from '../../services/_core/payoutPhone.service.cloud';
import { getClientIp } from '../../utils/_core/parse.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * Texts a code to a number the current driver wants to be paid on — see payoutPhone.service.cloud.ts.
 * The number is not usable for a payout until `confirmPayoutPhoneVerification`.
 */
Parse.Cloud.define(
  'requestPayoutPhoneVerification',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { phone, locale } = request.params as { phone: Phone; locale?: Locale };

    return requestPayoutPhoneVerificationService(currentUser, phone, locale, getClientIp(request));
  }),
  parseFunctionValidation(requestPayoutPhoneVerificationSchema)
);

/** Confirms the code and returns the numbers the driver can now be paid on */
Parse.Cloud.define(
  'confirmPayoutPhoneVerification',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Phone[]> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { code, locale } = request.params;

    return confirmPayoutPhoneVerificationService(currentUser, code, locale);
  }),
  parseFunctionValidation(confirmPayoutPhoneVerificationSchema)
);
