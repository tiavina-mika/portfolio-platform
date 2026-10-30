import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IContentVersion, IContentVersionState } from '@/types/_core/contentVersion.type';

const initialState: IContentVersionState = {
  versions: [],
  count: 0,
};

export const contentVersion = createSlice({
  name: 'contentVersion',
  initialState,
  reducers: {
    loadContentVersionsSlice: (state: IContentVersionState, action: PayloadAction<IContentVersion[]>) => {
      state.versions = action.payload;
    },
    setContentVersionsCountSlice: (state: IContentVersionState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    clearContentVersionsSlice: (state: IContentVersionState) => {
      state.versions = [];
      state.count = 0;
    },
  },
});

export const {
  loadContentVersionsSlice,
  setContentVersionsCountSlice,
  clearContentVersionsSlice,
} = contentVersion.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getContentVersionsSelector = (
  state: Record<string, any>
): IContentVersion[] => state.contentVersion.versions;
export const getContentVersionsCountSelector = (
  state: Record<string, any>
): number => state.contentVersion.count;

export default contentVersion.reducer;
