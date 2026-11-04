import { useTranslation } from 'react-i18next';

import type { NotificationChannel } from '@shared/types';

import Dialog from '@/components/Dialog';
import NotificationRecipientsTable from '@/containers/_core/notification/NotificationRecipientsTable';
import { INotification } from '@/types/_core/notification.type';
import { getNotificationMessage } from '@/utils/_core/notification.utils';

type Props = {
  notification: INotification | null;
  onClose: () => void;
  /** Pushes the send again to one recipient. Absent when the account may not act on the row. */
  onRetry?: (userId: string, channel: NotificationChannel) => void;
  /** The channels this send can go out on again — the push alone when left out. */
  resendableChannels?: NotificationChannel[];
};

/**
 * The per-recipient grid of one send, opened from its list row without leaving the list — the same
 * grid the notification's own page draws, so the two can never disagree about who got what.
 */
const NotificationDeliveryDialog = ({
  notification, onClose, onRetry, resendableChannels,
}: Props) => {
  const { t } = useTranslation(['user']);

  if (!notification) return null;

  return (
    <Dialog
      fullWidth
      description={getNotificationMessage(notification)}
      maxWidth="md"
      onClose={onClose}
      open={!!notification}
      title={t('user:notifications.deliveryPerRecipient')}
      toggle={onClose}
      withCancelButton={false}
    >
      <NotificationRecipientsTable
        notification={notification}
        onRetry={onRetry}
        resendableChannels={resendableChannels}
      />
    </Dialog>
  );
};

export default NotificationDeliveryDialog;
