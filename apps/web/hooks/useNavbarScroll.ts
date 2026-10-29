'use client';

import {
  RefObject, useLayoutEffect, useRef, useState,
} from 'react';

type SSRRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
};
/**
 * default value for SSR (when document is not available)
 */
const emptySSRRect: SSRRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
};

type Output = {
  isFixed: boolean;
  ref: RefObject<HTMLDivElement | null>;
  height: number | 'inherit';
};
/**
 * Hook to know when the navbar should be fixed
 * @see https://gist.github.com/joshuacerbito/ea318a6a7ca4336e9fadb9ae5bbb87f4
 */
export const useNavbarScroll = (): Output => {
  const divToFixedRef = useRef(null);
  const [bodyOffset, setBodyOffset] = useState<DOMRect | SSRRect>(
    typeof window === 'undefined' || !window.document
      ? emptySSRRect
      : document.body.getBoundingClientRect()
  );

  useLayoutEffect(() => {
    const listener = () => {
      setBodyOffset(document.body.getBoundingClientRect());
    };

    window.addEventListener('scroll', listener);
    return () => {
      window.removeEventListener('scroll', listener);
    };
  }, []);

  return {
    // if the navbar position is outside the viewport
    isFixed:
      typeof window === 'undefined'
        ? false
        : -bodyOffset.top > window.innerHeight,
    // ref to the navbar to fixed
    ref: divToFixedRef,
    // height of the navbar
    height:
      (divToFixedRef.current as HTMLDivElement | null)?.offsetHeight ||
      'inherit',
  };
};
