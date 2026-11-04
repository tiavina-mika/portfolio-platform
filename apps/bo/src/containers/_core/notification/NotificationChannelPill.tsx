import Box from '@mui/material/Box';
import { NotificationChannelEnum } from '@shared/types';

import type { NotificationChannelIconProps } from '@/components/icons/NotificationChannelIcons';
import type { Theme } from '@mui/material/styles';
import type { NotificationChannel, NotificationChannelStatus } from '@shared/types';
import type { ComponentType } from 'react';

import {
  ChannelEmailIcon, ChannelPushIcon, ChannelSmsIcon,
} from '@/components/icons/NotificationChannelIcons';
import {
  NOTIFICATION_CHANNEL_BADGE_OFFSET, NOTIFICATION_CHANNEL_BADGE_SIZE,
  NOTIFICATION_CHANNEL_FAIL_BADGE_OFFSET, NOTIFICATION_CHANNEL_FAIL_BADGE_PADDING_X,
  NOTIFICATION_CHANNEL_FAIL_BADGE_RADIUS, NOTIFICATION_CHANNEL_FAIL_BADGE_SIZE,
  NOTIFICATION_CHANNEL_PILL_SIZE,
} from '@/constants/_core/ui/inbox.constants';
import { RADIUS, FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';
import { getDeliveryOutcomeIcon, isNotificationChannelStatusBlocked } from '@/utils/_core/notification.utils';
import { getStatusSolidColor, getStatusTintStyles, StatusTone } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  root: {
    position: 'relative' as const,
    display: 'inline-flex',
    flexShrink: 0,
  },
  pill: (tone: StatusTone, isDashed: boolean) => (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: NOTIFICATION_CHANNEL_PILL_SIZE,
    height: NOTIFICATION_CHANNEL_PILL_SIZE,
    borderRadius: `${RADIUS}px`,
    borderWidth: 1,
    /*
     * a dashed edge for the channels there was nothing to send on — no device, no number, a
     * preference turned off. The outcome badge alone would put them in the same visual family as a
     * delivery that was attempted and refused, which is the one distinction this column exists for.
     */
    borderStyle: isDashed
      ? 'dashed'
      : 'solid',
    ...getStatusTintStyles(theme, tone),
  }),
  /*
   * the outcome, overlapping the bottom-right corner of the slot it qualifies. A ring in the
   * surface colour keeps it legible where it sits over the slot's own edge.
   */
  badge: (tone: StatusTone) => (theme: Theme) => ({
    position: 'absolute' as const,
    right: NOTIFICATION_CHANNEL_BADGE_OFFSET,
    bottom: NOTIFICATION_CHANNEL_BADGE_OFFSET,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: NOTIFICATION_CHANNEL_BADGE_SIZE,
    height: NOTIFICATION_CHANNEL_BADGE_SIZE,
    borderRadius: '50%',
    color: theme.palette.common.white,
    backgroundColor: getStatusSolidColor(theme, tone),
    boxShadow: `0 0 0 2px ${getDesignTokens(theme).surface}`,
  }),
  /*
   * how many recipients the channel was refused for, pinned to the opposite corner: a count and an
   * outcome are different statements, and a fan-out states the count instead — "three of forty
   * failed" is what an operator acts on, where a single tick would say nothing about the rest.
   */
  failBadge: (theme: Theme) => ({
    position: 'absolute' as const,
    right: NOTIFICATION_CHANNEL_FAIL_BADGE_OFFSET,
    top: NOTIFICATION_CHANNEL_FAIL_BADGE_OFFSET,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: NOTIFICATION_CHANNEL_FAIL_BADGE_SIZE,
    height: NOTIFICATION_CHANNEL_FAIL_BADGE_SIZE,
    padding: `0 ${NOTIFICATION_CHANNEL_FAIL_BADGE_PADDING_X}px`,
    borderRadius: `${NOTIFICATION_CHANNEL_FAIL_BADGE_RADIUS}px`,
    fontSize: FONT_SIZE_OVERLINE,
    fontWeight: 700,
    lineHeight: 1,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
    boxShadow: `0 0 0 2px ${getDesignTokens(theme).surface}`,
  }),
};

/*
 * which glyph stands for which channel. A map rather than a switch: the channel set is fixed, and
 * every slot that draws one draws it the same way.
 */
const CHANNEL_ICONS: Record<NotificationChannel, ComponentType<NotificationChannelIconProps>> = {
  [NotificationChannelEnum.PUSH]: ChannelPushIcon,
  [NotificationChannelEnum.EMAIL]: ChannelEmailIcon,
  [NotificationChannelEnum.SMS]: ChannelSmsIcon,
};

type Props = {
  channel: NotificationChannel;
  tone: StatusTone;
  /**
   * The single outcome the slot states in its corner. Passed only when the send has one recipient:
   * a fan-out has as many outcomes as it has people, and one mark standing for all of them would
   * be a claim the data does not support.
   */
  status?: NotificationChannelStatus;
  /** How many recipients the provider refused — stated instead of an outcome, on a fan-out. */
  failedCount?: number;
};

/**
 * One channel of one send: which way it went out, and how it ended. A tinted slot carrying the
 * channel's own glyph rather than a labelled chip — three chips side by side would be the widest
 * column in the table for a fact that is read at a glance, and the glyph names the channel without
 * a word being spent on it down every row.
 */
const NotificationChannelPill = ({
  channel, tone, status, failedCount = 0,
}: Props) => {
  const ChannelIcon = CHANNEL_ICONS[channel];
  const OutcomeIcon = status
    ? getDeliveryOutcomeIcon(status)
    : undefined;

  return (
    <Box component="span" css={classes.root}>
      <Box component="span" css={classes.pill(tone, !!status && isNotificationChannelStatusBlocked(status))}>
        <ChannelIcon />
      </Box>
      {OutcomeIcon && (
        <Box component="span" css={classes.badge(tone)}>
          <OutcomeIcon />
        </Box>
      )}
      {failedCount > 0 && (
        <Box component="span" css={classes.failBadge}>{failedCount}</Box>
      )}
    </Box>
  );
};

export default NotificationChannelPill;
