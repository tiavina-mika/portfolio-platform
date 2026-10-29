import type { Locale } from '@/types/app.type';
import type { EmailRecipient } from '@/types/email.type';
import type { NotificationChannelRecipient } from '@/types/notification.type';

import { translate, DEFAULT_LANGUAGE } from '@/config/i18n';
import { formatDateInAppTimezone } from '@/utils/_core/date.utils';
import { getChannelRecipientFromResult } from '@/utils/_core/notification.utils';
import { formatFullName } from '@/utils/_core/user.utils';

import {
  sendEmailToRecipient, sendEmailToUser, sendEmailToUserWithResult,
} from '../../utils/_core/email.utils.cloud';

export const sendWelcomeEmail = async (
  recipient: EmailRecipient,
  locale: Locale = DEFAULT_LANGUAGE,
  sender?: string
): Promise<boolean> => {
  return sendEmailToRecipient(recipient, {
    subject: translate('email.welcomeSubject', locale),
    message: translate('email.welcomeMessage', locale, {
      fullName: formatFullName(recipient.firstName, recipient.lastName) || recipient.email,
    }),
    sender,
  });
};

export const sendAccountReactivatedEmail = async (
  user: Parse.User,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  await sendEmailToUser(user, {
    subject: translate('email.accountReactivatedSubject', locale),
    message: translate('email.accountReactivatedMessage', locale),
  });
};

/**
 * Security alert, deliberately not routed through the notification-preference check the other
 * emails use: someone who just had their account opened on an unknown device must hear about it
 * even if they muted account notifications.
 */
export const sendNewDeviceLoginEmail = async (
  user: Parse.User,
  deviceName: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<NotificationChannelRecipient[]> => {
  const result = await sendEmailToUserWithResult(user, {
    subject: translate('email.newDeviceLoginSubject', locale),
    message: translate('email.newDeviceLoginMessage', locale, { deviceName }),
  });

  return [getChannelRecipientFromResult(user.id, result)];
};

/**
 * Security alert for a password reset held back on a long-unused account — the channel that reaches
 * the original owner when the phone number was recycled. Like the new-device alert, it ignores the
 * notification preferences: it is the only warning they will get.
 */
export const sendPasswordResetDelayedEmail = async (
  user: Parse.User,
  availableAt: Date,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<boolean> => sendEmailToUser(user, {
  subject: translate('email.passwordResetDelayedSubject', locale),
  message: translate('email.passwordResetDelayedMessage', locale, {
    date: formatDateInAppTimezone(availableAt),
  }),
  locale,
});
