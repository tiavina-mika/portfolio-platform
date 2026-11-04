import { NotificationChannelStatusEnum, type NotificationChannel } from '@shared/types';
import { useTranslation } from 'react-i18next';

import StatusDot, { StatusDotColor } from '@/components/StatusDot';
import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import { INotification } from '@/types/_core/notification.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getNotificationChannelLabel, isNotificationSeenByRecipient,
} from '@/utils/_core/notification.utils';
import { cutText } from '@/utils/_core/utils';

// how much of the message a row shows as its title
const NOTIFICATION_TITLE_MAX_LENGTH = 80;

type RecipientState = 'read' | 'sent' | 'failed' | 'pending';

const RECIPIENT_STATE_COLORS: Record<RecipientState, StatusDotColor> = {
  read: 'success',
  sent: 'info',
  failed: 'error',
  pending: 'default',
};

type Props = {
  notifications: INotification[];
  userId: string;
  onOpen: (notification: INotification) => void;
};

/**
 * What the platform sent the member lately, and whether it reached them. A send can go to several
 * people and fail for one of them only, so what is shown is this member's own outcome: opened, sent
 * on at least one channel, failed everywhere, or not tried yet.
 */
const UserNotificationsTable = ({ notifications, userId, onOpen }: Props) => {
  const { t, i18n } = useTranslation(['user']);

  const getChannels = (notification: INotification): NotificationChannel[] => (
    Object.keys(notification.channels ?? {}) as NotificationChannel[]
  );

  const getRecipientState = (notification: INotification): RecipientState => {
    if (isNotificationSeenByRecipient(notification, userId)) return 'read';

    const outcomes = getChannels(notification)
      .flatMap((channel) => notification.channels?.[channel] ?? [])
      .filter((recipient) => recipient.toId === userId)
      .map((recipient) => recipient.status);

    if (outcomes.includes(NotificationChannelStatusEnum.SENT)) return 'sent';
    if (outcomes.includes(NotificationChannelStatusEnum.PENDING) || outcomes.length === 0) return 'pending';

    return 'failed';
  };

  const getTitle = (notification: INotification): string => {
    const messages = notification.message ?? {};
    const message = messages[i18n.language] ?? Object.values(messages)[0] ?? '';

    return cutText(message, NOTIFICATION_TITLE_MAX_LENGTH);
  };

  const columns: CompactTableColumn<INotification>[] = [
    { id: 'title', label: t('user:detail.notifications.title'), render: getTitle },
    {
      id: 'channels',
      label: t('user:detail.notifications.channels'),
      render: (notification) => (
        getChannels(notification).map(getNotificationChannelLabel).join(', ') || '—'
      ),
    },
    {
      id: 'date',
      label: t('user:detail.notifications.date'),
      nowrap: true,
      render: (notification) => displayDate(notification.createdAt),
    },
    {
      id: 'status',
      label: t('user:detail.notifications.status'),
      render: (notification) => {
        const state = getRecipientState(notification);

        return (
          <StatusDot color={RECIPIENT_STATE_COLORS[state]} label={t(`user:detail.notifications.${state}`)} />
        );
      },
    },
  ];

  return (
    <CompactTable
      columns={columns}
      emptyTitle={t('user:detail.notifications.empty')}
      onRowClick={onOpen}
      rows={notifications}
    />
  );
};

export default UserNotificationsTable;
