import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IClient, IClientState } from '@/types/_domain/client.type';

const initialState: IClientState = {
  clients: [],
  count: 0,
};

export const client = createSlice({
  name: 'client',
  initialState,
  reducers: {
    loadClientsSlice: (state: IClientState, action: PayloadAction<IClient[]>) => {
      state.clients = action.payload;
    },
    setClientsCountSlice: (state: IClientState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    // a client just created leads the list, where the reader who typed it expects to find it
    addClientToClientsSlice: (state: IClientState, action: PayloadAction<IClient>) => {
      state.clients = [action.payload, ...state.clients];
      state.count += 1;
    },
    updateClientInClientsSlice: (state: IClientState, action: PayloadAction<IClient>) => {
      state.clients = state.clients.map((client) => (
        client.id === action.payload.id ? action.payload : client
      ));
    },
    clearClientsSlice: (state: IClientState) => {
      state.clients = [];
      state.count = 0;
    },
  },
});

export const {
  loadClientsSlice,
  setClientsCountSlice,
  addClientToClientsSlice,
  updateClientInClientsSlice,
  clearClientsSlice,
} = client.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getClientClientsSelector = (state: Record<string, any>): IClient[] => state.client.clients;
export const getClientCountSelector = (state: Record<string, any>): number => state.client.count;

export default client.reducer;
