import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IUserBlockState, IUserBlocksState, IUserBlockResult } from '@/types/_core/userBlock.type';

const initialState: IUserBlocksState = {
  blocks: {},
};

/*
 * a block that was never asked for reads as one on its way: the page asks for every block as it
 * opens, so the only moment a block has no entry yet is the render before that request
 */
const PENDING_BLOCK: IUserBlockState = {
  items: [],
  count: 0,
  loading: true,
  error: false,
};

/**
 * The lists the user detail page reads apart from the account itself — its payments, its reviews,
 * its tickets, its vehicles… — one entry per block, keyed by the block's name. Each block is read on
 * its own and can be on its way or have failed while the others are drawn, so each one carries its
 * own state rather than sharing the page's.
 *
 * The rows are kept loosely typed here and typed back by the block reading them: the slice is
 * shared by blocks of every domain, and the core cannot name the row types of a domain.
 */
export const userBlock = createSlice({
  name: 'userBlock',
  initialState,
  reducers: {
    startUserBlockSlice: (
      state: IUserBlocksState,
      action: PayloadAction<{ key: string; userId: string }>
    ) => {
      const { key, userId } = action.payload;
      const current = state.blocks[key];

      // the rows already on screen stay there while they are read again — for the same account only
      state.blocks[key] = {
        ...(current?.userId === userId ? current : PENDING_BLOCK),
        userId,
        loading: true,
        error: false,
      };
    },
    loadUserBlockSlice: (
      state: IUserBlocksState,
      action: PayloadAction<{ key: string; userId: string } & IUserBlockResult<unknown, unknown>>
    ) => {
      const {
        key, userId, items, count, extra,
      } = action.payload;

      state.blocks[key] = {
        userId,
        items,
        count,
        extra,
        loading: false,
        error: false,
      };
    },
    failUserBlockSlice: (state: IUserBlocksState, action: PayloadAction<{ key: string; userId: string }>) => {
      const { key, userId } = action.payload;

      state.blocks[key] = {
        ...(state.blocks[key] ?? PENDING_BLOCK),
        userId,
        loading: false,
        error: true,
      };
    },
    // the next account opened must not show, even for a render, the lists of the one before it
    clearUserBlocksSlice: (state: IUserBlocksState) => {
      state.blocks = {};
    },
  },
});

export const {
  startUserBlockSlice,
  loadUserBlockSlice,
  failUserBlockSlice,
  clearUserBlocksSlice,
} = userBlock.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getUserBlockSelector = <TItem, TExtra = undefined>(key: string) => (
  state: Record<string, any>
): IUserBlockState<TItem, TExtra> => (
  (state.userBlock.blocks[key] ?? PENDING_BLOCK) as IUserBlockState<TItem, TExtra>
);

export default userBlock.reducer;
