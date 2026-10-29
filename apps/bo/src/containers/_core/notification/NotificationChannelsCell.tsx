import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { NotificationChannelEnum } from '@shared/types';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronRight } from 'react-icons/fi';

import type { NotificationChannel } from '@shared/types';

import { NOTIFICATION_CHANNEL_PILL_GAP } from '@/constants/_core/ui/inbox.constants';
import { ROW_ACTIONS_ICON_SIZE, TABLE_CELL_INLINE_GAP } from '@/constants/_core/ui/list.constants';
import NotificationChannelPill from '@/containers/_core/notification/NotificationChannelPill';
import NotificationRetryPopover from '@/containers/_core/notification/NotificationRetryPopover';
import { INotification } from '@/types/_core/notification.type';
import {
  getNotificationChannelLabel, getNotificationChannelStatusLabel, getNotificationChannelSummaries,
  getNotificationOutcomeExplanation, getNotificationRecipientId, isNotificationChannelRetryable,
  NotificationChannelSummary,
} from '@/utils/_core/notification.utils';
import { getBareButtonStyles } from '@/utils/_core/theme/styles.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${NOTIFICATION_CHANNEL_PILL_GAP}px`,
  },
  tooltip: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_INLINE_GAP}px`,
  },
  retryButton: getBareButtonStyles,
};

type Props = {
  notification: INotification;
  /**
   * Opens the per-recipient grid. Left out on a send with a single recipient: the slots already
   * state that person's whole outcome, and a grid of one row would say nothing more.
   */
  onOpenDelivery?: () => void;
  /** The channels this send can go out on again; left out, the push is the one channel offered. */
  resendableChannels?: NotificationChannel[];
  /**
   * Sends one channel again to the single recipient of the send. Absent when the account may not
   * act on it — and never used on a fan-out, whose retries are made person by person in the grid.
   */
  onRetry?: (userId: string, channel: NotificationChannel) => void;
};

/**
 * What a send went out on, and how each channel ended. This is the column an operator scans when
 * someone says they never got the message — it answers "was it even sent, and did the provider
 * take it" before anyone opens a row.
 *
 * A send to one person states the outcome itself on each slot, with the provider's own answer when it
 * refused, and a refused slot is where that one person is sent the channel again. A fan-out cannot:
 * it has one outcome per recipient, so the slot carries the count the provider refused and the grid
 * behind the chevron is where the per-person answer — and the per-person retry — lives.
 */
const NotificationChannelsCell = ({
  notification, onOpenDelivery, resendableChannels = [NotificationChannelEnum.PUSH], onRetry,
}: Props) => {
  const { t } = useTranslation(['user']);
  const [retryTarget, setRetryTarget] = useState<{
    anchorEl: HTMLElement;
    channel: NotificationChannel;
  } | null>(null);

  const summaries = getNotificationChannelSummaries(notification);

  // a row written before delivery was tracked at all — said rather than left as an empty cell
  if (summaries.length === 0) {
    return <Typography variant="body2">{t('user:notifications.channelsUntracked')}</Typography>;
  }

  const soloRecipient = notification.to?.[0];
  const soloRecipientId = soloRecipient && getNotificationRecipientId(soloRecipient);
  const soloRecipientName = soloRecipient
    ? getUserFullName(soloRecipient)
    : '';

  // the one entry a single-recipient send has on a channel, with the provider's answer on it
  const getSoloEntry = (channel: NotificationChannel) => notification.channels?.[channel]?.[0];

  const isSoloRetryable = (summary: NotificationChannelSummary): boolean => (
    !!onRetry && !!soloRecipientId && !!summary.soloStatus &&
    isNotificationChannelRetryable(summary.channel, summary.soloStatus, resendableChannels)
  );

  const handleOpenRetry = (channel: NotificationChannel) => (event: MouseEvent<HTMLElement>) => {
    setRetryTarget({ anchorEl: event.currentTarget, channel });
  };
  const handleCloseRetry = () => setRetryTarget(null);

  const handleConfirmRetry = () => {
    if (!retryTarget || !soloRecipientId) return;

    onRetry?.(soloRecipientId, retryTarget.channel);
    handleCloseRetry();
  };

  const getTooltip = (summary: NotificationChannelSummary) => {
    const channelLabel = getNotificationChannelLabel(summary.channel);
    const soloEntry = getSoloEntry(summary.channel);

    if (summary.soloStatus && soloEntry) {
      return (
        <Box css={classes.tooltip}>
          <Typography variant="subtitle2">
            {`${channelLabel} · ${getNotificationChannelStatusLabel(summary.soloStatus)}`}
          </Typography>
          <Typography variant="body2">
            {getNotificationOutcomeExplanation(soloEntry)}
            {isSoloRetryable(summary) && ` ${t('user:notifications.clickToResend')}`}
          </Typography>
        </Box>
      );
    }

    return (
      <Box css={classes.tooltip}>
        <Typography variant="subtitle2">
          {`${channelLabel} ${summary.sent}/${summary.total}`}
        </Typography>
        <Typography variant="body2">
          {t('user:notifications.channelBreakdown', {
            failed: summary.failed,
            pending: summary.pending,
            notSent: summary.total - summary.sent - summary.failed - summary.pending,
          })}
        </Typography>
        {summary.providerAnswers.length > 0 && (
          <Typography variant="body2">
            {t('user:notifications.providerAnswer', { answer: summary.providerAnswers.join(' · ') })}
          </Typography>
        )}
      </Box>
    );
  };

  const retryEntry = retryTarget && getSoloEntry(retryTarget.channel);

  return (
    <Box css={classes.root}>
      {summaries.map((summary) => {
        const pill = (
          <NotificationChannelPill
            channel={summary.channel}
            failedCount={summary.soloStatus ? 0 : summary.failed}
            status={summary.soloStatus}
            tone={summary.color}
          />
        );

        return (
          <Tooltip key={summary.channel} title={getTooltip(summary)}>
            {isSoloRetryable(summary)
              ? (
                <Box
                  aria-label={t('user:notifications.resendTo', { name: soloRecipientName })}
                  component="button"
                  css={classes.retryButton}
                  onClick={handleOpenRetry(summary.channel)}
                  type="button"
                >
                  {pill}
                </Box>
              )
              // the slot is not focusable on its own, so the span is what the tooltip anchors to
              : <Box component="span" tabIndex={0}>{pill}</Box>}
          </Tooltip>
        );
      })}
      {onOpenDelivery && (
        <Tooltip title={t('user:notifications.deliveryPerRecipient')}>
          <IconButton
            aria-label={t('user:notifications.deliveryPerRecipient')}
            onClick={onOpenDelivery}
          >
            <FiChevronRight size={ROW_ACTIONS_ICON_SIZE} />
          </IconButton>
        </Tooltip>
      )}
      <NotificationRetryPopover
        anchorEl={retryTarget?.anchorEl ?? null}
        channel={retryTarget?.channel}
        confirmLabel={t('user:notifications.resendTo', { name: soloRecipientName })}
        onClose={handleCloseRetry}
        onConfirm={handleConfirmRetry}
        explanation={retryEntry
          ? getNotificationOutcomeExplanation(retryEntry)
          : ''}
        title={retryTarget
          ? `${soloRecipientName} · ${getNotificationChannelLabel(retryTarget.channel)}`
          : ''}
      />
    </Box>
  );
};

export default NotificationChannelsCell;
