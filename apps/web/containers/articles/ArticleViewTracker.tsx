'use client';

import { useEffect, useRef } from 'react';

import { incrementArticleViewCount } from '@/server/mutations/app.mutation';

export const VIEWED_ARTICLES_STORAGE_KEY = 'viewed-articles';

type Props = {
  /**
   * the id of the article whose view counter is incremented
   * @example '1234567890'
   */
  id: string;
};

/**
 * counts one view per article per browsing session. The count can't be done while rendering the
 * article page: that page is prerendered at build time, so its render runs once for everybody and
 * not once per visitor — a real visit is only observable from the browser.
 *
 * The already-viewed ids are kept in sessionStorage rather than localStorage: reloading or
 * navigating back within the same visit must not count twice, but a visitor coming back tomorrow
 * is a new view.
 */
const ArticleViewTracker = ({ id }: Props) => {
  // React runs effects twice in dev strict mode — this keeps the visit to a single count
  const hasCountedRef = useRef(false);

  useEffect(() => {
    if (hasCountedRef.current) return;
    hasCountedRef.current = true;

    const countView = async () => {
      let viewedIds: string[] = [];

      /*
       * sessionStorage throws instead of returning null in a few browser configurations
       * (private mode with site data blocked) — a blocked storage must not break the page
       */
      try {
        viewedIds = JSON.parse(sessionStorage.getItem(VIEWED_ARTICLES_STORAGE_KEY) || '[]');
      }
      catch {
        viewedIds = [];
      }

      if (viewedIds.includes(id)) return;

      await incrementArticleViewCount(id);

      // a failed write loses only the "already counted" memory — the view itself is counted
      try {
        sessionStorage.setItem(VIEWED_ARTICLES_STORAGE_KEY, JSON.stringify([...viewedIds, id]));
      }
      catch { /* nothing to recover from here */ }
    };

    countView();
  }, [id]);

  return null;
};

export default ArticleViewTracker;
