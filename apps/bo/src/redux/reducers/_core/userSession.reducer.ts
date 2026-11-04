import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IUserActiveSession, IUserSessionState } from '@/types/_core/userSession.type';

const initialState: IUserSessionState = {
  sessions: [],
  loading: false,
  hasError: false,
};

export const userSession = createSlice({
  name: 'userSession',
  initialState,
  reducers: {
    loadUserSessionsSlice: (state: IUserSessionState, action: PayloadAction<IUserActiveSession[]>) => {
      state.sessions = action.payload;
    },
    removeUserSessionSlice: (state: IUserSessionState, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter((session) => session.id !== action.payload);
    },
    setUserSessionsLoadingSlice: (state: IUserSessionState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserSessionsErrorSlice: (state: IUserSessionState, action: PayloadAction<boolean>) => {
      state.hasError = action.payload;
    },
    clearUserSessionsSlice: (state: IUserSessionState) => {
      state.sessions = [];
      state.hasError = false;
    },
  },
});

export const {
  loadUserSessionsSlice,
  removeUserSessionSlice,
  setUserSessionsLoadingSlice,
  setUserSessionsErrorSlice,
  clearUserSessionsSlice,
} = userSession.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getUserSessionsSelector = (state: Record<string, any>): IUserActiveSession[] =>
  state.userSession.sessions;
export const getUserSessionsLoadingSelector = (state: Record<string, any>): boolean =>
  state.userSession.loading;
export const getUserSessionsHasErrorSelector = (state: Record<string, any>): boolean =>
  state.userSession.hasError;

export default userSession.reducer;
