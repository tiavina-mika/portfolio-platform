'use client';

import { ReactNode } from 'react';

import { useNavbarScroll } from '@/hooks/useNavbarScroll';
import { cn } from '@/utils/app.utils';

type Props = {
  children: ReactNode;
  className?: string;
};

const FixedNavBarDesktop = ({ children, className }: Props) => {
  const { isFixed, ref, height } = useNavbarScroll();

  return (
    <>
      <nav
        ref={ref}
        className={cn(
          className,
          isFixed ? 'fixed top-0 right-0 left-0 z-50 shadow-md' : '-top-24'
        )}
        style={{
          transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s',
        }}
      >
        {children}
      </nav>
      {/*
       * when the navbar is fixed, the content will be pushed up
       * so we need to add a block with the same height as the navbar
       */}
      <div
        className={isFixed ? 'block' : 'hidden'}
        style={{ height: isFixed ? height : 'inherit', width: '100%' }}
      />
    </>
  );
};

export default FixedNavBarDesktop;
