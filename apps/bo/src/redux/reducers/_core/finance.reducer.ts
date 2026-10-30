import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  IDriversPendingDebtTotals, IDriverWalletBalance, IDriverWithPendingDebt, IFinanceOverview,
  IFinanceState, IOverduePendingPayment,
} from '@/types/_core/finance.type';

const initialState: IFinanceState = {
  overview: null,
  overduePendingPayments: null,
  driverWallet: null,
  driversWithPendingDebt: null,
  driversWithPendingDebtCount: 0,
  driversWithPendingDebtTotals: null,
  loading: false,
};

export const finance = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    loadFinanceOverviewSlice: (
      state: IFinanceState,
      action: PayloadAction<IFinanceOverview>
    ) => {
      state.overview = action.payload;
    },
    loadOverduePendingPaymentsSlice: (
      state: IFinanceState,
      action: PayloadAction<IOverduePendingPayment[]>
    ) => {
      state.overduePendingPayments = action.payload;
    },
    loadDriverWalletSlice: (
      state: IFinanceState,
      action: PayloadAction<IDriverWalletBalance | null>
    ) => {
      state.driverWallet = action.payload;
    },
    clearDriverWalletSlice: (state: IFinanceState) => {
      state.driverWallet = null;
    },
    loadDriversWithPendingDebtSlice: (
      state: IFinanceState,
      action: PayloadAction<IDriverWithPendingDebt[]>
    ) => {
      state.driversWithPendingDebt = action.payload;
    },
    setDriversWithPendingDebtCountSlice: (state: IFinanceState, action: PayloadAction<number>) => {
      state.driversWithPendingDebtCount = action.payload;
    },
    setDriversWithPendingDebtTotalsSlice: (
      state: IFinanceState,
      action: PayloadAction<IDriversPendingDebtTotals>
    ) => {
      state.driversWithPendingDebtTotals = action.payload;
    },
    clearDriversWithPendingDebtSlice: (state: IFinanceState) => {
      state.driversWithPendingDebt = null;
      state.driversWithPendingDebtCount = 0;
      state.driversWithPendingDebtTotals = null;
    },
    setFinanceLoadingSlice: (state: IFinanceState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearFinanceOverviewSlice: (state: IFinanceState) => {
      state.overview = null;
      state.overduePendingPayments = null;
    },
  },
});

export const {
  loadFinanceOverviewSlice,
  loadOverduePendingPaymentsSlice,
  loadDriverWalletSlice,
  clearDriverWalletSlice,
  loadDriversWithPendingDebtSlice,
  setDriversWithPendingDebtCountSlice,
  setDriversWithPendingDebtTotalsSlice,
  clearDriversWithPendingDebtSlice,
  setFinanceLoadingSlice,
  clearFinanceOverviewSlice,
} = finance.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getFinanceOverviewSelector = (
  state: Record<string, any>
): IFinanceOverview | null => state.finance.overview;
export const getOverduePendingPaymentsSelector = (
  state: Record<string, any>
): IOverduePendingPayment[] | null => state.finance.overduePendingPayments;
export const getDriverWalletSelector = (
  state: Record<string, any>
): IDriverWalletBalance | null => state.finance.driverWallet;
export const getDriversWithPendingDebtSelector = (
  state: Record<string, any>
): IDriverWithPendingDebt[] | null => state.finance.driversWithPendingDebt;
export const getDriversWithPendingDebtCountSelector = (
  state: Record<string, any>
): number => state.finance.driversWithPendingDebtCount;
export const getDriversWithPendingDebtTotalsSelector = (
  state: Record<string, any>
): IDriversPendingDebtTotals | null => state.finance.driversWithPendingDebtTotals;
export const getFinanceLoadingSelector = (state: Record<string, any>): boolean => state.finance.loading;

export default finance.reducer;
