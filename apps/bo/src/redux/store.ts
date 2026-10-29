import { configureStore } from '@reduxjs/toolkit';
import pick from 'lodash/pick';
import { persistStore, persistCombineReducers } from 'redux-persist';

import type { Action, ThunkAction } from '@reduxjs/toolkit';
import type { WebStorage } from 'redux-persist';

import appReducer, { clearSessionDataSlice } from '@/redux/reducers/_core/app.reducer';
import articleReducer from '@/redux/reducers/_core/article.reducer';
import auditLogReducer from '@/redux/reducers/_core/auditLog.reducer';
import categoryReducer from '@/redux/reducers/_core/category.reducer';
import contactReducer from '@/redux/reducers/_core/contact.reducer';
import contentVersionReducer from '@/redux/reducers/_core/contentVersion.reducer';
import dashboardReducer from '@/redux/reducers/_core/dashboard.reducer';
import financeReducer from '@/redux/reducers/_core/finance.reducer';
import globalSearchReducer from '@/redux/reducers/_core/globalSearch.reducer';
import impersonationReducer from '@/redux/reducers/_core/impersonation.reducer';
import notificationReducer from '@/redux/reducers/_core/notification.reducer';
import pageReducer from '@/redux/reducers/_core/page.reducer';
import paymentReducer, { paymentLedgerReducer } from '@/redux/reducers/_core/payment.reducer';
import reportReducer from '@/redux/reducers/_core/report.reducer';
import roleReducer from '@/redux/reducers/_core/role.reducer';
import roleAuditLogReducer from '@/redux/reducers/_core/roleAuditLog.reducer';
import settingsReducer from '@/redux/reducers/_core/settings.reducer';
import statisticsReducer from '@/redux/reducers/_core/statistics.reducer';
import userReducer from '@/redux/reducers/_core/user.reducer';
import userBlockReducer from '@/redux/reducers/_core/userBlock.reducer';
import userSessionReducer from '@/redux/reducers/_core/userSession.reducer';
import projectReducer from '@/redux/reducers/_domain/project.reducer';

/*
 * Bypasses 'redux-persist/lib/storage', whose deep CJS subpath import breaks under
 * Vite's esbuild interop (storage.getItem/setItem end up undefined at runtime).
 */
const storage: WebStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const reducers = {
  app: appReducer,
  dashboard: dashboardReducer,
  contact: contactReducer,
  category: categoryReducer,
  user: userReducer,
  userBlock: userBlockReducer,
  userSession: userSessionReducer,
  article: articleReducer,
  auditLog: auditLogReducer,
  contentVersion: contentVersionReducer,
  settings: settingsReducer,
  role: roleReducer,
  roleAuditLog: roleAuditLogReducer,
  page: pageReducer,
  project: projectReducer,
  notification: notificationReducer,
  payment: paymentReducer,
  paymentLedger: paymentLedgerReducer,
  report: reportReducer,
  globalSearch: globalSearchReducer,
  impersonation: impersonationReducer,
  statistics: statisticsReducer,
  finance: financeReducer,
};

const persistConfig = {
  key: 'root',
  storage,
  // There is an issue in the source code of redux-persist (default setTimeout does not cleaning)
  timeout: undefined,
  whitelist: ['settings'],
};

export const persistedRootReducer = persistCombineReducers(persistConfig, reducers);

/*
 * List and figure pages keep what they read once left, so a return visit shows it while it is read
 * again. That data then outlives the page that read it, and must not outlive the account: whoever
 * signs in next in this tab would see it. On logout every slice goes back to its initial state
 * except `settings` (the reader's own preferences, persisted) and `app` (the shell, which the logout
 * resets field by field — its loading counter is mid-count when this runs).
 */
const rootReducer: typeof persistedRootReducer = (state, action) => {
  if (state && clearSessionDataSlice.match(action)) {
    // `_persist` is redux-persist's own bookkeeping: without it the persisted slice stops saving
    const keptState = pick(state, ['settings', 'app', '_persist']);

    return persistedRootReducer(keptState as typeof state, action);
  }

  return persistedRootReducer(state, action);
};

interface IArg {
  initialState?: any;
}

/*
 * Exported so Storybook can build its own store: the shared `store` below is persisted to
 * localStorage, and a story toolbar that writes the theme into a persisted store would keep
 * fighting the rehydrated value on every reload.
 */
export const createStore = ({
  initialState,
}: IArg = {}) => {
  const store = configureStore({
    preloadedState: initialState,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
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
// Promise<unknown> covers actionWithLoader's thunks, which resolve with the caught error (or undefined) for callers to check
export type AppThunkAction =
  (dispatch: AppDispatch, getState?: () => RootState) => Promise<void> | Promise<unknown> | void;

export type Store = ReturnType<typeof createStore>;
export {
  store, persistor,
};
