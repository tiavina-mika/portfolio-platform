import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  ICancellationReasonPoint,
  ICancellationStatistics,
  IOverviewStatistics,
  IPaymentsStatistics,
  IRideActivityHeatmapPoint,
  IReportsStatistics,
  IRidesStatistics,
  IStatisticsState,
  ISuspendedUserPoint,
  IUsersStatistics,
  IVehiclesStatistics,
} from '@/types/_core/statistics.type';

const initialState: IStatisticsState = {
  overview: null,
  users: null,
  rides: null,
  ridesHeatmap: null,
  payments: null,
  vehicles: null,
  cancellations: null,
  reports: null,
  cancellationReasons: null,
  suspendedUsers: null,
  loading: false,
  ridesHeatmapLoading: false,
  suspendedUsersLoading: false,
};

export const statistics = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    loadOverviewStatisticsSlice: (
      state: IStatisticsState,
      action: PayloadAction<IOverviewStatistics>
    ) => {
      state.overview = action.payload;
    },
    loadUsersStatisticsSlice: (
      state: IStatisticsState,
      action: PayloadAction<IUsersStatistics>
    ) => {
      state.users = action.payload;
    },
    loadRidesStatisticsSlice: (
      state: IStatisticsState,
      action: PayloadAction<IRidesStatistics>
    ) => {
      state.rides = action.payload;
    },
    loadRidesHeatmapSlice: (
      state: IStatisticsState,
      action: PayloadAction<IRideActivityHeatmapPoint[]>
    ) => {
      state.ridesHeatmap = action.payload;
    },
    loadPaymentsStatisticsSlice: (
      state: IStatisticsState,
      action: PayloadAction<IPaymentsStatistics>
    ) => {
      state.payments = action.payload;
    },
    loadVehiclesStatisticsSlice: (
      state: IStatisticsState,
      action: PayloadAction<IVehiclesStatistics>
    ) => {
      state.vehicles = action.payload;
    },
    loadCancellationStatisticsSlice: (
      state: IStatisticsState,
      action: PayloadAction<ICancellationStatistics>
    ) => {
      state.cancellations = action.payload;
    },
    loadReportsStatisticsSlice: (
      state: IStatisticsState,
      action: PayloadAction<IReportsStatistics>
    ) => {
      state.reports = action.payload;
    },
    loadCancellationReasonsSlice: (
      state: IStatisticsState,
      action: PayloadAction<ICancellationReasonPoint[]>
    ) => {
      state.cancellationReasons = action.payload;
    },
    loadSuspendedUsersSlice: (
      state: IStatisticsState,
      action: PayloadAction<ISuspendedUserPoint[]>
    ) => {
      state.suspendedUsers = action.payload;
    },
    setStatisticsLoadingSlice: (state: IStatisticsState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRidesHeatmapLoadingSlice: (state: IStatisticsState, action: PayloadAction<boolean>) => {
      state.ridesHeatmapLoading = action.payload;
    },
    setSuspendedUsersLoadingSlice: (state: IStatisticsState, action: PayloadAction<boolean>) => {
      state.suspendedUsersLoading = action.payload;
    },
    clearOverviewStatisticsSlice: (state: IStatisticsState) => {
      state.overview = null;
    },
    clearUsersStatisticsSlice: (state: IStatisticsState) => {
      state.users = null;
    },
    clearRidesStatisticsSlice: (state: IStatisticsState) => {
      state.rides = null;
      state.ridesHeatmap = null;
    },
    clearPaymentsStatisticsSlice: (state: IStatisticsState) => {
      state.payments = null;
    },
    clearVehiclesStatisticsSlice: (state: IStatisticsState) => {
      state.vehicles = null;
    },
    clearReportsStatisticsSlice: (state: IStatisticsState) => {
      state.reports = null;
    },
    clearCancellationStatisticsSlice: (state: IStatisticsState) => {
      state.cancellations = null;
      state.cancellationReasons = null;
      state.suspendedUsers = null;
    },
  },
});

export const {
  loadOverviewStatisticsSlice,
  loadUsersStatisticsSlice,
  loadRidesStatisticsSlice,
  loadRidesHeatmapSlice,
  loadPaymentsStatisticsSlice,
  loadVehiclesStatisticsSlice,
  loadCancellationStatisticsSlice,
  loadReportsStatisticsSlice,
  loadCancellationReasonsSlice,
  loadSuspendedUsersSlice,
  setStatisticsLoadingSlice,
  setRidesHeatmapLoadingSlice,
  setSuspendedUsersLoadingSlice,
  clearOverviewStatisticsSlice,
  clearUsersStatisticsSlice,
  clearRidesStatisticsSlice,
  clearPaymentsStatisticsSlice,
  clearVehiclesStatisticsSlice,
  clearReportsStatisticsSlice,
  clearCancellationStatisticsSlice,
} = statistics.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getOverviewStatisticsSelector = (
  state: Record<string, any>
): IOverviewStatistics | null => state.statistics.overview;
export const getUsersStatisticsSelector = (
  state: Record<string, any>
): IUsersStatistics | null => state.statistics.users;
export const getRidesStatisticsSelector = (
  state: Record<string, any>
): IRidesStatistics | null => state.statistics.rides;
export const getRidesHeatmapSelector = (
  state: Record<string, any>
): IRideActivityHeatmapPoint[] | null => state.statistics.ridesHeatmap;
export const getPaymentsStatisticsSelector = (
  state: Record<string, any>
): IPaymentsStatistics | null => state.statistics.payments;
export const getVehiclesStatisticsSelector = (
  state: Record<string, any>
): IVehiclesStatistics | null => state.statistics.vehicles;
export const getCancellationStatisticsSelector = (
  state: Record<string, any>
): ICancellationStatistics | null => state.statistics.cancellations;
export const getReportsStatisticsSelector = (
  state: Record<string, any>
): IReportsStatistics | null => state.statistics.reports;
export const getCancellationReasonsSelector = (
  state: Record<string, any>
): ICancellationReasonPoint[] | null => state.statistics.cancellationReasons;
export const getSuspendedUsersSelector = (
  state: Record<string, any>
): ISuspendedUserPoint[] | null => state.statistics.suspendedUsers;
export const getStatisticsLoadingSelector = (state: Record<string, any>): boolean => state.statistics.loading;
export const getRidesHeatmapLoadingSelector = (
  state: Record<string, any>
): boolean => state.statistics.ridesHeatmapLoading;
export const getSuspendedUsersLoadingSelector = (
  state: Record<string, any>
): boolean => state.statistics.suspendedUsersLoading;

export default statistics.reducer;
