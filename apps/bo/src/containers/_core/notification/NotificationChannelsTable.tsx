import {
  Box, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { NotificationChannelEnum, NotificationChannelStatusEnum } from '@shared/types';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { NotificationChannel } from '@shared/types';

import StatusDot from '@/components/StatusDot';
import { NOTIFICATION_CHANNEL_LABEL_GAP } from '@/constants/_core/ui/inbox.constants';
import NotificationChannelPill from '@/containers/_core/notification/NotificationChannelPill';
import NotificationRetryPopover from '@/containers/_core/notification/NotificationRetryPopover';
import { INotification } from '@/types/_core/notification.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getNotificationChannelLabel, getNotificationChannelOpenOutcomesLabel, getNotificationChannelStatusColor,
  getNotificationChannelStatusDescription, getNotificationChannelStatusLabel,
  getNotificationChannelSummaries, isNotificationChannelRetryable, NotificationChannelSummary,
} from '@/utils/_core/notification.utils';
import { getBareButtonStyles } from '@/utils/_core/theme/styles.utils';

const classes = {
  scroller: {
    overflowX: 'auto' as const,
  },
  channel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${NOTIFICATION_CHANNEL_LABEL_GAP}px`,
  },
  retryButton: getBareButtonStyles,
};

type RetryTarget = {
  anchorEl: HTMLElement;
  summary: NotificationChannelSummary;
};

type Props = {
  notification: INotification;
  /** The channels this send can go out on again; left out, the push is the one channel offered. */
  resendableChannels?: NotificationChannel[];
  /** Sends one channel again to the recipients its provider refused. Absent without the right. */
  onRetryFailures?: (channel: NotificationChannel) => void;
};

/**
 * The send read channel by channel: how it ended overall, how many it reached, how many of those
 * opened it, what is left to look at and when it was last tried.
 *
 * It is the view a provider incident is diagnosed from — "every SMS of the morning failed" is a
 * statement about a channel, not about a person, and reading it off the per-recipient grid means
 * counting squares down a column. What the provider answered is stated here too, since it is the
 * first thing an incident is escalated with.
 */
const NotificationChannelsTable = ({
  notification, resendableChannels = [NotificationChannelEnum.PUSH], onRetryFailures,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [retryTarget, setRetryTarget] = useState<RetryTarget | null>(null);

  const summaries = getNotificationChannelSummaries(notification);

  // a send created before delivery was tracked has no channel to state anything about
  if (summaries.length === 0) {
    return <Typography variant="body2">{t('user:notifications.channelsUntracked')}</Typography>;
  }

  const handleOpenRetry = (summary: NotificationChannelSummary) => (event: MouseEvent<HTMLElement>) => {
    setRetryTarget({ anchorEl: event.currentTarget, summary });
  };
  const handleCloseRetry = () => setRetryTarget(null);

  const handleConfirmRetry = () => {
    if (!retryTarget) return;

    onRetryFailures?.(retryTarget.summary.channel);
    handleCloseRetry();
  };

  /*
   * what the provider said about a channel's refusals, as one line — or the general explanation of a
   * refusal when it said nothing, or when the refusals predate the answers being kept
   */
  const getRefusalExplanation = (summary: NotificationChannelSummary): string => (
    summary.providerAnswers.length > 0
      ? t('user:notifications.providerAnswer', { answer: summary.providerAnswers.join(' · ') })
      : getNotificationChannelStatusDescription(NotificationChannelStatusEnum.FAILED)
  );

  return (
    <Box css={classes.scroller}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('user:notifications.channel')}</TableCell>
            <TableCell>{t('user:notifications.status')}</TableCell>
            <TableCell align="right">{t('user:notifications.sentColumn')}</TableCell>
            <TableCell align="right">{t('user:notifications.seenColumn')}</TableCell>
            <TableCell>{t('user:notifications.toHandle')}</TableCell>
            <TableCell>{t('user:notifications.lastAttempt')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summaries.map((summary) => {
            const channelLabel = getNotificationChannelLabel(summary.channel);
            const retryLabel = t('user:notifications.retryChannel', { channel: channelLabel });
            const isRetryable = !!onRetryFailures && summary.failed > 0 &&
              isNotificationChannelRetryable(
                summary.channel, NotificationChannelStatusEnum.FAILED, resendableChannels
              );
            const pill = (
              <NotificationChannelPill
                channel={summary.channel}
                failedCount={summary.failed}
                tone={summary.color}
              />
            );

            return (
              <TableRow key={summary.channel}>
                <TableCell>
                  <Box component="span" css={classes.channel}>
                    {isRetryable
                      ? (
                        <Tooltip title={retryLabel}>
                          <Box
                            aria-label={retryLabel}
                            component="button"
                            css={classes.retryButton}
                            onClick={handleOpenRetry(summary)}
                            type="button"
                          >
                            {pill}
                          </Box>
                        </Tooltip>
                      )
                      : pill}
                    <Typography component="span" variant="body2">{channelLabel}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {/* the provider's answer stays readable on a channel that cannot be retried from here */}
                  <Tooltip
                    title={summary.providerAnswers.length > 0
                      ? getRefusalExplanation(summary)
                      : ''}
                  >
                    <Box component="span">
                      <StatusDot
                        color={getNotificationChannelStatusColor(summary.status)}
                        label={getNotificationChannelStatusLabel(summary.status)}
                      />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">{summary.sent}</TableCell>
                <TableCell align="right">{summary.seen}</TableCell>
                <TableCell>{getNotificationChannelOpenOutcomesLabel(summary) || '—'}</TableCell>
                <TableCell>
                  {summary.lastAttemptedAt
                    ? displayDate(summary.lastAttemptedAt, true)
                    : '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <NotificationRetryPopover
        anchorEl={retryTarget?.anchorEl ?? null}
        channel={retryTarget?.summary.channel}
        onClose={handleCloseRetry}
        onConfirm={handleConfirmRetry}
        confirmLabel={retryTarget
          ? t('user:notifications.retryChannel', {
            channel: getNotificationChannelLabel(retryTarget.summary.channel),
          })
          : ''}
        explanation={retryTarget
          ? getRefusalExplanation(retryTarget.summary)
          : ''}
        title={retryTarget
          ? `${getNotificationChannelLabel(retryTarget.summary.channel)} · ` +
            getNotificationChannelStatusLabel(NotificationChannelStatusEnum.FAILED)
          : ''}
      />
    </Box>
  );
};

export default NotificationChannelsTable;
