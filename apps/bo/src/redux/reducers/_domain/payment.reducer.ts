import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IPayment, IPaymentState } from '@/types/_domain/payment.type';

const initialState: IPaymentState = {
  payments: [],
};

export const payment = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    loadPaymentsSlice: (state: IPaymentState, action: PayloadAction<IPayment[]>) => {
      state.payments = action.payload;
    },
    updatePaymentInPaymentsSlice: (state: IPaymentState, action: PayloadAction<IPayment>) => {
      state.payments = state.payments.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    // the replacement of a cancelled payment comes last, as it was written last
    addPaymentToPaymentsSlice: (state: IPaymentState, action: PayloadAction<IPayment>) => {
      state.payments = [...state.payments, action.payload];
    },
    clearPaymentsSlice: (state: IPaymentState) => {
      state.payments = [];
    },
  },
});

export const {
  loadPaymentsSlice,
  updatePaymentInPaymentsSlice,
  addPaymentToPaymentsSlice,
  clearPaymentsSlice,
} = payment.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getPaymentPaymentsSelector = (state: Record<string, any>): IPayment[] => state.payment.payments;

export default payment.reducer;
