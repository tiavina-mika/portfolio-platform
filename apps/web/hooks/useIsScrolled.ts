'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};

const getSnapshot = () => window.scrollY > 0;

// the server cannot know the scroll position: the page always renders at the top
const getServerSnapshot = () => false;

/**
 * True once the page is scrolled down. Reads the scroll position as an external store, so the
 * first client render matches the server render and no effect has to sync it afterwards.
 */
export const useIsScrolled = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
