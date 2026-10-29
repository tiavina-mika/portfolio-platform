'use client';

import { RefObject, useEffect, useState } from 'react';

/*
 * - static: rendered as it is, no entrance (the server render, an element already reached by the scroll
 *   when the page hydrates, a browser without IntersectionObserver, prefers-reduced-motion, or the reveal
 *   is turned off)
 * - hidden: below the fold, waiting to enter the viewport
 * - revealed: has entered the viewport, its entrance animation plays (once)
 */
export type RevealState = 'static' | 'hidden' | 'revealed';

type Options = {
  /**
   * Share of the element that must be visible to reveal it, from 0 (one pixel) to 1 (all of it)
   * @default 0
   */
  threshold?: number;
  /**
   * When false the element stays static
   * @default true
   */
  enabled?: boolean;
};

/**
 * Drives a scroll entrance that never hides content for nothing: the server renders the content visible
 * (it stays readable without JavaScript), an element already on screen at hydration is left alone (no
 * flash), and only an element below the fold is hidden until it enters the viewport.
 */
export const useRevealOnView = <T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0, enabled = true }: Options = {}
): RevealState => {
  const [state, setState] = useState<RevealState>('static');

  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element || typeof IntersectionObserver === 'undefined') return;
    // no entrance at all for a reader who asked the device for less motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let isFirstCall = true;

    // the observer always reports the element once as soon as it starts observing it
    const observer = new IntersectionObserver(([entry]) => {
      if (isFirstCall) {
        isFirstCall = false;
        const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;

        // already reached by the scroll (on screen, or above it): the reader has seen it, it stays as it is
        if (entry.isIntersecting || entry.boundingClientRect.top < viewportHeight) {
          observer.disconnect();
          return;
        }

        setState('hidden');
        return;
      }

      if (!entry.isIntersecting) return;

      setState('revealed');
      observer.disconnect();
    }, { threshold });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, threshold, enabled]);

  return enabled ? state : 'static';
};
