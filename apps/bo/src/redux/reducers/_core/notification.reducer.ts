import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IListTabCounts } from '@/types/_core/app.type';
import type { NotificationChannel } from '@shared/types';

import {
  BroadcastHistoryEntry, INotification, INotificationResend, INotificationState, NotificationListCounts,
  NotificationResends,
  NotificationSmsDailyCount,
} from '@/types/_core/notification.type';

const initialState: INotificationState = {
  loading: false,
  notification: null,
  notifications: [],
  count: 0,
  tabCounts: {},
  typeCounts: {},
  failedSendsCount: 0,
  smsDailyCounts: [],
  smsDailyCountsLoading: false,
  resends: [],
  resendableChannels: [],
  broadcastAudienceCount: null,
  broadcastHistory: [],
};

export const notification = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    loadNotificationsSlice: (state: INotificationState, action: PayloadAction<INotification[]>) => {
      state.notifications = action.payload;
    },
    loadNotificationSlice: (state: INotificationState, action: PayloadAction<INotification>) => {
      state.notification = action.payload;
    },
    loadNotificationResendsSlice: (state: INotificationState, action: PayloadAction<NotificationResends>) => {
      state.resends = action.payload.resends;
      state.resendableChannels = action.payload.resendableChannels;
    },
    setNotificationsCountSlice: (state: INotificationState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setNotificationTabCountsSlice: (
      state: INotificationState,
      action: PayloadAction<IListTabCounts>
    ) => {
      state.tabCounts = action.payload;
    },
    /*
     * the figures that describe the whole collection rather than the page on screen: how much each
     * category holds, and how much of the delivery pipeline is in failure
     */
    setNotificationListCountsSlice: (
      state: INotificationState,
      action: PayloadAction<NotificationListCounts>
    ) => {
      state.typeCounts = action.payload.typeCounts;
      state.failedSendsCount = action.payload.failedSendsCount;
    },
    loadNotificationSmsDailyCountsSlice: (
      state: INotificationState,
      action: PayloadAction<NotificationSmsDailyCount[]>
    ) => {
      state.smsDailyCounts = action.payload;
    },
    setNotificationSmsDailyCountsLoadingSlice: (
      state: INotificationState,
      action: PayloadAction<boolean>
    ) => {
      state.smsDailyCountsLoading = action.payload;
    },
    clearNotificationSlice: (state: INotificationState) => {
      state.notification = null;
      // the resends belong to the send that was on the page, not to whichever one opens next
      state.resends = [];
      state.resendableChannels = [];
    },
    clearNotificationsSlice: (state: INotificationState) => {
      state.notifications = [];
    },
    setNotificationLoadingSlice: (state: INotificationState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    /*
     * How many members the announcement being written would reach. Written by the audience check and
     * cleared as soon as the audience is edited: the count is what the operator confirms and what
     * the send is checked against, so a stale one would be a confirmation of a different send.
     */
    setNotificationBroadcastAudienceCountSlice: (
      state: INotificationState,
      action: PayloadAction<number | null>
    ) => {
      state.broadcastAudienceCount = action.payload;
    },
    loadNotificationBroadcastHistorySlice: (
      state: INotificationState,
      action: PayloadAction<BroadcastHistoryEntry[]>
    ) => {
      state.broadcastHistory = action.payload;
    },
    clearNotificationCountSlice: (state: INotificationState) => {
      state.count = 0;
    },
    removeNotificationsSlice: (state: INotificationState, action: PayloadAction<string[]>) => {
      state.notifications = state.notifications.filter((n) => !action.payload.includes(n.id));
    },
    /*
     * merged into the rows on screen rather than swapped for them: a bulk action returns the rows
     * as the write left them, selected down to the fields it touched, so replacing a row outright
     * blanked every column the action had nothing to do with — the message, the sender, the
     * channels — until the next fetch
     */
    updateNotificationsSlice: (state: INotificationState, action: PayloadAction<INotification[]>) => {
      const updatedById = new Map(action.payload.map((n) => [n.id, n]));

      state.notifications = state.notifications.map((n) => {
        const updated = updatedById.get(n.id);

        return updated
          ? { ...n, ...updated }
          : n;
      });
    },
  },
});

export const {
  setNotificationLoadingSlice,
  setNotificationTabCountsSlice,
  setNotificationListCountsSlice,
  loadNotificationSmsDailyCountsSlice,
  setNotificationSmsDailyCountsLoadingSlice,
  clearNotificationSlice,
  loadNotificationSlice,
  loadNotificationResendsSlice,
  loadNotificationsSlice,
  setNotificationsCountSlice,
  clearNotificationsSlice,
  clearNotificationCountSlice,
  removeNotificationsSlice,
  setNotificationBroadcastAudienceCountSlice,
  loadNotificationBroadcastHistorySlice,
  updateNotificationsSlice,
} = notification.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getNotificationSelector = (state: Record<string, any>): INotificationState => state.notification;
export const getNotificationNotificationSelector = (
  state: Record<string, any>
): INotification => state.notification.notification;
export const getNotificationLoadingSelector = (
  state: Record<string, any>
): boolean => state.notification.loading;
export const getNotificationNotificationsSelector = (
  state: Record<string, any>
): INotification[] => state.notification.notifications;
export const getNotificationCountSelector = (state: Record<string, any>): number => state.notification.count;
export const getNotificationTabCountsSelector = (
  state: Record<string, any>
): IListTabCounts => state.notification.tabCounts;
export const getNotificationTypeCountsSelector = (
  state: Record<string, any>
): Record<string, number> => state.notification.typeCounts;
export const getNotificationFailedSendsCountSelector = (
  state: Record<string, any>
): number => state.notification.failedSendsCount;
export const getNotificationSmsDailyCountsSelector = (
  state: Record<string, any>
): NotificationSmsDailyCount[] => state.notification.smsDailyCounts;
export const getNotificationSmsDailyCountsLoadingSelector = (
  state: Record<string, any>
): boolean => state.notification.smsDailyCountsLoading;
export const getNotificationResendsSelector = (
  state: Record<string, any>
): INotificationResend[] => state.notification.resends;
export const getNotificationResendableChannelsSelector = (
  state: Record<string, any>
): NotificationChannel[] => state.notification.resendableChannels;
export const getNotificationBroadcastAudienceCountSelector = (
  state: Record<string, any>
): number | null => state.notification.broadcastAudienceCount;

export const getNotificationBroadcastHistorySelector = (
  state: Record<string, any>
): BroadcastHistoryEntry[] => state.notification.broadcastHistory;

export default notification.reducer;
