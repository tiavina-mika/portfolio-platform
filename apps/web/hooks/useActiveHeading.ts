'use client';

import { useEffect, useState } from 'react';

import { TABLE_OF_CONTENTS_ACTIVE_OFFSET } from '@/utils/constants';

/**
 * The id of the heading the visitor is reading: the last one that has reached the top of the
 * viewport, or the first one before any has.
 */
export const useActiveHeading = (ids: string[]): string | undefined => {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  // a stable key: the array itself is a new one at every render
  const key = ids.join('|');

  useEffect(() => {
    const headings = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => !!heading);

    if (!headings.length) return;

    const handleScroll = () => {
      const reached = headings.filter(
        (heading) => heading.getBoundingClientRect().top <= TABLE_OF_CONTENTS_ACTIVE_OFFSET
      );

      setActiveId((reached.at(-1) ?? headings[0]).id);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [key]);

  return activeId ?? ids[0];
};
