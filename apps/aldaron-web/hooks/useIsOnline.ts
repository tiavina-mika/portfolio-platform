'use client';

import { useSyncExternalStore } from 'react';

const subscribeToConnection = (onChange: () => void) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);

  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

const getIsOnline = () => navigator.onLine;
// the server has no connection to read: render the online state, the client corrects it on hydration
const getServerIsOnline = () => true;

/**
 * Whether the device has a network connection, updated live when it drops or comes back
 */
export const useIsOnline = () => useSyncExternalStore(
  subscribeToConnection,
  getIsOnline,
  getServerIsOnline
);
