import type { Locale } from '@/types/app.type';
import type { NotificationChannelRecipient } from '@/types/notification.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { SMS_DEVICE_NAME_MAX_LENGTH } from '@/constants/_core/constants';
import { NotificationChannelStatusEnum } from '@/types/notification.type';
import { getChannelRecipientFromResult } from '@/utils/_core/notification.utils';

import { sendSmsToUserWithResult } from '../../utils/_core/sms.utils.cloud';

export const sendNewDeviceLoginSms = async (
  user: Parse.User,
  deviceName: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<NotificationChannelRecipient[]> => {
  // no number on file is nothing to send to, not a delivery that failed
  if (!user.get('phone')?.number) {
    return [{ toId: user.id, status: NotificationChannelStatusEnum.SMS_NO_PHONE }];
  }

  // the name comes from the phone and is unbounded: cut so the text stays inside one SMS segment
  const message = translate('sms.newDeviceLogin', locale, {
    deviceName: deviceName.slice(0, SMS_DEVICE_NAME_MAX_LENGTH),
  });
  const result = await sendSmsToUserWithResult(user, message);

  return [getChannelRecipientFromResult(user.id, result)];
};
