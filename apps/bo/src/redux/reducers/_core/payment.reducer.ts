import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { createEntitySlice } from '@/redux/factories/_core/entitySlice.factory';
import { IListTabCounts } from '@/types/_core/app.type';
import {
  IChargedPendingBooking, IPayment, IPaymentLedgerSummary, IPaymentState,
} from '@/types/_core/payment.type';

const payment = createEntitySlice<IPayment>('payment');

/*
 * The whole-ledger figures the list opens on, kept in a slice of their own rather than on the
 * payment entity state: they describe the entire collection, are fetched once when the page is
 * entered, and must not be cleared or replaced by the paginated fetches that keep rewriting the
 * rows underneath them.
 */
const paymentLedger = createSlice({
  name: 'paymentLedger',
  initialState: {
    summary: null as IPaymentLedgerSummary | null,
    // the charged bookings left pending, read for the "to settle" band
    chargedPending: [] as IChargedPendingBooking[],
  },
  reducers: {
    loadChargedPendingBookingsSlice: (state, action: PayloadAction<IChargedPendingBooking[]>) => {
      state.chargedPending = action.payload;
    },
    removeChargedPendingBookingSlice: (state, action: PayloadAction<string>) => {
      state.chargedPending = state.chargedPending.filter(({ objectId }) => objectId !== action.payload);
    },
    clearChargedPendingBookingsSlice: (state) => {
      state.chargedPending = [];
    },
    loadPaymentLedgerSummarySlice: (
      state, action: PayloadAction<IPaymentLedgerSummary>
    ) => {
      state.summary = action.payload;
    },
    clearPaymentLedgerSummarySlice: (state) => {
      state.summary = null;
    },
  },
});

export const {
  loadPaymentLedgerSummarySlice,
  clearPaymentLedgerSummarySlice,
  loadChargedPendingBookingsSlice,
  removeChargedPendingBookingSlice,
  clearChargedPendingBookingsSlice,
} = paymentLedger.actions;

export const paymentLedgerReducer = paymentLedger.reducer;

export const {
  setLoadingSlice: setPaymentLoadingSlice,
  clearOneSlice: clearPaymentSlice,
  loadOneSlice: loadPaymentSlice,
  loadListSlice: loadPaymentsSlice,
  setCountSlice: setPaymentsCountSlice,
  clearListSlice: clearPaymentsSlice,
  clearCountSlice: clearPaymentCountSlice,
  setTabCountsSlice: setPaymentTabCountsSlice,
  replaceInListSlice: replacePaymentInListSlice,
  updateFieldInListSlice: updatePaymentFieldInListSlice,
  updateFieldOnOneSlice: updatePaymentFieldOnOneSlice,
} = payment.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getPaymentSelector = (state: Record<string, any>): IPaymentState => state.payment;
export const getPaymentPaymentSelector = (
  state: Record<string, any>
): IPayment => state.payment.entity;
export const getPaymentLoadingSelector = (
  state: Record<string, any>
): boolean => state.payment.loading;
export const getPaymentPaymentsSelector = (
  state: Record<string, any>
): IPayment[] => state.payment.entities;
export const getPaymentCountSelector = (state: Record<string, any>): number => state.payment.count;
export const getPaymentTabCountsSelector = (
  state: Record<string, any>
): IListTabCounts => state.payment.tabCounts;
export const getPaymentLedgerSummarySelector = (
  state: Record<string, any>
): IPaymentLedgerSummary | null => state.paymentLedger.summary;

export const getPaymentChargedPendingBookingsSelector = (
  state: Record<string, any>
): IChargedPendingBooking[] => state.paymentLedger.chargedPending;

export default payment.reducer;
