import type { Storage } from 'redux-persist';

/*
 * redux-persist's own `lib/storage` is CommonJS: Vite's interop hands back `{ default: storage }`
 * instead of the storage, so `getItem` is undefined. A thin wrapper over localStorage avoids it.
 */
export const persistStorage: Storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};
