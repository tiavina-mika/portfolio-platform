'use client';

import { useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

import { cn } from '@/utils/app.utils';

// share of the block that must be visible before it is revealed
const VISIBLE_AMOUNT = 0.25;

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Sets `data-revealed="true"` once the block enters the viewport (only once), so its children can
 * animate in with `group-data-[revealed=true]/reveal:` classes. The children stay server-rendered
 */
const RevealOnView = ({ children, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: VISIBLE_AMOUNT });

  return (
    <div className={cn('group/reveal', className)} data-revealed={isInView} ref={ref}>
      {children}
    </div>
  );
};

export default RevealOnView;
