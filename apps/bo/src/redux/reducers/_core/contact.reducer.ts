import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IContact, IContactState } from '@/types/_core/contact.type';

const initialState: IContactState = {
  loading: false,
  contact: null,
  contacts: [],
  count: 0,
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
    clearContactSlice: (state: IContactState) => {
      state.contact = null;
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
  setContactsCountSlice,
  clearContactsSlice,
  clearContactCountSlice,
  deleteContactFromContactsSlice,
  deleteContactsSlice,
  updateContactInListSlice,
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

export default contact.reducer;
