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
  MFA_RESET = 'mfaReset',
  // a refund or an early payout release at or above LARGE_MONEY_ACTION_ALERT_AMOUNTS
  LARGE_MONEY_ACTION = 'largeMoneyAction'
}

/**
 * the money actions of the back-office the owners hear of past a threshold — each names its
 * `email.ownerAlert.moneyActions.<value>` label
 */
export type LargeMoneyActionType = 'refund' | 'payoutRelease' | 'ridePassengersRefund';
