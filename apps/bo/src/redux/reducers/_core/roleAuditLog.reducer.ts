import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IRoleAuditLog, IRoleAuditLogState } from '@/types/_core/roleAuditLog.type';

const initialState: IRoleAuditLogState = {
  loading: false,
  auditLogs: [],
  count: 0,
};

export const roleAuditLog = createSlice({
  name: 'roleAuditLog',
  initialState,
  reducers: {
    loadRoleAuditLogsSlice: (state: IRoleAuditLogState, action: PayloadAction<IRoleAuditLog[]>) => {
      state.auditLogs = action.payload;
    },
    setRoleAuditLogCountSlice: (state: IRoleAuditLogState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setRoleAuditLogLoadingSlice: (state: IRoleAuditLogState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearRoleAuditLogsSlice: (state: IRoleAuditLogState) => {
      state.auditLogs = [];
      state.count = 0;
    },
  },
});

export const {
  loadRoleAuditLogsSlice,
  setRoleAuditLogCountSlice,
  setRoleAuditLogLoadingSlice,
  clearRoleAuditLogsSlice,
} = roleAuditLog.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 */
export const getRoleAuditLogLogsSelector = (state: Record<string, any>): IRoleAuditLog[] =>
  state.roleAuditLog.auditLogs;
export const getRoleAuditLogCountSelector = (state: Record<string, any>): number => state.roleAuditLog.count;
export const getRoleAuditLogLoadingSelector = (state: Record<string, any>): boolean =>
  state.roleAuditLog.loading;

export default roleAuditLog.reducer;
