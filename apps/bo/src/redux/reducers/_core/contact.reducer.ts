import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  IContact, IContactState, IContactSummary, ITicketContext,
} from '@/types/_core/contact.type';
import { ITicketMessage } from '@/types/_core/ticket-message.type';
import { IUser } from '@/types/_core/user.type';

const initialState: IContactState = {
  loading: false,
  contact: null,
  contacts: [],
  count: 0,
  summary: null,
  ticketContext: null,
  ticketContextLoading: false,
  agents: [],
  ticketMessages: [],
  ticketMessagesCount: 0,
  ticketMessagesLoading: false,
};

export const contact = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    loadContactsSlice: (state: IContactState, action: PayloadAction<IContact[]>) => {
      state.contacts = action.payload;
    },
    loadContactSlice: (state: IContactState, action: PayloadAction<IContact>) => {
      state.contact = action.payload;
    },
    loadContactSummarySlice: (state: IContactState, action: PayloadAction<IContactSummary>) => {
      state.summary = action.payload;
    },
    loadTicketContextSlice: (state: IContactState, action: PayloadAction<ITicketContext>) => {
      state.ticketContext = action.payload;
    },
    setTicketContextLoadingSlice: (state: IContactState, action: PayloadAction<boolean>) => {
      state.ticketContextLoading = action.payload;
    },
    clearTicketContextSlice: (state: IContactState) => {
      state.ticketContext = null;
    },
    loadTicketAgentsSlice: (state: IContactState, action: PayloadAction<IUser[]>) => {
      state.agents = action.payload;
    },
    clearTicketAgentsSlice: (state: IContactState) => {
      state.agents = [];
    },
    clearContactSummarySlice: (state: IContactState) => {
      state.summary = null;
    },
    clearContactSlice: (state: IContactState) => {
      state.contact = null;
    },
    loadTicketMessagesSlice: (state: IContactState, action: PayloadAction<ITicketMessage[]>) => {
      state.ticketMessages = action.payload;
    },
    appendTicketMessageSlice: (state: IContactState, action: PayloadAction<ITicketMessage>) => {
      state.ticketMessages = [...state.ticketMessages, action.payload];
      state.ticketMessagesCount += 1;
    },
    setTicketMessagesCountSlice: (state: IContactState, action: PayloadAction<number>) => {
      state.ticketMessagesCount = action.payload;
    },
    setTicketMessagesLoadingSlice: (state: IContactState, action: PayloadAction<boolean>) => {
      state.ticketMessagesLoading = action.payload;
    },
    clearTicketMessagesSlice: (state: IContactState) => {
      state.ticketMessages = [];
      state.ticketMessagesCount = 0;
    },
    setContactsCountSlice: (state: IContactState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    updateContactInListSlice: (state: IContactState, action: PayloadAction<IContact>) => {
      const index = state.contacts.findIndex(contact => contact.id === action.payload.id);

      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
    clearContactsSlice: (state: IContactState) => {
      state.contacts = [];
    },
    setContactLoadingSlice: (state: IContactState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearContactCountSlice: (state: IContactState) => {
      state.count = 0;
    },
    deleteContactFromContactsSlice: (state: IContactState, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter(prevContact => prevContact.id !== action.payload);
    },
    deleteContactsSlice: (state: IContactState, action: PayloadAction<string[]>) => {
      const newContacts = state.contacts.filter(
        prevContact => !action.payload.includes(prevContact.id)
      );

      state.contacts = newContacts;
    },
  },
});

export const {
  setContactLoadingSlice,
  clearContactSlice,
  loadContactSlice,
  loadContactsSlice,
  loadContactSummarySlice,
  clearContactSummarySlice,
  clearTicketAgentsSlice,
  loadTicketContextSlice,
  setTicketContextLoadingSlice,
  clearTicketContextSlice,
  loadTicketAgentsSlice,
  setContactsCountSlice,
  clearContactsSlice,
  clearContactCountSlice,
  deleteContactFromContactsSlice,
  deleteContactsSlice,
  updateContactInListSlice,
  loadTicketMessagesSlice,
  appendTicketMessageSlice,
  setTicketMessagesCountSlice,
  setTicketMessagesLoadingSlice,
  clearTicketMessagesSlice,
} = contact.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getContactSelector = (state: Record<string, any>): IContactState => state.contact;
export const getContactLoadingSelector = (state: Record<string, any>): boolean => state.contact.loading;
export const getContactContactSelector = (state: Record<string, any>): IContact => state.contact.contact;
export const getContactContactsSelector = (
  state: Record<string, any>
): IContact[] => state.contact.contacts;
export const getContactCountSelector = (state: Record<string, any>): number => state.contact.count;
export const getContactTicketMessagesSelector = (
  state: Record<string, any>
): ITicketMessage[] => state.contact.ticketMessages;
export const getContactTicketMessagesCountSelector = (
  state: Record<string, any>
): number => state.contact.ticketMessagesCount;
export const getContactTicketMessagesLoadingSelector = (
  state: Record<string, any>
): boolean => state.contact.ticketMessagesLoading;
export const getContactSummarySelector = (
  state: Record<string, any>
): IContactSummary | null => state.contact.summary;
export const getContactTicketContextSelector = (
  state: Record<string, any>
): ITicketContext | null => state.contact.ticketContext;
export const getContactTicketContextLoadingSelector = (
  state: Record<string, any>
): boolean => state.contact.ticketContextLoading;
export const getContactAgentsSelector = (state: Record<string, any>): IUser[] => state.contact.agents;

export default contact.reducer;
