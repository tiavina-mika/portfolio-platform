import { translate } from '@/config/i18n';
import { getRedis } from '@/config/redis';
import {
  SMS_OUT_OF_CREDIT_ALERT_INTERVAL_SECONDS, VERIFICATION_SMS_DAILY_LIMIT_GLOBAL,
} from '@/constants/_core/constants';
import { SLACK_ALERT_ICONS } from '@/constants/_core/slack.constants';
import { onSmsOutOfCredit } from '@/services/sms.service';
import { logger } from '@/utils/_core/logger';
import { onSmsDailyCeilingReached } from '@/utils/_core/sms-quota.utils';

import { getUsersFromRoles } from './userRole.service.cloud';
import { alertStaff } from '../../utils/_core/staff-alert.utils.cloud';

const OUT_OF_CREDIT_ALERT_KEY = 'sms:out-of-credit:alerted';

/**
 * Warns the owners and super-administrators that the SMS provider has no credit left, so the
 * account is topped up before more members wait for a code that cannot be sent. Every refused text
 * lands here, so the e-mail goes out once per `SMS_OUT_OF_CREDIT_ALERT_INTERVAL_SECONDS`: the
 * Redis key is written atomically (`NX`), which also keeps several server instances from each
 * sending their own.
 * @returns whether an e-mail round was started by this call
 */
export const alertStaffOfSmsOutOfCredit = async (): Promise<boolean> => {
  logger.error('The SMS provider refused a text: the account has no credit left');

  const isFirstAlert = await getRedis().set(OUT_OF_CREDIT_ALERT_KEY, Date.now(), {
    nx: true,
    ex: SMS_OUT_OF_CREDIT_ALERT_INTERVAL_SECONDS,
  });

  if (!isFirstAlert) return false;

  const admins = await getUsersFromRoles(['OWNER', 'SUPER_ADMIN']);
  const failures = await alertStaff(admins, (locale) => ({
    subject: translate('email.smsOutOfCreditSubject', locale),
    message: translate('email.smsOutOfCreditMessage', locale),
  }), { icon: SLACK_ALERT_ICONS.sms });

  failures.forEach(({ error }) => {
    logger.error('SMS out-of-credit alert e-mail failed', error);
  });

  return true;
};

// the SMS service is Parse-free and cannot reach the staff: it calls back into this alert
onSmsOutOfCredit(async () => {
  try {
    await alertStaffOfSmsOutOfCredit();
  }
  catch (error) {
    logger.error('SMS out-of-credit alert failed', { error: (error as Error).message });
  }
});

const DAILY_CEILING_ALERT_KEY = 'sms:daily-ceiling:alerted';
const ONE_DAY_SECONDS = 24 * 60 * 60;

/**
 * Warns the owners and super-administrators that the platform reached its daily ceiling of
 * verification SMS, so they know real members are now refused a code and can tell an attack from a
 * busy day (and raise the ceiling if it is the latter). Once per day: the Redis key is written
 * atomically (`NX`), which also keeps several server instances from each sending their own.
 * @returns whether an e-mail round was started by this call
 */
export const alertStaffOfSmsDailyCeiling = async (): Promise<boolean> => {
  logger.error('The daily ceiling of verification SMS was reached: sign-up texts are refused');

  const isFirstAlert = await getRedis().set(DAILY_CEILING_ALERT_KEY, Date.now(), {
    nx: true,
    ex: ONE_DAY_SECONDS,
  });

  if (!isFirstAlert) return false;

  const admins = await getUsersFromRoles(['OWNER', 'SUPER_ADMIN']);
  const failures = await alertStaff(admins, (locale) => ({
    subject: translate('email.smsDailyCeilingSubject', locale),
    message: translate('email.smsDailyCeilingMessage', locale, {
      limit: String(VERIFICATION_SMS_DAILY_LIMIT_GLOBAL),
    }),
  }), { icon: SLACK_ALERT_ICONS.sms });

  failures.forEach(({ error }) => {
    logger.error('SMS daily ceiling alert e-mail failed', error);
  });

  return true;
};

// the quota util is Parse-free and cannot reach the staff: it calls back into this alert
onSmsDailyCeilingReached(async () => {
  try {
    await alertStaffOfSmsDailyCeiling();
  }
  catch (error) {
    logger.error('SMS daily ceiling alert failed', { error: (error as Error).message });
  }
});
