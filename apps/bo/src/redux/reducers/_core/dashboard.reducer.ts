import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  IDashboardAlerts, IDashboardKpis, IDashboardRecent, IDashboardState,
} from '@/types/_core/dashboard.type';

const initialState: IDashboardState = {
  kpis: null,
  alerts: null,
  recent: null,
  loading: false,
  hasError: false,
  updatedAt: null,
};

export const dashboard = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    loadDashboardKpisSlice: (state: IDashboardState, action: PayloadAction<IDashboardKpis>) => {
      state.kpis = action.payload;
    },
    loadDashboardAlertsSlice: (state: IDashboardState, action: PayloadAction<IDashboardAlerts>) => {
      state.alerts = action.payload;
    },
    loadDashboardRecentSlice: (state: IDashboardState, action: PayloadAction<IDashboardRecent>) => {
      state.recent = action.payload;
    },
    setDashboardUpdatedAtSlice: (state: IDashboardState, action: PayloadAction<string>) => {
      state.updatedAt = action.payload;
    },
    setDashboardLoadingSlice: (state: IDashboardState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setDashboardErrorSlice: (state: IDashboardState, action: PayloadAction<boolean>) => {
      state.hasError = action.payload;
    },
    clearDashboardSlice: (state: IDashboardState) => {
      state.kpis = null;
      state.alerts = null;
      state.recent = null;
      state.hasError = false;
      state.updatedAt = null;
    },
  },
});

export const {
  loadDashboardKpisSlice,
  loadDashboardAlertsSlice,
  loadDashboardRecentSlice,
  setDashboardUpdatedAtSlice,
  setDashboardLoadingSlice,
  setDashboardErrorSlice,
  clearDashboardSlice,
} = dashboard.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getDashboardKpisSelector = (state: Record<string, any>): IDashboardKpis | null =>
  state.dashboard.kpis;
export const getDashboardAlertsSelector = (state: Record<string, any>): IDashboardAlerts | null =>
  state.dashboard.alerts;
export const getDashboardRecentSelector = (state: Record<string, any>): IDashboardRecent | null =>
  state.dashboard.recent;
export const getDashboardLoadingSelector = (state: Record<string, any>): boolean =>
  state.dashboard.loading;
export const getDashboardHasErrorSelector = (state: Record<string, any>): boolean =>
  state.dashboard.hasError;
export const getDashboardUpdatedAtSelector = (state: Record<string, any>): string | null =>
  state.dashboard.updatedAt;

export default dashboard.reducer;
