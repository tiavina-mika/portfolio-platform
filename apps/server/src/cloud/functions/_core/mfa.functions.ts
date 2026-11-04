import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { OwnerAlertEventEnum } from '@/types/ownerAlert.type';
import {
  adminResetMfaSchema, confirmMfaEnrollmentSchema, disableMfaSchema, generateMfaSecretSchema,
  regenerateMfaBackupCodesSchema, verifyMfaLoginSchema,
} from '@/validations/_core/auth.validations';

import {
  adminResetMfaService, confirmMfaEnrollmentService, disableMfaService, enrollMfaService,
  regenerateMfaBackupCodesService, verifyMfaLoginService,
} from '../../services/_core/mfa.service.cloud';
import { alertOwners } from '../../services/_core/ownerAlert.service.cloud';
import { hasRoleAsManager } from '../../services/_core/userRole.service.cloud';
import { revokeOtherSessionsService } from '../../services/_core/userSession.service.cloud';
import { checkOwner } from '../../utils/_core/role.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * Only back-office accounts have a screen for the second factor: a member of the mobile app who
 * enabled it would be refused at the next sign-in by a screen that cannot read the challenge.
 */
const getBackOfficeUser = async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User> => {
  const currentUser = request.user;

  if (!currentUser) throw new Error('Unauthorized');
  if (!(await hasRoleAsManager(currentUser))) throw new Error('Unauthorized');

  return currentUser;
};

Parse.Cloud.define(
  'generateMfaSecret',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ otpauthUrl: string }> => {
    const currentUser = await getBackOfficeUser(request);
    const { password, locale } = request.params;

    return enrollMfaService(currentUser, password, locale);
  }),
  parseFunctionValidation(generateMfaSecretSchema)
);

Parse.Cloud.define(
  'confirmMfaEnrollment',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ backupCodes: string[] }> => {
    const currentUser = await getBackOfficeUser(request);
    const { code, locale } = request.params;
    const result = await confirmMfaEnrollmentService(currentUser, code, locale);

    // the protection of the account just changed: sessions opened before it must not survive it
    await revokeOtherSessionsService(currentUser, currentUser.getSessionToken());

    return result;
  }),
  parseFunctionValidation(confirmMfaEnrollmentSchema)
);

/**
 * Public — called after a correct password submits a `MFA_REQUIRED` challenge from beforeLogin,
 * before any session exists yet for this attempt.
 */
Parse.Cloud.define(
  'verifyMfaLogin',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ sessionToken: string }> => {
    const { mfaChallengeToken, code, locale } = request.params;

    return verifyMfaLoginService(mfaChallengeToken, code, locale);
  }),
  parseFunctionValidation(verifyMfaLoginSchema)
);

Parse.Cloud.define(
  'disableMfa',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ success: true }> => {
    const currentUser = await getBackOfficeUser(request);
    const { code, locale } = request.params;

    await disableMfaService(currentUser, code, locale);
    await revokeOtherSessionsService(currentUser, currentUser.getSessionToken());

    return { success: true };
  }),
  parseFunctionValidation(disableMfaSchema)
);

Parse.Cloud.define(
  'regenerateMfaBackupCodes',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ backupCodes: string[] }> => {
    const currentUser = await getBackOfficeUser(request);
    const { code, locale } = request.params;

    return regenerateMfaBackupCodesService(currentUser, code, locale);
  }),
  parseFunctionValidation(regenerateMfaBackupCodesSchema)
);

/**
 * OWNER-only support path — see role.utils.cloud.ts `checkOwner` for why this is stricter than
 * `checkHighestRole`: a compromised SUPER_ADMIN must not be able to reset another admin's MFA.
 */
Parse.Cloud.define(
  'adminResetMfa',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ success: true }> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const { userId, locale } = request.params;

    await checkOwner(currentUser, locale);
    await adminResetMfaService(currentUser, userId);

    const target = await new Parse.Query(Parse.User).select(['email']).get(userId, USE_MASTER_KEY);

    // the other owners hear of it: a reset second factor is the first step of taking an account over
    await alertOwners(OwnerAlertEventEnum.MFA_RESET, currentUser, { target: target.get('email') || target.id });

    return { success: true };
  }),
  parseFunctionValidation(adminResetMfaSchema)
);
