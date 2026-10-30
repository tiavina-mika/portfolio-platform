import { PASSWORD_RESET_DELAYED_STATUS } from '@shared/constants';
import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { RECYCLED_NUMBER_RESET_DELAY_HOURS, USE_MASTER_KEY } from '@/constants/_core/constants';
import { ACCOUNT_NOTIFICATION_TYPE } from '@/constants/_core/notification.constants';
import { SLACK_ALERT_ICONS } from '@/constants/_core/slack.constants';
import { USER_BO_PATH } from '@/constants/_core/user.constants';
import { getResetAvailableAt, isAccountInactive } from '@/utils/_core/account-activity.utils';
import { logger } from '@/utils/_core/logger';
import { getServerUrl } from '@/utils/_core/utils';

import { getTicketAgentsService } from './contact-list.service.cloud';
import { createNotification } from './notification.service.cloud';
import { sendPasswordResetDelayedEmail } from '../../emails/_core/user.email';
import { alertStaff } from '../../utils/_core/staff-alert.utils.cloud';

/** The column holding an account's pending reset delay. Server-managed: a client never writes it. */
export const PASSWORD_RESET_DELAY_FIELD = 'passwordResetDelay';

/** The column holding the single-use token a confirmed reset hands out. Server-managed too. */
const PASSWORD_RESET_TOKEN_FIELD = 'passwordResetToken';

/** What the account keeps of a delay in progress. */
export type PasswordResetDelay = {
  startedAt: Date;
  availableAt: Date;
};

/**
 * The delay on file, only while it still matters: pending (`availableAt` not reached) or served
 * and still claimable. A served delay is claimable for the same length of time again — long enough
 * to come back and finish the reset, short enough that an old leftover cannot be used months later
 * to skip the alert a fresh request would raise.
 */
const readDelay = (user: Parse.User): { availableAt: Date; claimableUntil: Date } | undefined => {
  const delay = user.get(PASSWORD_RESET_DELAY_FIELD) as PasswordResetDelay | undefined;

  if (!delay?.availableAt) return undefined;

  const availableAt = new Date(delay.availableAt);

  return {
    availableAt,
    claimableUntil: dayjs(availableAt).add(RECYCLED_NUMBER_RESET_DELAY_HOURS, 'hour').toDate(),
  };
};

/**
 * Warns the account's owner that a reset was started on it. The push goes to every device the
 * account is registered on (the last known ones included) and the email to the address on file when
 * it is confirmed — an unconfirmed one proves nothing about who would read it. Both ignore the
 * notification preferences: this is the owner's only chance to notice a recycled number.
 * Never throws: the delay is already recorded and must not be undone by a failed alert.
 */
const alertAccountOwner = async (user: Parse.User, availableAt: Date, locale: Locale): Promise<void> => {
  try {
    await createNotification({
      type: ACCOUNT_NOTIFICATION_TYPE,
      to: [user],
      status: PASSWORD_RESET_DELAYED_STATUS,
      payload: { reset: { availableAt } },
    });
  }
  catch (error) {
    logger.error('Password reset delay: push alert failed', {
      userId: user.id, error: (error as Error).message,
    });
  }

  if (!user.get('email') || !user.get('emailVerified')) return;

  try {
    await sendPasswordResetDelayedEmail(user, availableAt, locale);
  }
  catch (error) {
    logger.error('Password reset delay: email alert failed', {
      userId: user.id, error: (error as Error).message,
    });
  }
};

/**
 * Decides whether a password reset confirmed by SMS right now must wait, and records it.
 *
 * An operator can hand a number to a new person; if the account that number once belonged to has
 * gone unused for a long time, the SMS code proves nothing about who is typing it. The reset then
 * waits `RECYCLED_NUMBER_RESET_DELAY_HOURS`, during which the original owner is alerted and can
 * sign in to cancel it (a sign-in clears the delay, see the `beforeLogin` trigger) or answer "it
 * wasn't me" from the alert (see `cancelPasswordResetDelayService`). Accounts in regular use are
 * never held.
 *
 * - no delay on file, account inactive → a delay starts now and the owner is alerted (once);
 * - delay on file, not yet reached → still held, same date, no second alert;
 * - delay on file, reached and claimable → served: cleared, and the reset goes through;
 * - delay on file, reached but no longer claimable → treated as absent, so an inactive account
 *   starts a fresh one.
 *
 * Saves the account when it changes the delay column (master key).
 * @returns the date the reset may take effect when it is held back, `undefined` when it may proceed
 */
export const getSmsResetHoldDate = async (
  user: Parse.User,
  locale: Locale = DEFAULT_LANGUAGE,
  now: Date = new Date()
): Promise<Date | undefined> => {
  const delay = readDelay(user);

  if (delay) {
    if (delay.availableAt > now) return delay.availableAt;

    if (delay.claimableUntil > now) {
      user.unset(PASSWORD_RESET_DELAY_FIELD);
      return undefined;
    }

    user.unset(PASSWORD_RESET_DELAY_FIELD);
  }

  const account = {
    lastLoginAt: user.get('lastLoginAt') ? new Date(user.get('lastLoginAt')) : undefined,
    createdAt: user.createdAt,
  };

  if (!isAccountInactive(account, now)) return undefined;

  const availableAt = getResetAvailableAt(now);

  user.set(PASSWORD_RESET_DELAY_FIELD, { startedAt: now, availableAt } satisfies PasswordResetDelay);
  await user.save(null, USE_MASTER_KEY);

  logger.info('Password reset by SMS held back on an inactive account', { userId: user.id, availableAt });

  await alertAccountOwner(user, availableAt, locale);

  return availableAt;
};

/**
 * E-mails the support agents that an account's owner says the reset held back on it was not theirs —
 * the one sign that a phone number was recycled or someone is trying to take the account over.
 * Never throws: the reset is already cancelled, and a mail error must not turn that into a failure.
 */
const warnSupportOfContestedReset = async (user: Parse.User): Promise<void> => {
  try {
    const agents = await getTicketAgentsService();
    const name = [user.get('firstName'), user.get('lastName')].filter(Boolean).join(' ');
    const failures = await alertStaff(agents, (locale) => ({
      subject: translate('email.passwordResetContestedSubject', locale),
      message: translate('email.passwordResetContestedMessage', locale, { name, userId: user.id }),
    }), { icon: SLACK_ALERT_ICONS.security, url: `${getServerUrl()}/${USER_BO_PATH}/${user.id}` });

    failures.forEach(({ recipient, error }) => (
      logger.error(`Contested password reset e-mail failed for agent ${recipient.id}`, error)
    ));
  }
  catch (error) {
    logger.error('Contested password reset: support warning failed', {
      userId: user.id, error: (error as Error).message,
    });
  }
};

type CancelPasswordResetDelayOptions = {
  /** also e-mail the support agents, so they can look into the account */
  warnSupport?: boolean;
};

/**
 * What the owner of an account does with the "it wasn't me" answer to the alert: the reset held back
 * on the account is cancelled, along with the token the person who asked for it was given — it is
 * worthless from then on, exactly as when the owner signs in (see `markUserSignedIn`).
 *
 * Idempotent: with no reset pending (already served, cancelled by a sign-in, or never started) it
 * changes nothing and says so, which is also what stops the support warning from being raised
 * again by a second tap.
 * @returns whether a pending reset was actually cancelled, and whether support was warned of it
 */
export const cancelPasswordResetDelayService = async (
  user: Parse.User,
  { warnSupport = false }: CancelPasswordResetDelayOptions = {}
): Promise<{ cancelled: boolean; supportWarned: boolean }> => {
  if (!user.has(PASSWORD_RESET_DELAY_FIELD) && !user.has(PASSWORD_RESET_TOKEN_FIELD)) {
    return { cancelled: false, supportWarned: false };
  }

  user.unset(PASSWORD_RESET_DELAY_FIELD);
  user.unset(PASSWORD_RESET_TOKEN_FIELD);
  await user.save(null, USE_MASTER_KEY);

  logger.info('Password reset cancelled by the account owner', { userId: user.id, warnSupport });

  if (warnSupport) await warnSupportOfContestedReset(user);

  return { cancelled: true, supportWarned: warnSupport };
};
