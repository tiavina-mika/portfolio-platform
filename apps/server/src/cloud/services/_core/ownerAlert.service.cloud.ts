import type { Locale } from '@/types/app.type';
import type { User } from 'parse';

import { translate } from '@/config/i18n';
import { HIGHEST_LEVEL_ROLES } from '@/constants/_core/constants';
import { type LargeMoneyActionType, OwnerAlertEventEnum } from '@/types/ownerAlert.type';
import { logger } from '@/utils/_core/logger';
import { isLargeMoneyAction } from '@/utils/_core/payment.utils';

import { getUsersFromRoles } from './userRole.service.cloud';
import { sendEmailToStaffInTheirOwnLocale } from '../../utils/_core/email.utils.cloud';
import { getUserFullName } from '../../utils/_core/user.utils.cloud';

/**
 * how an account is named in an alert: its name, its address when it has none — and, with no account
 * at all, the server itself (the OWNERS_EMAILS bootstrap, a job)
 */
const getActorLabel = (locale: Locale, actor?: User): string => {
  if (!actor) return translate('email.ownerAlert.serverActor', locale);

  return getUserFullName(actor) || actor.get('email') || actor.id;
};

/**
 * Tells every OWNER, by e-mail in their own language, that one of the highest powers was just used.
 * The owners are not employees and seldom open the back-office: the e-mail is the only way they see
 * a compromised account, or an employee given more than they should have, before it is too late.
 *
 * E-mail only, never the Slack alert channel: every member of the staff reads that channel, and who
 * holds the highest roles, or when they sign in, is not for everybody to read.
 *
 * Never throws: the action it reports has already happened, and a failed alert must not turn it into
 * an error. A failure is logged.
 * @param event what happened — names the `email.ownerAlert.<event>` texts
 * @param actor the account that did it, if any (left out, the server did)
 * @param params the other values the texts quote (a role, an e-mail address, an amount…)
 */
export const alertOwners = async (
  event: OwnerAlertEventEnum,
  actor?: User,
  params: Record<string, string> | ((locale: Locale) => Record<string, string>) = {}
): Promise<void> => {
  try {
    const owners = await getUsersFromRoles([HIGHEST_LEVEL_ROLES[0]!]);
    const failures = await sendEmailToStaffInTheirOwnLocale(owners, (locale) => {
      const localeParams = typeof params === 'function' ? params(locale) : params;
      const values = { ...localeParams, actor: getActorLabel(locale, actor) };

      return {
        subject: translate(`email.ownerAlert.${event}.subject`, locale, values),
        message: translate(`email.ownerAlert.${event}.message`, locale, values),
        alert: translate('email.ownerAlert.notYou', locale),
      };
    });

    failures.forEach(({ recipient, error }) => {
      logger.error(`Owner alert "${event}" could not be e-mailed to ${recipient.id}`, { error });
    });
  }
  catch (error) {
    logger.error(`Owner alert "${event}" could not be sent`, { error: (error as Error).stack });
  }
};

/**
 * Tells the owners of a refund or an early payout release taken from the back-office, when its
 * amount reaches LARGE_MONEY_ACTION_ALERT_AMOUNTS. These actions only need the `update` right on
 * their collection: the alert is how a mistake, or a staff account used to drain the merchant
 * account, reaches someone who can stop it.
 * @param reference the payment or the ride the money moved on, for the owner to look it up
 */
export const alertOwnersOfLargeMoneyAction = async (
  action: LargeMoneyActionType,
  actor: User,
  { amount, currency, reference }: { amount?: number; currency?: string; reference: string }
): Promise<void> => {
  if (!isLargeMoneyAction(amount, currency)) return;

  await alertOwners(OwnerAlertEventEnum.LARGE_MONEY_ACTION, actor, (locale) => ({
    action: translate(`email.ownerAlert.moneyActions.${action}`, locale),
    amount: `${amount} ${currency}`,
    reference,
  }));
};
