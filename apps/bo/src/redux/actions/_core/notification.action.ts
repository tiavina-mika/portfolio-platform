import { type Action } from '@reduxjs/toolkit';


import i18n from '@/config/i18n';
import {
  DEFAULT_PAGINATION, Errors, PAGINATION, recycleBinTabOptions,
} from '@/constants/_core/app.constants';
import {
  NOTIFICATION_LIST_DEFAULT_SORT, NOTIFICATION_SMS_DAILY_COUNTS_DAYS,
} from '@/constants/_core/notification.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  clearNotificationSlice,
  loadNotificationSlice,
  loadNotificationResendsSlice,
  loadNotificationsSlice,
  setNotificationsCountSlice,
  clearNotificationsSlice,
  clearNotificationCountSlice,
  loadNotificationSmsDailyCountsSlice,
  loadNotificationBroadcastHistorySlice,
  removeNotificationsSlice,
  setNotificationBroadcastAudienceCountSlice,
  setNotificationListCountsSlice,
  setNotificationSmsDailyCountsLoadingSlice,
  setNotificationTabCountsSlice,
} from '@/redux/reducers/_core/notification.reducer';
import { AppDispatch } from '@/redux/store';
import {
  bulkRestoreNotificationsByIds, bulkSetNotificationsReceiverSeen, bulkSoftDeleteNotificationsByIds,
  destroyNotificationsByIds, fetchNotification, fetchNotificationBroadcastAudience,
  fetchNotificationBroadcastHistory, fetchNotificationResends, fetchNotifications,
  fetchNotificationSmsDailyCounts,
  resendNotificationFailedDeliveriesInCloud, resendNotificationInCloud, sendNotificationBroadcastInCloud,
} from '@/services/_core/notification.service';
import { IExportColumn, IQueriesInput } from '@/types/_core/app.type';
import { BroadcastInput, INotification, ResendNotificationOptions } from '@/types/_core/notification.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getNotificationChannelCountsLabel, getNotificationReadRatioLabel, getNotificationStatusLabelByValue,
} from '@/utils/_core/notification.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getNotificationTypeLabelByValue, getUserFullName } from '@/utils/_core/user.utils';


const collection = 'Notification';

const notificationExportColumns: IExportColumn<INotification>[] = [
  {
    header: i18n.t('user:notifications.from'),
    getValue: (notification) => getUserFullName(notification.from),
  },
  {
    header: i18n.t('user:notifications.to'),
    getValue: (notification) => notification.to?.map((user) => getUserFullName(user)).join(', ') ?? '',
  },
  {
    header: i18n.t('user:notifications.type'),
    getValue: (notification) => getNotificationTypeLabelByValue(notification.type),
  },
  {
    header: i18n.t('user:notifications.status'),
    getValue: (notification) => getNotificationStatusLabelByValue(notification.type, notification.status),
  },
  /*
   * how many of the recipients opened it, read off the per-recipient list — the legacy yes/no was
   * written by whichever recipient opened it first, so a fan-out read by one of four exported as read
   */
  {
    header: i18n.t('user:notifications.readRate'),
    getValue: (notification) => getNotificationReadRatioLabel(notification),
  },
  {
    // only set once the last recipient opened it, which is what the server derives it from
    header: i18n.t('user:notifications.readByAllAt'),
    getValue: (notification) => (notification.receiverSeenAt
      ? displayDate(notification.receiverSeenAt, true, true)
      : ''),
  },
  {
    header: i18n.t('common:deleted'),
    getValue: (notification) => (notification.deleted
      ? i18n.t('common:yes')
      : i18n.t('common:no')),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (notification) => displayDate(notification.createdAt, true, true),
  },
];

export const getNotification = fetchNotification;

export const goToNotification = (id: string) => ({ to: PATH_NAMES.notifications + '/$id', params: { id } });


/*
 * generic loadList/exportList thunks only. `onNotificationsEnter` does not use the factory's
 * `onListEnter` because the list endpoint also returns tab, category and backlog counts the factory
 * cannot dispatch, and there is no single/bulk soft-delete or generic toggle for notifications
 * (`bulkMarkNotificationsAsSeen`/`bulkSoftDeleteNotifications` use a caller-supplied callback
 * instead), so only the two purely mechanical thunks are extracted.
 */
const notificationCrud = createCrudThunks<INotification>({
  collection,
  listCloudFunction: 'getNotifications',
  slice: {
    loadListSlice: loadNotificationsSlice,
    setCountSlice: setNotificationsCountSlice,
    clearOneSlice: clearNotificationSlice,
    clearListSlice: clearNotificationsSlice,
    clearCountSlice: clearNotificationCountSlice,
    removeManyFromListSlice: removeNotificationsSlice,
  },
  getExportColumns: () => notificationExportColumns,
  exportFileNamePrefix: 'notifications',
});

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
/**
 * One page of the list, with the figures that stand outside its rows.
 *
 * Hand-written rather than taken from the factory: the endpoint reports three sets of counts — the
 * tabs, the categories and the delivery backlog — and only the first of them is something the
 * generic thunk knows how to dispatch.
 */
export const loadNotifications = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = NOTIFICATION_LIST_DEFAULT_SORT.orderBy,
  order = NOTIFICATION_LIST_DEFAULT_SORT.order,
  filters,
  search,
}: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const result = await fetchNotifications({
      limit, skip, orderBy, order, filters, search,
    });

    dispatch(loadNotificationsSlice(result.results));
    dispatch(setNotificationsCountSlice(result.count));
    dispatch(setNotificationTabCountsSlice(result.tabCounts));
    dispatch(setNotificationListCountsSlice({
      typeCounts: result.typeCounts,
      failedSendsCount: result.failedSendsCount,
    }));
  });
};

export const exportNotifications: any = notificationCrud.exportList;

/**
 * Reads how many fallback SMS went out each recent day, for the card above the list. It tracks its
 * own loading flag rather than the page's: the figures are read next to the list, not before it, and
 * the card must hold its place while they come instead of announcing that no SMS was sent.
 */
export const loadNotificationSmsDailyCounts = (days = NOTIFICATION_SMS_DAILY_COUNTS_DAYS): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const counts = await fetchNotificationSmsDailyCounts(days);

    dispatch(loadNotificationSmsDailyCountsSlice(counts));
  },
  {
    collection,
    action: 'find',
    localLoadingAction: setNotificationSmsDailyCountsLoadingSlice,
  });
};

/**
 * Bulk-mark selected notifications as seen/unseen (receiverSeen field).
 * Updates the store immediately without re-fetching.
 */
export const bulkMarkNotificationsAsSeen = (
  ids: string[],
  value: boolean,
  callback?: (items: INotification[]) => Action
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updated = await bulkSetNotificationsReceiverSeen(ids, value);

    if (!callback) return;

    dispatch(callback(updated));
  },
  {
    collection,
    action: 'update',
  });
};

/**
 * Soft-delete selected notifications by setting deleted=true.
 * Removes them from the store after deletion.
 */
export const bulkSoftDeleteNotifications = (
  ids: string[],
  callback?: (ids: string[]) => Action
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await bulkSoftDeleteNotificationsByIds(ids);

    if (!callback) return;
    dispatch(callback(ids));
  },
  {
    collection,
    action: 'update',
  });
};

/**
 * Takes binned sends back out of the recycle bin, and drops them from the list on screen — the
 * recycle-bin tab is where the action lives, and a restored send no longer belongs to it.
 *
 * The bin used to be a one-way door: a send binned by mistake could only be destroyed. It is the
 * same soft-delete flag, flipped, and the server records who flipped it.
 */
export const restoreNotifications = (
  ids: string[],
  callback?: (ids: string[]) => Action
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await bulkRestoreNotificationsByIds(ids);

    if (!callback) return;
    dispatch(callback(ids));
  },
  {
    collection,
    action: 'update',
  });
};

/**
 * Destroys binned sends for good, with the resend history that names who each one went to.
 *
 * Its own endpoint rather than the generic `destroyObjects` thunk every other list uses: that one
 * would leave those resends behind, naming the recipients of a notification that no longer exists.
 */
export const destroyNotifications = (
  ids: string[],
  callback?: (ids: string[]) => Action
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const destroyedCount = await destroyNotificationsByIds(ids);

    dispatch(setMessageSlice(i18n.t('common:infoMessages.destroyedSuccessfullyWithCount', {
      number: `${destroyedCount}/${ids.length}`,
      entity: i18n.t('user:notifications.notifications'),
    })));

    if (!callback) return;
    dispatch(callback(ids));
  },
  {
    collection,
    action: 'destroy',
  });
};

/*
 * reads the sends a resend touched again and hands them to the caller's slice action. A resend
 * rewrites the channel entries and the resend count of its row; left as they were, the list kept
 * stating the refusal that had just been retried, and an operator reading "still failed" would
 * retry it — sending a billed SMS a second time.
 */
const refreshNotificationRows = async (
  dispatch: AppDispatch,
  ids: string[],
  callback: (items: INotification[]) => Action
): Promise<void> => {
  const refreshed = await Promise.all(ids.map((id) => getNotification(id)));

  dispatch(callback(refreshed.filter((notification): notification is INotification => !!notification)));
};

/**
 * Sends an already-created notification again on one channel. A message is sent once, at creation,
 * so a phone that was offline, a mailbox that bounced or a number briefly unreachable never gets it,
 * and support had no answer to "I never received it" — this is that answer.
 */
export const resendNotification = (
  id: string,
  options: ResendNotificationOptions,
  callback?: (items: INotification[]) => Action
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const resentCount = await resendNotificationInCloud(id, options);

    dispatch(setMessageSlice(resentCount > 0
      ? i18n.t('user:notifications.resent', { count: resentCount })
      : i18n.t('user:notifications.resendFailed')));

    if (!callback) return;

    await refreshNotificationRows(dispatch, [id], callback);
  },
  {
    collection,
    action: 'update',
  });
};

/**
 * Sends the selected sends again, to the recipients a provider rejected them for, on every channel
 * that can be rebuilt.
 *
 * Only the refusals are retried. Every other non-delivery — no device registered, no phone number,
 * a channel the recipient turned off — says there was nothing to send in the first place, so
 * retrying them would either fail identically or override a choice the recipient made. The counts
 * that come back are what the confirmation states, channel by channel: nothing to retry is not a
 * failure, and saying "resent" after touching nobody would be a lie an operator acts on.
 */
export const resendNotificationFailedDeliveries = (
  ids: string[],
  callback?: (items: INotification[]) => Action
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const resentCounts = await resendNotificationFailedDeliveriesInCloud(ids);
    const resentCount = Object.values(resentCounts).reduce((total, count) => total + count, 0);

    dispatch(setMessageSlice(resentCount > 0
      ? i18n.t('user:notifications.failedDeliveriesResent', {
        count: resentCount,
        channels: getNotificationChannelCountsLabel(resentCounts),
      })
      : i18n.t('user:notifications.noFailedDeliveryToResend')));

    if (!callback || resentCount === 0) return;

    await refreshNotificationRows(dispatch, ids, callback);
  },
  {
    collection,
    action: 'update',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * load categories data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onNotificationsEnter = (route?: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      ...NOTIFICATION_LIST_DEFAULT_SORT,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    // convert the url search params tab to (db) filters
    const newFilters = convertSearchParamsToFilters({
      // the recycle-bin tab is what turns ?tab=<recycle bin> into deleted: true
      tabs: recycleBinTabOptions,
      searchParams: route.search,
      filters,
      acceptedFields: ['deleted'],
    });

    values.filters = newFilters;

    dispatch(loadNotifications(values));
    // not awaited: the card above the list fills in when its figures arrive, the list does not wait
    dispatch(loadNotificationSmsDailyCounts());
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/*
 * the send and its resends travel together: the page states both, and a resend changes both — an
 * attempt on the channel it touched, and a line in the history
 */
const loadNotificationPage = async (dispatch: AppDispatch, id: string): Promise<void> => {
  const [notification, resends] = await Promise.all([
    getNotification(id),
    fetchNotificationResends(id),
  ]);

  if (!notification) {
    throw new Error(Errors.notFound);
  }

  dispatch(loadNotificationSlice(notification));
  dispatch(loadNotificationResendsSlice(resends ?? { resends: [], resendableChannels: [] }));
};

/**
 * Fetches the send the page is about again, after an action changed what it states — left as it
 * was, the page would go on showing the refusal that was just retried, and an operator reading
 * "still failed" would retry a send that had just gone through.
 */
export const reloadNotification = (id: string): any => {
  return actionWithLoader((dispatch: AppDispatch): Promise<void> => loadNotificationPage(dispatch, id));
};

/**
 * load the notification before its page is displayed (in route)
 *
 * The right checked is the list's own: a send's page says nothing its list row did not already
 * show, so opening it needs no right of its own.
 */
export const onNotificationEnter = (route?: any): any => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    if (!route.params?.id) return;

    await loadNotificationPage(dispatch, route.params.id);
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/*
 * ---------------------------------------- //
 * -------------- broadcast --------------- //
 * ---------------------------------------- //
 */
export const goToNotificationBroadcast = () => ({ to: PATH_NAMES.broadcast });

/**
 * Reads the announcements sent most recently, for the list under the form. Dispatched when the page
 * opens and again after a send, so the announcement just written is the first line of it.
 */
export const loadNotificationBroadcastHistory = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    dispatch(loadNotificationBroadcastHistorySlice(await fetchNotificationBroadcastHistory()));
  });
};

/**
 * Counts the members the announcement being written would reach, and puts the figure where the
 * confirmation reads it. It is the one number that makes writing to a segment of the membership a
 * reviewable decision, so it comes from the server rather than from a guess made here.
 */
export const loadNotificationBroadcastAudience = (
  audience: Pick<BroadcastInput, 'segment' | 'city'>
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const recipientCount = await fetchNotificationBroadcastAudience(audience);

    dispatch(setNotificationBroadcastAudienceCountSlice(recipientCount));
  });
};

/**
 * Forgets the counted audience. Dispatched the moment the segment or the city is edited: the count
 * on screen is what the operator confirms and what the server checks the send against, so one left
 * over from a previous audience would be a confirmation of a send nobody reviewed.
 */
export const clearNotificationBroadcastAudience = (): any => (
  (dispatch: AppDispatch): void => {
    dispatch(setNotificationBroadcastAudienceCountSlice(null));
  }
);

/**
 * Sends the announcement, then clears the counted audience so the form cannot be submitted twice on
 * the strength of one confirmation. `expectedRecipientCount` is the figure the operator confirmed:
 * the server recounts and refuses the send when the audience has moved since, because a broadcast
 * cannot be taken back.
 */
export const sendNotificationBroadcast = (
  broadcast: BroadcastInput & { expectedRecipientCount: number },
  callback?: () => void
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const recipientCount = await sendNotificationBroadcastInCloud(broadcast);

    dispatch(setNotificationBroadcastAudienceCountSlice(null));
    dispatch(setMessageSlice(i18n.t('user:notifications.broadcast.sent', { count: recipientCount })));
    callback?.();
    dispatch(loadNotificationBroadcastHistory());
  });
};
