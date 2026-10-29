import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import type { Action, ThunkAction } from '@reduxjs/toolkit';

import appReducer from './reducers/app.reducer';
import articleReducer from './reducers/article.reducer';
import categoryReducer from './reducers/category.reducer';
import contactReducer from './reducers/contact.reducer';
import pageReducer from './reducers/page.reducer';
import projectReducer from './reducers/project.reducer';
import roleReducer from './reducers/role.reducer';
import settingsReducer from './reducers/settings.reducer';
import userReducer from './reducers/user.reducer';

const reducers = {
  app: appReducer,
  contact: contactReducer,
  category: categoryReducer,
  user: userReducer,
  article: articleReducer,
  settings: settingsReducer,
  role: roleReducer,
  page: pageReducer,
  project: projectReducer,
};

const persistConfig = {
  key: 'root',
  storage,
  // There is an issue in the source code of redux-persist (default setTimeout does not cleaning)
  timeout: undefined,
  whitelist: ['settings'],
};

export const persistedRootReducer = persistCombineReducers(persistConfig, reducers);

interface IArg {
  initialState?: any;
}

const createStore = ({
  initialState,
}: IArg = {}) => {
  const store = configureStore({
    preloadedState: initialState,
    reducer: persistedRootReducer,
    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
    devTools: import.meta.env.NODE_ENV !== 'production',
  });

  return store;
};

const store = createStore();

const persistor = persistStore(store, null);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;

export type AppThunk = ThunkAction<void, RootState, null, Action>;
export type AppThunkAction = (dispatch: AppDispatch, getState?: () => RootState) => Promise<void> | void;

export type Store = ReturnType<typeof createStore>;
export {
  store, persistor,
};
