import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IUser, IUserState } from '@/types/user.type';

const initialState: IUserState = {
  loading: false,
  user: null,
  users: [],
  count: 0,
  search: null,
  filters: null,
};

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loadUsersSlice: (state: IUserState, action: PayloadAction<IUser[]>) => {
      state.users = action.payload;
    },
    loadUserSlice: (state: IUserState, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    setUsersCountSlice: (state: IUserState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setUserSearchSlice: (state: IUserState, action: PayloadAction<any>) => {
      state.search = {
        ...state.search,
        ...action.payload,
      };
    },
    clearUserSearchSlice: (state: IUserState) => {
      state.search = null;
    },
    clearUserSlice: (state: IUserState) => {
      state.user = null;
    },
    clearUsersSlice: (state: IUserState) => {
      state.users = [];
    },
    setUserFiltersSlice: (state: IUserState, action: PayloadAction<Record<string, string | boolean>>) => {
      if (state.filters) {
        state.filters = { ...state.filters, ...action.payload };
        return;
      }

      state.filters = action.payload;
    },
    updateUsersByUserSlice: (state: IUserState, action: PayloadAction<IUser>) => {
      const newUsers = [];

      for (const user of state.users) {
        if (user.id === action.payload.id) {
        // push the updated user to the first line
          newUsers.unshift({
            ...user,
            ...action.payload,
          });
        }
        else {
          newUsers.push(user);
        }
      }

      state.users = newUsers;
      state.user = action.payload;
    },
    updateUsersByUsersSlice: (state: IUserState, action: PayloadAction<IUser[]>) => {
      const newUsers = [];

      for (const user of state.users) {
        const currentUser = action.payload.find((updatedUser: IUser) => updatedUser.id === user.id);

        if (currentUser) {
          // push the updated users to the first line
          newUsers.unshift({
            ...user,
            ...currentUser,
          });
        }
        else {
          newUsers.push(user);
        }
      }

      state.users = newUsers;
    },
    deleteUsersSlice: (state: IUserState, action: PayloadAction<string>) => {
      const newUsers = state.users.filter((user: IUser) => user.id !== action.payload);

      state.users = newUsers;
      state.user = null;
    },
    setUserLoadingSlice: (state: IUserState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearUserCountSlice: (state: IUserState) => {
      state.count = 0;
    },
  },
});

export const {
  setUserLoadingSlice,
  clearUserSlice,
  loadUserSlice,
  loadUsersSlice,
  setUsersCountSlice,
  updateUsersByUserSlice,
  updateUsersByUsersSlice,
  clearUsersSlice,
  setUserSearchSlice,
  clearUserSearchSlice,
  clearUserCountSlice,
  deleteUsersSlice,
  setUserFiltersSlice,
} = user.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getUserSelector = (state: Record<string, any>): IUserState => state.user;
export const getUserUserSelector = (state: Record<string, any>): IUser => state.user.user;
export const getUserLoadingSelector = (state: Record<string, any>): boolean => state.user.loading;
export const getUserUsersSelector = (state: Record<string, any>): IUser[] => state.user.users;
export const getUserCountSelector = (state: Record<string, any>): number => state.user.count;
export const getUserFiltersSelector = (
  state: Record<string, any>
): Record<string, string | boolean> => state.user.filters;

export default user.reducer;
