import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import Avatar from '@/components/Avatar';
import StatusDot from '@/components/StatusDot';
import RowDetailFacts, { RowDetailFact } from '@/components/table/RowDetailFacts';
import { NOTIFICATION_DETAIL_RECIPIENTS_SHOWN } from '@/constants/_core/notification.constants';
import {
  NOTIFICATION_CARD_ROW_GAP, NOTIFICATION_RECIPIENT_AVATAR_SIZE,
} from '@/constants/_core/ui/inbox.constants';
import {
  TABLE_CELL_AVATAR_GAP, TABLE_CELL_LINE_GAP, TABLE_ROW_DETAIL_GAP,
} from '@/constants/_core/ui/list.constants';
import { FONT_FAMILY_MONO } from '@/constants/_core/ui/ui.constants';
import NotificationStatusChip from '@/containers/_core/notification/NotificationStatusChip';
import { INotification } from '@/types/_core/notification.type';
import { IUser } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getNotificationChannelCountsTotal, getNotificationChannelLabel, getNotificationChannelSummaries,
  getNotificationMessage, getNotificationPayloadFacts, getNotificationProviderAnswersLabel,
  getNotificationReadRate, getNotificationReadRatioLabel, getNotificationRecipientId,
  getNotificationRecipientReadLabel, getNotificationResendableChannels, getNotificationRetryableFailedCounts,
  getNotificationUnreadRecipientIds, isNotificationSeenByRecipient,
} from '@/utils/_core/notification.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_ROW_DETAIL_GAP}px`,
  },
  recipients: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
  },
  recipientRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${NOTIFICATION_CARD_ROW_GAP}px`,
    minWidth: 0,
  },
  recipientName: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${TABLE_CELL_AVATAR_GAP}px`,
    minWidth: 0,
  },
  code: {
    fontFamily: FONT_FAMILY_MONO,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${TABLE_ROW_DETAIL_GAP}px`,
  },
};

type Props = {
  notification: INotification;
  /** Sends the send again to the recipients a provider refused it for, on every rebuildable channel. */
  onResendFailed?: () => void;
  /** Pushes the send again to the recipients who have not opened it. */
  onResendUnread?: () => void;
};

/**
 * Everything a send states once its row is opened: what was written, who it went to and when each
 * of them opened it, where the delivery stands and what the providers answered, and how many times
 * it was already sent again.
 *
 * It is a band rather than a page per notification because the task is always a queue — a support
 * request about one ride means reading every send that ride produced — and a round trip into each
 * row is the whole task.
 */
const NotificationRowDetail = ({
  notification, onResendFailed, onResendUnread,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  const { total } = getNotificationReadRate(notification);
  const recipients = notification.to ?? [];
  const shownRecipients = recipients.slice(0, NOTIFICATION_DETAIL_RECIPIENTS_SHOWN);
  const hiddenRecipientsCount = total - shownRecipients.length;
  // only the refusals on a channel this send can be rebuilt on are offered for a retry
  const failedCount = getNotificationChannelCountsTotal(
    getNotificationRetryableFailedCounts(notification, getNotificationResendableChannels(notification))
  );
  const unreadCount = getNotificationUnreadRecipientIds(notification).length;
  const channelSummaries = getNotificationChannelSummaries(notification);
  const providerAnswers = getNotificationProviderAnswersLabel(notification);
  const payloadFacts = getNotificationPayloadFacts(notification);

  return (
    <Box css={classes.root}>
      <Typography variant="body1">
        {getNotificationMessage(notification) || t('user:notifications.noMessage')}
      </Typography>
      <RowDetailFacts>
        <RowDetailFact label={t('user:notifications.sentAt')}>
          <Typography variant="body2">{displayDate(notification.createdAt, true, true)}</Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:notifications.statusCode')}>
          <NotificationStatusChip notification={notification} />
        </RowDetailFact>
        <RowDetailFact label={t('user:notifications.readRate')}>
          <Typography variant="body2">{getNotificationReadRatioLabel(notification)}</Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:notifications.channelsLabel')}>
          <Typography variant="body2">
            {channelSummaries.length > 0
              ? channelSummaries
                .map((summary) => `${getNotificationChannelLabel(summary.channel)} ` +
                  `${summary.sent}/${summary.total}`)
                .join(' · ')
              : t('user:notifications.channelsUntracked')}
          </Typography>
        </RowDetailFact>
        {/* the first thing an incident is escalated with, so it is not left behind a hover */}
        {providerAnswers && (
          <RowDetailFact label={t('user:notifications.providerAnswersLabel')}>
            <Typography variant="body2">{providerAnswers}</Typography>
          </RowDetailFact>
        )}
        {/*
          * stated before the retry buttons below are pressed: a send already sent again twice is one
          * an operator looks into rather than retries a third time
          */}
        {!!notification.resendsCount && notification.lastResentAt && (
          <RowDetailFact label={t('user:notifications.resendsLabel')}>
            <Typography variant="body2">
              {t('user:notifications.resendsSummary', {
                count: notification.resendsCount,
                date: displayDate(notification.lastResentAt, true),
              })}
            </Typography>
          </RowDetailFact>
        )}
        {/*
          * what the send was about, as the reference a support ticket is written around — the
          * payload is domain-owned, so only the id every entry carries is stated
          */}
        {payloadFacts.map((fact) => (
          <RowDetailFact key={fact.key} label={t(`user:notifications.payloadKeys.${fact.key}`)}>
            <Typography css={classes.code} variant="body2">{fact.id}</Typography>
          </RowDetailFact>
        ))}
      </RowDetailFacts>
      <Box css={classes.recipients}>
        <Typography variant="caption">{t('user:notifications.recipients')}</Typography>
        {shownRecipients.map((user: IUser) => {
          const userId = getNotificationRecipientId(user);

          return (
            <Box css={classes.recipientRow} key={userId}>
              <Box css={classes.recipientName}>
                <Avatar isNameShown size={NOTIFICATION_RECIPIENT_AVATAR_SIZE} user={user} />
                <Typography noWrap variant="body2">{getUserFullName(user)}</Typography>
              </Box>
              <StatusDot
                color={isNotificationSeenByRecipient(notification, userId)
                  ? 'success'
                  : 'error'}
                label={(
                  <Typography component="span" variant="body2">
                    {getNotificationRecipientReadLabel(notification, userId)}
                  </Typography>
                )}
              />
            </Box>
          );
        })}
        {hiddenRecipientsCount > 0 && (
          <Typography variant="caption">
            {t('user:notifications.moreRecipients', { count: hiddenRecipientsCount })}
          </Typography>
        )}
      </Box>
      <Box css={classes.actions}>
        {/*
          * offered only when there is something to send again: a button that would send the same
          * message to people it already reached is not a smaller version of this one
          */}
        {!!onResendFailed && failedCount > 0 && (
          <Button onClick={onResendFailed} variant="outlined">
            {t('user:notifications.resendFailuresWithCount', { count: failedCount })}
          </Button>
        )}
        {!!onResendUnread && unreadCount > 0 && (
          <Button onClick={onResendUnread} variant="outlined">
            {t('user:notifications.resendUnreadWithCount', { count: unreadCount })}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default NotificationRowDetail;
