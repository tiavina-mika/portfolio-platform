import { collections } from '@/constants/_core/constants';
import {
  changeMemberContactSchema, changeMemberCountrySchema, resendMemberPhoneCodeSchema,
  sendMemberPasswordResetSchema,
} from '@/validations/_core/admins.validations';

import {
  changeMemberContactService, changeMemberCountryService, resendMemberPhoneVerificationCodeService,
  sendMemberPasswordResetCodeService,
} from '../../services/_core/accountHelp.service.cloud';
import { type ContactChangeInput } from '../../services/_core/contactChange.service.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/*
 * The three ways support helps a member back into an account they can no longer reach — above all a
 * member who signed up by phone, who has no email to recover through. Each one is an edit of
 * someone else's account (so it needs the right to update users), asks for the reason it was done
 * for, and is written in the member's history. The services own the rules; these only open the
 * door to the back-office.
 */

Parse.Cloud.define(
  'resendMemberPhoneVerificationCode',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { userId, reason, locale } = request.params;

    return resendMemberPhoneVerificationCodeService({ userId, reason, locale, admin: request.user! });
  }, ['update'], collections.User),
  parseFunctionValidation(resendMemberPhoneCodeSchema)
);

Parse.Cloud.define(
  'sendMemberPasswordResetCode',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { userId, reason, locale } = request.params;

    return sendMemberPasswordResetCodeService({ userId, reason, locale, admin: request.user! });
  }, ['update'], collections.User),
  parseFunctionValidation(sendMemberPasswordResetSchema)
);

Parse.Cloud.define(
  'changeMemberContact',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<{ success: true }> => {
    const {
      userId, reason, locale, ...input
    } = request.params;

    await changeMemberContactService({
      userId, reason, locale, admin: request.user!, input: input as ContactChangeInput,
    });

    return { success: true };
  }, ['update'], collections.User),
  parseFunctionValidation(changeMemberContactSchema)
);

Parse.Cloud.define(
  'changeMemberCountry',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<{ success: true }> => {
    const {
      userId, reason, locale, country,
    } = request.params;

    await changeMemberCountryService({
      userId, reason, locale, country, admin: request.user!,
    });

    return { success: true };
  }, ['update'], collections.User),
  parseFunctionValidation(changeMemberCountrySchema)
);
