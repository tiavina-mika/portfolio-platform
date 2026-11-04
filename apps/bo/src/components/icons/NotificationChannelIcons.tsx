import type { ReactNode } from 'react';

import {
  NOTIFICATION_CHANNEL_BADGE_GLYPH_SIZE, NOTIFICATION_CHANNEL_GLYPH_SIZE,
} from '@/constants/_core/ui/inbox.constants';

/*
 * The three ways a notification can reach someone, and the four outcomes it can end on —
 * transcribed verbatim from the design reference rather than taken from `react-icons`, for the
 * same reason as the other glyph sets here: the pack ships at a 2px stroke where the design draws
 * 1.5, and at these sizes the difference reads as a different icon family sitting in the row.
 */
const STROKE_WIDTH = 1.5;
// the outcome marks are drawn on a filled disc barely wider than the glyph, so they are set bolder
const BADGE_STROKE_WIDTH = 3;

export type NotificationChannelIconProps = {
  size?: number;
};

type SvgProps = NotificationChannelIconProps & {
  children: ReactNode;
  viewBox?: string;
  strokeWidth?: number;
  strokeLinecap?: 'round';
};

const Svg = ({
  size = NOTIFICATION_CHANNEL_GLYPH_SIZE,
  children,
  viewBox = '0 0 24 24',
  strokeWidth = STROKE_WIDTH,
  strokeLinecap,
}: SvgProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap={strokeLinecap}
    strokeWidth={strokeWidth}
    viewBox={viewBox}
    width={size}
  >
    {children}
  </svg>
);

/** A device alert — the channel every notification goes out on. */
export const ChannelPushIcon = ({ size }: NotificationChannelIconProps) => (
  <Svg size={size}>
    <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z" />
    <path d="M10.5 21a1.5 1.5 0 003 0" />
  </Svg>
);

export const ChannelEmailIcon = ({ size }: NotificationChannelIconProps) => (
  <Svg size={size}>
    <rect
      height="16"
      rx="3"
      width="20"
      x="2"
      y="4"
    />
    <path d="M2 7l10 6 10-6" />
  </Svg>
);

export const ChannelSmsIcon = ({ size }: NotificationChannelIconProps) => (
  <Svg size={size}>
    <path
      d={'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7' +
        'a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'}
    />
  </Svg>
);

/*
 * The outcome marks. They are read at a glance and never on their own — each sits on the channel
 * it qualifies — so they are shapes rather than words: a tick for delivered, a clock for still
 * queued, a cross for refused, and a bar for a channel there was nothing to send on.
 */
export const DeliverySentIcon = ({
  size = NOTIFICATION_CHANNEL_BADGE_GLYPH_SIZE,
}: NotificationChannelIconProps) => (
  <Svg size={size} strokeLinecap="round" strokeWidth={BADGE_STROKE_WIDTH}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const DeliveryPendingIcon = ({
  size = NOTIFICATION_CHANNEL_BADGE_GLYPH_SIZE,
}: NotificationChannelIconProps) => (
  <Svg size={size} strokeLinecap="round" strokeWidth={2.6}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3.5 2" />
  </Svg>
);

export const DeliveryFailedIcon = ({
  size = NOTIFICATION_CHANNEL_BADGE_GLYPH_SIZE,
}: NotificationChannelIconProps) => (
  <Svg
    size={size}
    strokeLinecap="round"
    strokeWidth={BADGE_STROKE_WIDTH}
    viewBox="0 0 16 16"
  >
    <path d="M4 4l8 8M12 4l-8 8" />
  </Svg>
);

/** Nothing was sent on this channel at all — no device, no number, or the recipient turned it off. */
export const DeliveryBlockedIcon = ({
  size = NOTIFICATION_CHANNEL_BADGE_GLYPH_SIZE,
}: NotificationChannelIconProps) => (
  <Svg
    size={size}
    strokeLinecap="round"
    strokeWidth={BADGE_STROKE_WIDTH}
    viewBox="0 0 16 16"
  >
    <path d="M4 8h8" />
  </Svg>
);
