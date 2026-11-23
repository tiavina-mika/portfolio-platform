import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IQuote, IQuoteState } from '@/types/_domain/quote.type';

const initialState: IQuoteState = {
  quotes: [],
  count: 0,
};

export const quote = createSlice({
  name: 'quote',
  initialState,
  reducers: {
    loadQuotesSlice: (state: IQuoteState, action: PayloadAction<IQuote[]>) => {
      state.quotes = action.payload;
    },
    setQuotesCountSlice: (state: IQuoteState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    // a quote just created leads the list, where the reader who typed it expects to find it
    addQuoteToQuotesSlice: (state: IQuoteState, action: PayloadAction<IQuote>) => {
      state.quotes = [action.payload, ...state.quotes];
      state.count += 1;
    },
    updateQuoteInQuotesSlice: (state: IQuoteState, action: PayloadAction<IQuote>) => {
      state.quotes = state.quotes.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    clearQuotesSlice: (state: IQuoteState) => {
      state.quotes = [];
      state.count = 0;
    },
  },
});

export const {
  loadQuotesSlice,
  setQuotesCountSlice,
  addQuoteToQuotesSlice,
  updateQuoteInQuotesSlice,
  clearQuotesSlice,
} = quote.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getQuoteQuotesSelector = (state: Record<string, any>): IQuote[] => state.quote.quotes;
export const getQuoteCountSelector = (state: Record<string, any>): number => state.quote.count;

export default quote.reducer;
