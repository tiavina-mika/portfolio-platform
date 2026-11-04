import Box from '@mui/material/Box';

import type { Theme } from '@mui/material/styles';
import type { NotificationChannelStatus } from '@shared/types';

import {
  NOTIFICATION_DELIVERY_CELL_GLYPH_SIZE, NOTIFICATION_DELIVERY_CELL_SIZE,
} from '@/constants/_core/ui/inbox.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import {
  getDeliveryOutcomeIcon, getNotificationChannelStatusColor, isNotificationChannelStatusBlocked,
} from '@/utils/_core/notification.utils';
import { getStatusTintStyles } from '@/utils/_core/theme/styles.utils';

const classes = {
  slot: (status: NotificationChannelStatus) => (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: NOTIFICATION_DELIVERY_CELL_SIZE,
    height: NOTIFICATION_DELIVERY_CELL_SIZE,
    borderRadius: `${RADIUS}px`,
    borderWidth: 1,
    /*
     * a dashed edge for the outcomes there was nothing to send on: drawn solid, "no device" would
     * sit in the same visual family as a delivery that was attempted and refused
     */
    borderStyle: isNotificationChannelStatusBlocked(status)
      ? 'dashed'
      : 'solid',
    ...getStatusTintStyles(theme, getNotificationChannelStatusColor(status)),
  }),
};

type Props = {
  status: NotificationChannelStatus;
};

/**
 * How one channel ended for one recipient, as a tinted square carrying the outcome's mark. It is
 * the cell of the per-recipient grid and the key printed under it, so the two cannot drift apart.
 */
const NotificationOutcomeSlot = ({ status }: Props) => {
  const OutcomeIcon = getDeliveryOutcomeIcon(status);

  return (
    <Box component="span" css={classes.slot(status)}>
      <OutcomeIcon size={NOTIFICATION_DELIVERY_CELL_GLYPH_SIZE} />
    </Box>
  );
};

export default NotificationOutcomeSlot;
