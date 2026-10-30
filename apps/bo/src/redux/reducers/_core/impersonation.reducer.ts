import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IImpersonationState, ImpersonationSession } from '@/types/_core/impersonation.type';

const initialState: IImpersonationState = {
  session: null,
};

export const impersonation = createSlice({
  name: 'impersonation',
  initialState,
  reducers: {
    setImpersonationSessionSlice: (
      state: IImpersonationState,
      action: PayloadAction<ImpersonationSession>
    ) => {
      state.session = action.payload;
    },
    clearImpersonationSessionSlice: (state: IImpersonationState) => {
      state.session = null;
    },
  },
});

export const {
  setImpersonationSessionSlice,
  clearImpersonationSessionSlice,
} = impersonation.actions;

export const getImpersonationSessionSelector = (
  state: Record<string, any>
): ImpersonationSession | null => state.impersonation.session;

export default impersonation.reducer;
