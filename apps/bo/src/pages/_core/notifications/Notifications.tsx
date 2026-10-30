import { NotificationChannelEnum, NotificationResendReasonEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import {
  ReactNode, useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import type { NotificationChannel } from '@shared/types';

import Dialog from '@/components/Dialog';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import DatesCell from '@/components/table/DatesCell';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/_core/app.constants';
import {
  NOTIFICATION_LIST_DEFAULT_SORT, NOTIFICATION_SMS_DAILY_COUNTS_DAYS,
} from '@/constants/_core/notification.constants';
import NotificationChannelsCell from '@/containers/_core/notification/NotificationChannelsCell';
import NotificationDeliveryDialog from '@/containers/_core/notification/NotificationDeliveryDialog';
import NotificationMessageCell from '@/containers/_core/notification/NotificationMessageCell';
import NotificationReadRateCell from '@/containers/_core/notification/NotificationReadRateCell';
import NotificationRecipientsCell from '@/containers/_core/notification/NotificationRecipientsCell';
import NotificationRowActions from '@/containers/_core/notification/NotificationRowActions';
import NotificationRowDetail from '@/containers/_core/notification/NotificationRowDetail';
import NotificationSenderCell from '@/containers/_core/notification/NotificationSenderCell';
import NotificationSmsCostCard from '@/containers/_core/notification/NotificationSmsCostCard';
import NotificationStatusChip from '@/containers/_core/notification/NotificationStatusChip';
import SearchNotifications from '@/containers/_core/notification/SearchNotifications';
import { useProtect } from '@/hooks/_core/useProtect';
import {
  bulkMarkNotificationsAsSeen,
  bulkSoftDeleteNotifications,
  destroyNotifications,
  exportNotifications,
  goToNotification,
  loadNotifications,
  resendNotification,
  resendNotificationFailedDeliveries,
  restoreNotifications,
} from '@/redux/actions/_core/notification.action';
import {
  getNotificationCountSelector,
  getNotificationNotificationsSelector,
  getNotificationSmsDailyCountsLoadingSelector,
  getNotificationSmsDailyCountsSelector,
  getNotificationTabCountsSelector,
  getNotificationTypeCountsSelector,
  removeNotificationsSlice,
  updateNotificationsSlice,
} from '@/redux/reducers/_core/notification.reducer';
import { notificationsRoute } from '@/routes/protected/_core/notification.routes';
import {
  ExportFormat, IQueriesInput, IRenderSearchProps, ITableHeadCell, ITableSortField, ITabSearchParams,
} from '@/types/_core/app.type';
import {
  INotification,
} from '@/types/_core/notification.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import {
  getNotificationChannelCountsLabel, getNotificationResendableChannels, getNotificationsRetryableFailedCounts,
  getNotificationUnreadRecipientIds,
} from '@/utils/_core/notification.utils';

interface IData {
  // the row's own bookkeeping, stripped by the table before the cells are drawn (ROW_META_FIELDS)
  id: string;
  unseen: boolean;
  status: ReactNode;
  message: ReactNode;
  from: ReactNode;
  to: ReactNode;
  channels: ReactNode;
  readRate: ReactNode;
  createdAt: ReactNode;
  actions: ReactNode;
}

/*
 * this list's bulk action does not touch the back-office `seen` flag every other list tracks: it
 * writes the recipients' own read state, what they see in their app's inbox. Under the shared
 * label an admin tidying their queue was silently rewriting what a user had read, so it says whose
 * reading it is talking about.
 */
const RECEIVER_SEEN_LABELS = {
  seen: i18n.t('common:markAsReadByReceiver'),
  unseen: i18n.t('common:markAsUnreadByReceiver'),
};

/*
 * The columns answer, in order, the questions asked of a send: what it announced, what it actually
 * said, who raised it, who it went to, whether it got there, whether it was read, and when it left.
 *
 * "Whether it got there" and "whether it was read" are two columns rather than one because they
 * fail separately and are fixed separately: a push the provider refused is the platform's problem
 * to retry, and a delivered notification nobody opened is a reminder to send. The old list had
 * neither — it carried a single yes/no that was written by whichever recipient opened it first.
 */
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'status',
    label: i18n.t('user:notifications.status'),
    sortFields: [{ id: 'status', label: i18n.t('user:notifications.status') }],
  },
  {
    id: 'message',
    label: i18n.t('common:message'),
    // a localized object, not a column the database can order rows on
    disableSorting: true,
  },
  {
    id: 'from',
    label: i18n.t('user:notifications.from'),
    // a pointer to another class — the list is ordered on the notification's own columns
    disableSorting: true,
  },
  {
    id: 'to',
    label: i18n.t('user:notifications.recipients'),
    sortFields: [{ id: 'toCount', label: i18n.t('user:notifications.recipientCount') }],
  },
  {
    id: 'channels',
    label: i18n.t('user:notifications.channelsLabel'),
    // one outcome per recipient per channel — there is no single value to order rows on
    disableSorting: true,
  },
  {
    id: 'readRate',
    label: i18n.t('user:notifications.readRate'),
    sortFields: [{ id: 'readState', label: i18n.t('user:notifications.readRate') }],
  },
  {
    id: 'createdAt',
    label: i18n.t('user:notifications.sentAt'),
    align: 'right',
    sortFields: [{ id: 'createdAt', label: i18n.t('user:notifications.sentAt') }],
  },
  {
    id: 'actions',
    label: i18n.t('common:actions'),
    align: 'right',
  },
];

/*
 * when a send was last touched — by a recipient opening it, or by an admin acting on it. It is not
 * a column because it says nothing about the notification itself, but it is how an operator picks
 * a queue back up after a round of retries.
 */
const extraSortFields: ITableSortField[] = [
  { id: 'updatedAt', label: i18n.t('common:updatedAt') },
];

const collection = 'Notification';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'user']);

  const notifications = useSelector(getNotificationNotificationsSelector);
  const count = useSelector(getNotificationCountSelector);
  const tabCounts = useSelector(getNotificationTabCountsSelector);
  const typeCounts = useSelector(getNotificationTypeCountsSelector);
  const smsDailyCounts = useSelector(getNotificationSmsDailyCountsSelector);
  const isSmsDailyCountsLoading = useSelector(getNotificationSmsDailyCountsLoadingSelector);

  /*
   * which send's per-recipient grid is open. Held as the row's id and read back from the store
   * rather than kept as a copy: a retry from the grid refreshes that row, and a copy would go on
   * showing the refusal that was just retried.
   */
  const [deliveryNotificationId, setDeliveryNotificationId] = useState<string | null>(null);
  // the sends whose refusals wait on a confirmation, because retrying them sends at least one SMS
  const [failuresResendIds, setFailuresResendIds] = useState<string[] | null>(null);
  const searchParams: ITabSearchParams = notificationsRoute.useSearch();

  const {
    canDelete,
    canDestroy,
    canEdit,
  } = useProtect(collection);

  // a binned send is already deleted: offering to delete it again would only rewrite who binned it
  const isRecycleBin = isCurrentTab(searchParams?.tab);

  const deliveryNotification = deliveryNotificationId
    ? notifications.find((notification: INotification) => notification.id === deliveryNotificationId) ?? null
    : null;

  const handleCloseDeliveryDialog = () => setDeliveryNotificationId(null);

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadNotifications(queries));
  };

  const handleExport = (format: ExportFormat, queries: IQueriesInput) => {
    dispatch(exportNotifications(queries, format));
  };

  const handleMarkAsSeenSelected = (ids: string[], value: boolean) => {
    dispatch(bulkMarkNotificationsAsSeen(ids, value, updateNotificationsSlice));
  };

  const handleDeleteSelected = useCallback((ids: string[]) => {
    dispatch(bulkSoftDeleteNotifications(ids, removeNotificationsSlice));
  }, [dispatch]);

  /*
   * Puts binned sends back in the list. The recycle bin only ever offered "destroy permanently", so
   * a send binned by mistake — or a whole selection mis-clicked — had no way back, while the
   * back-office documentation said it had one. Same soft-delete flag, flipped.
   */
  const handleRestore = useCallback((ids: string[]) => {
    dispatch(restoreNotifications(ids, removeNotificationsSlice));
  }, [dispatch]);

  /*
   * Destroys binned sends for good, with the resend history that names who each one went to. Its own
   * thunk rather than the generic `destroyObjects` every other list uses: that one would leave those
   * resends behind, naming the recipients of a notification that no longer exists.
   */
  const handleDestroy = useCallback((ids: string[]) => {
    dispatch(destroyNotifications(ids, removeNotificationsSlice));
  }, [dispatch]);

  /*
   * every resend from the list refreshes the rows it touched, as the send's own page already did
   * in the recycle bin the rows are already binned, so the delete action destroys them instead —
   * the same reading the other back-office lists give the button in that tab
   */
  const deleteSelectedAction = isRecycleBin
    ? (canDestroy ? handleDestroy : undefined)
    : handleDeleteSelected;

  const handleResendFailures = useCallback((ids: string[]) => {
    dispatch(resendNotificationFailedDeliveries(ids, updateNotificationsSlice));
  }, [dispatch]);

  /*
   * every SMS sent again is billed, so a retry holding one — from the selection, a row's menu or its
   * panel — is confirmed first, stating how many go out on each channel; the others go straight out
   */
  const handleRequestFailuresResend = useCallback((ids: string[]) => {
    const failedCounts = getNotificationsRetryableFailedCounts(
      notifications.filter((notification: INotification) => ids.includes(notification.id))
    );

    if (failedCounts[NotificationChannelEnum.SMS]) {
      setFailuresResendIds(ids);
      return;
    }

    handleResendFailures(ids);
  }, [notifications, handleResendFailures]);

  const handleCloseFailuresConfirmation = () => setFailuresResendIds(null);

  const handleConfirmFailuresResend = () => {
    if (!failuresResendIds) return;

    handleResendFailures(failuresResendIds);
    setFailuresResendIds(null);
  };

  const handleResend = useCallback((id: string) => {
    dispatch(resendNotification(id, {
      channel: NotificationChannelEnum.PUSH,
      reason: NotificationResendReasonEnum.ALL,
    }, updateNotificationsSlice));
  }, [dispatch]);
  const handlePreview = useCallback((id: string) => {
    navigate(goToNotification(id));
  }, [navigate]);

  /*
   * a reminder to the people who have not opened it, rather than the whole send again: re-alerting
   * the recipients whose phones did receive it is what makes an app's notifications ignorable
   */
  const handleResendUnread = useCallback((notification: INotification) => {
    const unreadIds = getNotificationUnreadRecipientIds(notification);

    if (unreadIds.length === 0) return;

    dispatch(resendNotification(notification.id, {
      channel: NotificationChannelEnum.PUSH,
      toIds: unreadIds,
      reason: NotificationResendReasonEnum.UNREAD,
    }, updateNotificationsSlice));
  }, [dispatch]);

  const handleResendToRecipient = useCallback((notification: INotification) => (
    userId: string,
    channel: NotificationChannel
  ) => {
    dispatch(resendNotification(notification.id, {
      channel,
      toIds: [userId],
      reason: NotificationResendReasonEnum.RECIPIENT,
    }, updateNotificationsSlice));
  }, [dispatch]);

  // table data
  const dataTable = useMemo((): IData[] => {
    return notifications.map((notification: INotification) => {
      // a binned send is no longer something anybody should be alerted about
      const canResend = !!canEdit && !notification.deleted;

      return {
        id: notification.id, // required even if not displayed
        unseen: !notification.seen,
        status: <NotificationStatusChip notification={notification} />,
        message: <NotificationMessageCell notification={notification} />,
        from: <NotificationSenderCell notification={notification} />,
        to: <NotificationRecipientsCell notification={notification} />,
        channels: (
          <NotificationChannelsCell
            notification={notification}
            resendableChannels={getNotificationResendableChannels(notification)}
            /*
             * the grid is only worth opening on a fan-out: a send to one person already states that
             * person's whole outcome on the slots themselves, and is retried from them
             */
            onOpenDelivery={(notification.toCount ?? notification.to?.length ?? 0) > 1
              ? () => setDeliveryNotificationId(notification.id)
              : undefined}
            onRetry={canResend
              ? handleResendToRecipient(notification)
              : undefined}
          />
        ),
        readRate: <NotificationReadRateCell notification={notification} />,
        createdAt: <DatesCell createdAt={notification.createdAt} updatedAt={notification.updatedAt} />,
        actions: (
          <NotificationRowActions
            notification={notification}
            onPreview={() => handlePreview(notification.id)}
            onDelete={canDelete && !notification.deleted
              ? () => handleDeleteSelected([notification.id])
              : undefined}
            // both only make sense on a send already in the bin, and each needs its own right
            onDestroy={canDestroy && notification.deleted
              ? () => handleDestroy([notification.id])
              : undefined}
            onResend={canResend
              ? () => handleResend(notification.id)
              : undefined}
            onResendFailed={canResend
              ? () => handleRequestFailuresResend([notification.id])
              : undefined}
            onResendUnread={canResend
              ? () => handleResendUnread(notification)
              : undefined}
            onRestore={canEdit && notification.deleted
              ? () => handleRestore([notification.id])
              : undefined}
          />
        ),
      };
    });
  }, [
    notifications,
    canDelete,
    canDestroy,
    canEdit,
    handleDeleteSelected,
    handleDestroy,
    handlePreview,
    handleRequestFailuresResend,
    handleResend,
    handleResendToRecipient,
    handleResendUnread,
    handleRestore,
  ]);

  const renderRowDetail = useCallback((data: IData) => {
    const notification = notifications.find(
      (item: INotification) => item.id === data.id
    );

    if (!notification) return null;

    // the same rule as the row's own menu: a binned send is no longer something to alert anyone about
    const canResend = !!canEdit && !notification.deleted;

    return (
      <NotificationRowDetail
        notification={notification}
        onResendFailed={canResend
          ? () => handleRequestFailuresResend([notification.id])
          : undefined}
        onResendUnread={canResend
          ? () => handleResendUnread(notification)
          : undefined}
      />
    );
  }, [notifications, canEdit, handleRequestFailuresResend, handleResendUnread]);

  const failuresToConfirm = failuresResendIds
    ? getNotificationsRetryableFailedCounts(
      notifications.filter((notification: INotification) => failuresResendIds.includes(notification.id))
    )
    : {};

  return (
    <>
      <Head title={t('user:notifications.notifications')} />
      <PageHeader title={t('user:notifications.notifications')} />
      <NotificationSmsCostCard
        counts={smsDailyCounts}
        days={NOTIFICATION_SMS_DAILY_COUNTS_DAYS}
        loading={isSmsDailyCountsLoading}
      />
      <ListWithSelection<IData>
        enableMultipleSelect
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        defaultOrder={NOTIFICATION_LIST_DEFAULT_SORT.order}
        defaultOrderBy={NOTIFICATION_LIST_DEFAULT_SORT.orderBy}
        extraSortFields={extraSortFields}
        headCells={headCells}
        items={dataTable}
        listId="notifications"
        markAsSeenLabels={RECEIVER_SEEN_LABELS}
        onDeleteSelected={deleteSelectedAction}
        onExport={handleExport}
        onMarkAsSeenSelected={handleMarkAsSeenSelected}
        onUpdateData={handleUpdateData}
        renderRowDetail={renderRowDetail}
        tabCounts={tabCounts}
        tabs={recycleBinTabOptions}
        /*
         * retrying the refused sends of a whole selection: the one bulk action this list has that
         * is neither about the queue nor about deleting rows — a provider outage leaves a full
         * screen of rows to send again, and one row at a time is not a way to work through it
         */
        extraSelectionActions={[{
          label: t('user:notifications.resendFailures'),
          onClick: handleRequestFailuresResend,
          // the server refuses to resend a binned send, so the recycle bin does not offer it
          display: !!canEdit && !isRecycleBin,
        }, {
          // a whole selection binned by mistake, put back in one go — only the bin holds such rows
          label: t('common:restore'),
          onClick: handleRestore,
          display: !!canEdit && isRecycleBin,
        }]}
        renderFilter={(props: IRenderSearchProps) => (
          <SearchNotifications {...props} typeCounts={typeCounts} />
        )}
      />
      <NotificationDeliveryDialog
        notification={deliveryNotification}
        onClose={handleCloseDeliveryDialog}
        onRetry={canEdit && deliveryNotification && !deliveryNotification.deleted
          ? handleResendToRecipient(deliveryNotification)
          : undefined}
        resendableChannels={deliveryNotification
          ? getNotificationResendableChannels(deliveryNotification)
          : undefined}
      />
      <Dialog
        onPrimaryButtonAction={handleConfirmFailuresResend}
        open={!!failuresResendIds}
        primaryButtonText={t('user:notifications.resendFailures')}
        title={t('user:notifications.confirmResendTitle')}
        toggle={handleCloseFailuresConfirmation}
        description={`${t('user:notifications.confirmResendDescription', {
          channels: getNotificationChannelCountsLabel(failuresToConfirm),
        })} ${t('user:notifications.smsCostNotice')}`}
      />
    </>
  );
};

export default Notifications;
