import {
  Box, Button, Chip, Typography,
} from '@mui/material';
import { NotificationChannelEnum, NotificationResendReasonEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiClock, FiFileText, FiLink, FiRefreshCw, FiSend, FiUsers,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import type { NotificationChannel } from '@shared/types';

import Dialog from '@/components/Dialog';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PreviewSections from '@/components/layouts/PreviewSections';
import {
  NOTIFICATION_HISTORY_AUTHOR_FIELDS, NOTIFICATION_HISTORY_COLORS, NOTIFICATION_HISTORY_EVENTS,
} from '@/constants/_core/notification.constants';
import { NOTIFICATION_SECTION_ACTIONS_GAP } from '@/constants/_core/ui/inbox.constants';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import History from '@/containers/_core/History';
import NotificationChannelsTable from '@/containers/_core/notification/NotificationChannelsTable';
import NotificationFailureChips from '@/containers/_core/notification/NotificationFailureChips';
import NotificationInfos from '@/containers/_core/notification/NotificationInfos';
import NotificationRecipientsTable from '@/containers/_core/notification/NotificationRecipientsTable';
import NotificationRowActions from '@/containers/_core/notification/NotificationRowActions';
import { useProtect } from '@/hooks/_core/useProtect';
import {
  bulkSoftDeleteNotifications, destroyNotifications, reloadNotification, resendNotification,
  resendNotificationFailedDeliveries, restoreNotifications,
} from '@/redux/actions/_core/notification.action';
import { goToList } from '@/redux/actions/_core/util.action';
import {
  getNotificationNotificationSelector, getNotificationResendableChannelsSelector,
  getNotificationResendsSelector,
} from '@/redux/reducers/_core/notification.reducer';
import { IPreviewSection } from '@/types/_core/app.type';
import { INotification, ResendNotificationOptions } from '@/types/_core/notification.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getNotificationChannelCountsLabel, getNotificationChannelCountsTotal, getNotificationFailedRecipientIds,
  getNotificationPreviewRenderer, getNotificationStatusLabelByValue,
  getNotificationBroadcastHistoryEvents,
  getNotificationReadRate, getNotificationResendHistoryEvents, getNotificationRetryableFailedCounts,
  getNotificationUnreadRecipientIds,
} from '@/utils/_core/notification.utils';
import { getNotificationTypeLabelByValue, getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  sectionActions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${NOTIFICATION_SECTION_ACTIONS_GAP}px`,
  },
};

const collection = 'Notification';

/**
 * One send, on a page of its own: what it said, who it went to and when each of them opened it, how
 * each channel ended and what its provider answered, what it was about, and what happened to it
 * since — resends included.
 *
 * The list row already opens onto most of this; the page exists for the cases a row cannot carry —
 * a fan-out whose recipients have to be read one by one, an address to paste into a support ticket,
 * and a channel incident read across every person it touched.
 */
const Notification = () => {
  const { t } = useTranslation(['common', 'user']);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notification = useSelector(getNotificationNotificationSelector);
  const resends = useSelector(getNotificationResendsSelector);
  const resendableChannels = useSelector(getNotificationResendableChannelsSelector);
  const { canDelete, canDestroy, canEdit } = useProtect(collection);
  const [isConfirmingFailuresResend, setIsConfirmingFailuresResend] = useState(false);

  if (!notification) return null;

  // a binned send is no longer something anybody should be alerted about
  const canResend = !!canEdit && !notification.deleted;
  const { seen, total } = getNotificationReadRate(notification);
  const unreadIds = getNotificationUnreadRecipientIds(notification);
  // only the refusals on a channel the send can be rebuilt on are offered, and counted, for a retry
  const retryableFailedCounts = getNotificationRetryableFailedCounts(notification, resendableChannels);
  const retryableFailedCount = getNotificationChannelCountsTotal(retryableFailedCounts);
  const RelatedEntity = getNotificationPreviewRenderer(notification);

  const handleGoToList = () => {
    navigate(goToList('notifications'));
  };

  /*
   * every resend rewrites the channel it touched and adds a line to the history, so the page is read
   * again once it went through — left as it was, it would go on stating the refusal just retried
   */
  const handleResendAndReload = async (options: ResendNotificationOptions) => {
    const error = await dispatch(resendNotification(notification.id, options));

    if (error) return;

    dispatch(reloadNotification(notification.id));
  };

  const handleResend = () => handleResendAndReload({
    channel: NotificationChannelEnum.PUSH,
    reason: NotificationResendReasonEnum.ALL,
  });

  const handleResendUnread = () => {
    if (unreadIds.length === 0) return;

    handleResendAndReload({
      channel: NotificationChannelEnum.PUSH,
      toIds: unreadIds,
      reason: NotificationResendReasonEnum.UNREAD,
    });
  };

  const handleResendToRecipient = (userId: string, channel: NotificationChannel) => handleResendAndReload({
    channel,
    toIds: [userId],
    reason: NotificationResendReasonEnum.RECIPIENT,
  });

  const handleResendChannelFailures = (channel: NotificationChannel) => handleResendAndReload({
    channel,
    toIds: getNotificationFailedRecipientIds(notification, channel),
    reason: NotificationResendReasonEnum.FAILED,
  });

  const handleResendAllFailures = async () => {
    setIsConfirmingFailuresResend(false);

    const error = await dispatch(resendNotificationFailedDeliveries([notification.id]));

    if (error) return;

    dispatch(reloadNotification(notification.id));
  };

  // every SMS sent again is billed, so a batch holding one is confirmed first; the others go straight out
  const handleRequestAllFailuresResend = () => {
    if (retryableFailedCounts[NotificationChannelEnum.SMS]) {
      setIsConfirmingFailuresResend(true);
      return;
    }

    handleResendAllFailures();
  };

  const handleCloseConfirmation = () => setIsConfirmingFailuresResend(false);

  const handleDelete = async () => {
    const error = await dispatch(bulkSoftDeleteNotifications([notification.id]));

    if (error) return;

    handleGoToList();
  };

  /*
   * Puts a binned send back, and reads the page again so it stops showing the bin's own state — who
   * binned it, and the actions that only a binned send offers.
   */
  const handleRestore = async () => {
    const error = await dispatch(restoreNotifications([notification.id]));

    if (error) return;

    dispatch(reloadNotification(notification.id));
  };

  // the send no longer exists afterwards, so there is no page left to stay on
  const handleDestroy = async () => {
    const error = await dispatch(destroyNotifications([notification.id]));

    if (error) return;

    handleGoToList();
  };

  const senderName = notification.from
    ? getUserFullName(notification.from)
    : t('user:notifications.system');

  const sections: IPreviewSection[] = [
    {
      id: 'details',
      label: t('common:details'),
      icon: <FiFileText />,
      content: <NotificationInfos notification={notification} />,
    },
    {
      id: 'recipients',
      label: t('user:notifications.recipients'),
      icon: <FiUsers />,
      count: total,
      content: (
        <NotificationRecipientsTable
          notification={notification}
          resendableChannels={resendableChannels}
          onRetry={canResend
            ? handleResendToRecipient
            : undefined}
        />
      ),
      rightActions: (
        <Box css={classes.sectionActions}>
          <Typography variant="body2">{t('user:notifications.seenOutOf', { seen, total })}</Typography>
          <NotificationFailureChips notification={notification} />
          {canResend && retryableFailedCount > 0 && (
            <Button
              onClick={handleRequestAllFailuresResend}
              size="small"
              startIcon={<FiRefreshCw size={MENU_ITEM_ICON_SIZE} />}
              variant="outlined"
            >
              {t('user:notifications.resendFailures')}
            </Button>
          )}
        </Box>
      ),
    },
    {
      id: 'delivery',
      label: t('user:notifications.delivery'),
      icon: <FiSend />,
      content: (
        <NotificationChannelsTable
          notification={notification}
          resendableChannels={resendableChannels}
          onRetryFailures={canResend
            ? handleResendChannelFailures
            : undefined}
        />
      ),
    },
    {
      id: 'related',
      label: t('user:notifications.relatedEntity'),
      icon: <FiLink />,
      // an account notification is about nobody's ride, and an old send may have lost its reference
      hide: !RelatedEntity,
      // the domain's panel draws its own card, with the shortcut to the entity's page on its header
      disableCard: true,
      content: RelatedEntity && <RelatedEntity notification={notification} />,
    },
    {
      id: 'history',
      label: t('common:history'),
      icon: <FiClock />,
      content: (
        <History<INotification>
          authorFields={NOTIFICATION_HISTORY_AUTHOR_FIELDS}
          colors={NOTIFICATION_HISTORY_COLORS}
          fields={NOTIFICATION_HISTORY_EVENTS}
          parseObj={notification}
          translationKey="user:notifications.events"
          extraEvents={[
            ...getNotificationBroadcastHistoryEvents(notification),
            ...getNotificationResendHistoryEvents(resends),
          ]}
        />
      ),
    },
  ];

  const statusLabel = getNotificationStatusLabelByValue(notification.type, notification.status);

  return (
    <Layout
      isCard={false}
      pretitle={t('user:notifications.notification')}
      actions={(
        <NotificationRowActions
          goToList={handleGoToList}
          notification={notification}
          type="preview"
          onDelete={canDelete && !notification.deleted
            ? handleDelete
            : undefined}
          // both only make sense on a send already in the bin, and each needs its own right
          onDestroy={canDestroy && notification.deleted
            ? handleDestroy
            : undefined}
          onResend={canResend
            ? handleResend
            : undefined}
          onResendUnread={canResend
            ? handleResendUnread
            : undefined}
          onRestore={canEdit && notification.deleted
            ? handleRestore
            : undefined}
        />
      )}
      description={(
        <>
          {`${displayDate(notification.createdAt, true)} · `}
          {t('user:notifications.senderToRecipients', {
            sender: senderName,
            recipients: t('user:notifications.recipientsWithCount', { count: total }),
          })}
        </>
      )}
      title={(
        <>
          {statusLabel}
          <Chip color="primary" label={getNotificationTypeLabelByValue(notification.type)} size="small" />
          <NotificationFailureChips notification={notification} />
        </>
      )}
    >
      <Head title={`${t('user:notifications.notification')} - ${statusLabel}`} />
      <PreviewSections sections={sections} />
      <Dialog
        onPrimaryButtonAction={handleResendAllFailures}
        open={isConfirmingFailuresResend}
        primaryButtonText={t('user:notifications.resendFailures')}
        title={t('user:notifications.confirmResendTitle')}
        toggle={handleCloseConfirmation}
        description={`${t('user:notifications.confirmResendDescription', {
          channels: getNotificationChannelCountsLabel(retryableFailedCounts),
        })} ${t('user:notifications.smsCostNotice')}`}
      />
    </Layout>
  );
};

export default Notification;
