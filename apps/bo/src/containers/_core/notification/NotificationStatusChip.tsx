import Chip from '@mui/material/Chip';

import { INotification } from '@/types/_core/notification.type';
import {
  getNotificationStatusColorByValue, getNotificationStatusLabelByValue,
} from '@/utils/_core/notification.utils';

type Props = {
  notification: Pick<INotification, 'type' | 'status'>;
};

/**
 * What the notification announced, as one chip: a ride cancelled, a booking accepted, an account
 * suspended. It leads the row because it is the only column an operator can sort a whole screen
 * of sends by — the message underneath says the same thing in a sentence, which is what they read
 * once they have found the row they were after.
 */
const NotificationStatusChip = ({ notification }: Props) => {
  const color = getNotificationStatusColorByValue(notification.type, notification.status);

  return (
    <Chip
      label={getNotificationStatusLabelByValue(notification.type, notification.status)}
      size="small"
      variant="outlined"
      color={color === 'default'
        ? undefined
        : color}
    />
  );
};

export default NotificationStatusChip;
