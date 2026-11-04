import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IGlobalSearchResults, IGlobalSearchState } from '@/types/_core/globalSearch.type';

const initialState: IGlobalSearchState = {
  results: {},
  loading: false,
};

export const globalSearch = createSlice({
  name: 'globalSearch',
  initialState,
  reducers: {
    loadGlobalSearchResultsSlice: (
      state: IGlobalSearchState,
      action: PayloadAction<IGlobalSearchResults>
    ) => {
      state.results = action.payload;
    },
    setGlobalSearchLoadingSlice: (state: IGlobalSearchState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearGlobalSearchResultsSlice: (state: IGlobalSearchState) => {
      state.results = {};
    },
  },
});

export const {
  loadGlobalSearchResultsSlice,
  setGlobalSearchLoadingSlice,
  clearGlobalSearchResultsSlice,
} = globalSearch.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getGlobalSearchResultsSelector = (
  state: Record<string, any>
): IGlobalSearchResults => state.globalSearch.results;
export const getGlobalSearchLoadingSelector = (
  state: Record<string, any>
): boolean => state.globalSearch.loading;

export default globalSearch.reducer;
