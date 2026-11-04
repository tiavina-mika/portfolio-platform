/**
 * What the owners are told about by e-mail. The owners are not employees and seldom open the
 * back-office, so the e-mail is how they see the highest powers being used — each value names its
 * own `email.ownerAlert.<value>` subject and message.
 */
export enum OwnerAlertEventEnum {
  // an OWNER or a SUPER_ADMIN opened a back-office session
  HIGHEST_ROLE_LOGIN = 'highestRoleLogin',
  // OWNER or SUPER_ADMIN was given to an account, or offered in an invitation
  ELEVATED_ROLE_GRANTED = 'elevatedRoleGranted',
  ELEVATED_ROLE_REVOKED = 'elevatedRoleRevoked',
  IMPERSONATION_STARTED = 'impersonationStarted',
  USERS_DESTROYED = 'usersDestroyed',
  MFA_RESET = 'mfaReset'
}
