import {
  Box, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { NotificationChannelEnum } from '@shared/types';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { NotificationChannel } from '@shared/types';

import Avatar from '@/components/Avatar';
import BooleanIcons from '@/components/BooleanIcons';
import {
  NOTIFICATION_DELIVERY_COLUMN_WIDTH, NOTIFICATION_RECIPIENT_AVATAR_SIZE,
} from '@/constants/_core/ui/inbox.constants';
import { TABLE_CELL_AVATAR_GAP } from '@/constants/_core/ui/list.constants';
import NotificationDeliveryLegend from '@/containers/_core/notification/NotificationDeliveryLegend';
import NotificationOutcomeSlot from '@/containers/_core/notification/NotificationOutcomeSlot';
import NotificationRetryPopover from '@/containers/_core/notification/NotificationRetryPopover';
import { INotification } from '@/types/_core/notification.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getNotificationChannelLabel, getNotificationChannelStatusLabel, getNotificationDeliveryMatrix,
  getNotificationOutcomeExplanation, getNotificationRecipientSeenAt, isNotificationChannelRetryable,
  isNotificationSeenByRecipient, NotificationDeliveryMatrixCell, NotificationDeliveryRow,
} from '@/utils/_core/notification.utils';
import { getBareButtonStyles } from '@/utils/_core/theme/styles.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  scroller: {
    overflowX: 'auto' as const,
  },
  /*
   * every channel column is the same fixed width so one channel can be read straight down the
   * grid; sized by its contents each column would drift row by row away from its heading
   */
  channelColumn: {
    width: NOTIFICATION_DELIVERY_COLUMN_WIDTH,
  },
  recipient: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${TABLE_CELL_AVATAR_GAP}px`,
    minWidth: 0,
  },
  slot: {
    display: 'inline-flex',
  },
  seenAt: {
    whiteSpace: 'nowrap' as const,
  },
  // only the refusals can be acted on, so only they are a control
  retryButton: getBareButtonStyles,
};

type RetryTarget = {
  anchorEl: HTMLElement;
  userId: string;
  userName: string;
  cell: NotificationDeliveryMatrixCell;
};

type Props = {
  notification: INotification;
  /** The channels this send can go out on again; left out, the push is the one channel offered. */
  resendableChannels?: NotificationChannel[];
  /** Sends the channel again to one recipient. Absent when the account may not act on the send. */
  onRetry?: (userId: string, channel: NotificationChannel) => void;
};

/**
 * The send laid out as recipients down and channels across, with whether and when each person
 * opened it.
 *
 * It exists because a list row can only ever state a channel's worst outcome: a fan-out to forty
 * passengers where three pushes were refused shows one red slot, and the question that follows is
 * always "which three". This is where that is answered, with what the provider said about each of
 * them, and where a refusal can be sent again one person at a time rather than re-alerting the
 * thirty-seven the first send did reach.
 */
const NotificationRecipientsTable = ({
  notification, resendableChannels = [NotificationChannelEnum.PUSH], onRetry,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [retryTarget, setRetryTarget] = useState<RetryTarget | null>(null);

  const { channels, rows } = getNotificationDeliveryMatrix(notification);

  if (rows.length === 0) {
    return <Typography variant="body2">{t('user:notifications.noRecipient')}</Typography>;
  }

  const handleCloseRetry = () => setRetryTarget(null);

  const handleOpenRetry = (
    row: NotificationDeliveryRow,
    cell: NotificationDeliveryMatrixCell
  ) => (event: MouseEvent<HTMLElement>) => {
    setRetryTarget({
      anchorEl: event.currentTarget,
      userId: row.userId,
      userName: getUserFullName(row.user),
      cell,
    });
  };

  const handleConfirmRetry = () => {
    if (!retryTarget) return;

    onRetry?.(retryTarget.userId, retryTarget.cell.channel);
    handleCloseRetry();
  };

  return (
    <Box>
      <Box css={classes.scroller}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('user:notifications.recipient')}</TableCell>
              {channels.map((channel) => (
                <TableCell align="center" css={classes.channelColumn} key={channel}>
                  {getNotificationChannelLabel(channel)}
                </TableCell>
              ))}
              <TableCell align="center" css={classes.channelColumn}>{t('common:seen')}</TableCell>
              <TableCell>{t('user:notifications.seenAtColumn')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const seenAt = getNotificationRecipientSeenAt(notification, row.userId);

              return (
                <TableRow key={row.userId}>
                  <TableCell>
                    <Box component="span" css={classes.recipient}>
                      <Avatar isNameShown size={NOTIFICATION_RECIPIENT_AVATAR_SIZE} user={row.user} />
                      <Typography noWrap variant="body2">{getUserFullName(row.user)}</Typography>
                    </Box>
                  </TableCell>
                  {row.cells.map((cell) => {
                    const title = `${getNotificationChannelLabel(cell.channel)} · ` +
                      `${getNotificationChannelStatusLabel(cell.status)} — ` +
                      getNotificationOutcomeExplanation(cell);
                    const isRetryable = !!onRetry &&
                      isNotificationChannelRetryable(cell.channel, cell.status, resendableChannels);

                    return (
                      <TableCell align="center" key={cell.channel}>
                        <Tooltip title={title}>
                          {isRetryable
                            ? (
                              <Box
                                aria-label={title}
                                component="button"
                                css={classes.retryButton}
                                onClick={handleOpenRetry(row, cell)}
                                type="button"
                              >
                                <NotificationOutcomeSlot status={cell.status} />
                              </Box>
                            )
                            : (
                              <Box component="span" css={classes.slot}>
                                <NotificationOutcomeSlot status={cell.status} />
                              </Box>
                            )}
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <BooleanIcons value={isNotificationSeenByRecipient(notification, row.userId)} />
                  </TableCell>
                  {/*
                    * "—" both for a recipient who has not opened it and for one who opened it before
                    * openings were dated: the "Vu" column beside it is what tells the two apart
                    */}
                  <TableCell css={classes.seenAt}>
                    {seenAt
                      ? displayDate(seenAt, true)
                      : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <NotificationDeliveryLegend />
      <NotificationRetryPopover
        anchorEl={retryTarget?.anchorEl ?? null}
        channel={retryTarget?.cell.channel}
        onClose={handleCloseRetry}
        onConfirm={handleConfirmRetry}
        confirmLabel={retryTarget
          ? t('user:notifications.resendTo', { name: retryTarget.userName })
          : ''}
        explanation={retryTarget
          ? getNotificationOutcomeExplanation(retryTarget.cell)
          : ''}
        title={retryTarget
          ? `${retryTarget.userName} · ${getNotificationChannelLabel(retryTarget.cell.channel)}`
          : ''}
      />
    </Box>
  );
};

export default NotificationRecipientsTable;
