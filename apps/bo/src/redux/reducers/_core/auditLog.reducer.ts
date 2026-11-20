import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IUserAuditLog, IUserAuditLogState } from '@/types/_core/auditLog.type';

const initialState: IUserAuditLogState = {
  loading: false,
  auditLogs: [],
  count: 0,
  currentAuditLog: null,
};

export const auditLog = createSlice({
  name: 'auditLog',
  initialState,
  reducers: {
    loadAuditLogsSlice: (state: IUserAuditLogState, action: PayloadAction<IUserAuditLog[]>) => {
      state.auditLogs = action.payload;
    },
    setAuditLogCountSlice: (state: IUserAuditLogState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setAuditLogLoadingSlice: (state: IUserAuditLogState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // the accounts just erased for good leave the recycle bin without reloading the page
    removeAuditLogsByUserIdsSlice: (state: IUserAuditLogState, action: PayloadAction<string[]>) => {
      const remaining = state.auditLogs.filter((log) => !action.payload.includes(log.userId));

      state.count = Math.max(0, state.count - (state.auditLogs.length - remaining.length));
      state.auditLogs = remaining;
    },
    clearAuditLogsSlice: (state: IUserAuditLogState) => {
      state.auditLogs = [];
      state.count = 0;
    },
    setCurrentAuditLogSlice: (state: IUserAuditLogState, action: PayloadAction<IUserAuditLog | null>) => {
      state.currentAuditLog = action.payload;
    },
  },
});

export const {
  loadAuditLogsSlice,
  setAuditLogCountSlice,
  setAuditLogLoadingSlice,
  removeAuditLogsByUserIdsSlice,
  clearAuditLogsSlice,
  setCurrentAuditLogSlice,
} = auditLog.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 */
export const getAuditLogSelector = (state: Record<string, any>): IUserAuditLogState => state.auditLog;
export const getAuditLogLogsSelector = (state: Record<string, any>): IUserAuditLog[] =>
  state.auditLog.auditLogs;
export const getAuditLogCountSelector = (state: Record<string, any>): number => state.auditLog.count;
export const getAuditLogLoadingSelector = (state: Record<string, any>): boolean => state.auditLog.loading;
export const getAuditLogCurrentSelector = (state: Record<string, any>): IUserAuditLog | null =>
  state.auditLog.currentAuditLog;

export default auditLog.reducer;
