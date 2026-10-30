import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

import { DeliveryFailedIcon } from '@/components/icons/NotificationChannelIcons';
import { NOTIFICATION_DELIVERY_CELL_GLYPH_SIZE } from '@/constants/_core/ui/inbox.constants';
import { INotification } from '@/types/_core/notification.type';
import {
  getNotificationChannelLabel, getNotificationChannelSummaries,
} from '@/utils/_core/notification.utils';

type Props = {
  notification: INotification;
};

/**
 * One chip per channel a provider refused the send on — "1 échec SMS". A refusal is named next to
 * the send's title rather than left for the delivery section to reveal, because it is the reason
 * most of these pages get opened.
 */
const NotificationFailureChips = ({ notification }: Props) => {
  const { t } = useTranslation(['user']);

  const failedSummaries = getNotificationChannelSummaries(notification)
    .filter((summary) => summary.failed > 0);

  return (
    <>
      {failedSummaries.map((summary) => (
        <Chip
          color="error"
          icon={<DeliveryFailedIcon size={NOTIFICATION_DELIVERY_CELL_GLYPH_SIZE} />}
          key={summary.channel}
          size="small"
          label={t('user:notifications.channelFailures', {
            count: summary.failed,
            channel: getNotificationChannelLabel(summary.channel),
          })}
        />
      ))}
    </>
  );
};

export default NotificationFailureChips;
