import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';

import { NOTIFICATION_CHANNEL_STATUS_LEGEND_ORDER } from '@/constants/_core/notification.constants';
import {
  NOTIFICATION_DELIVERY_LEGEND_GAP, NOTIFICATION_DELIVERY_LEGEND_ITEM_GAP,
  NOTIFICATION_DELIVERY_LEGEND_PADDING_X, NOTIFICATION_DELIVERY_LEGEND_PADDING_Y,
} from '@/constants/_core/ui/inbox.constants';
import NotificationOutcomeSlot from '@/containers/_core/notification/NotificationOutcomeSlot';
import { getNotificationChannelStatusLabel } from '@/utils/_core/notification.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // set on the secondary surface so it reads as a footnote to the grid rather than as another row
  root: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${NOTIFICATION_DELIVERY_LEGEND_GAP}px`,
    padding: `${NOTIFICATION_DELIVERY_LEGEND_PADDING_Y}px ${NOTIFICATION_DELIVERY_LEGEND_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${NOTIFICATION_DELIVERY_LEGEND_ITEM_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
};

/**
 * The key under the per-recipient grid. The grid states every outcome as a mark and never as a
 * word, so the words have to stand somewhere: a tooltip alone would make an operator hover every
 * square to tell "no device" from "turned off by the user".
 */
const NotificationDeliveryLegend = () => (
  <Box css={classes.root}>
    {NOTIFICATION_CHANNEL_STATUS_LEGEND_ORDER.map((status) => (
      <Box component="span" css={classes.item} key={status}>
        <NotificationOutcomeSlot status={status} />
        <Typography component="span" variant="body2">
          {getNotificationChannelStatusLabel(status)}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default NotificationDeliveryLegend;
