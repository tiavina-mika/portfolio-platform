import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections, HIGHEST_LEVEL_ROLES, USE_MASTER_KEY } from '@/constants/_core/constants';
import { OwnerAlertEventEnum } from '@/types/ownerAlert.type';
import {
  sendBOInvitationSchema, verifyBOInvitationTokenSchema,
} from '@/validations/_core/invitation.validations';

import { createInvitation, findValidInvitationByToken } from '../../services/_core/invitation.service.cloud';
import { alertOwners } from '../../services/_core/ownerAlert.service.cloud';
import { getRoleLabels } from '../../services/_core/right.service.cloud';
import { assertCanDelegateRoles, getMissingRoleNames } from '../../services/_core/userRole.service.cloud';
import { sendInvitationEmail } from '../../utils/_core/email.utils.cloud';
import { checkOwner } from '../../utils/_core/role.utils.cloud';
import { getUserFullName } from '../../utils/_core/user.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'sendBOInvitation',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { email, roles, locale = DEFAULT_LANGUAGE } = request.params;
    const invitedBy = request.user!;

    /*
     * attaching roles to an invitation is gated like `updateRoleForUser`: a highest role, or the
     * `staff` right within its own bounds. `_User.create` alone (the right checked by fromBO below)
     * is a plausible permission for a non-admin "user management" role, so it is not enough
     */
    await assertCanDelegateRoles(invitedBy, roles as string[]);

    // offering OWNER or SUPER_ADMIN is OWNER-only, like giving and taking them away (see updateRoleForUser)
    if ((roles as string[]).some((roleName) => HIGHEST_LEVEL_ROLES.includes(roleName))) {
      await checkOwner(invitedBy, locale);
    }

    const missingRoleNames = await getMissingRoleNames(roles as string[]);

    if (missingRoleNames.length) {
      throw new Error(translate('user.invitation.unknownRole', locale, { roles: missingRoleNames.join(', ') }));
    }

    const existingUser = await new Parse.Query(Parse.User)
      .equalTo('email', email)
      .equalTo('deleted', false)
      .select(['email'])
      .first(USE_MASTER_KEY);

    if (existingUser) {
      throw new Error(translate('user.invitation.emailAlreadyRegistered', locale));
    }

    const invitation = await createInvitation(email, roles, invitedBy);

    const elevatedRoleNames = (roles as string[])
      .filter((roleName) => HIGHEST_LEVEL_ROLES.includes(roleName));

    if (elevatedRoleNames.length) {
      await alertOwners(OwnerAlertEventEnum.ELEVATED_ROLE_GRANTED, invitedBy, {
        roles: elevatedRoleNames.join(', '),
        target: email,
      });
    }

    const roleLabels = await getRoleLabels(roles as string[], locale);

    const isSent = await sendInvitationEmail({
      email,
      inviterName: getUserFullName(invitedBy) || invitedBy.get('email'),
      token: invitation.get('token'),
      locale,
      roleLabel: roleLabels.join(', '),
    });

    return isSent;
  }, ['create'], collections.User),
  parseFunctionValidation(sendBOInvitationSchema)
);

/**
 * called publicly (before login) from the /invite route to validate the token before
 * rendering the sign-up form — no enumeration of *why* a token is invalid
 */
Parse.Cloud.define(
  'verifyBOInvitationToken',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ email: string }> => {
    const { token, locale = DEFAULT_LANGUAGE } = request.params;

    const invitation = await findValidInvitationByToken(token);

    if (!invitation) {
      throw new Error(translate('user.invitation.invalidOrExpiredInvitation', locale));
    }

    return { email: invitation.get('email') };
  }),
  parseFunctionValidation(verifyBOInvitationTokenSchema)
);
