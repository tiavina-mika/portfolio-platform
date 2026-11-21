import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * The small mono label above a title: "SOCLE", "RÉALISATIONS". Written in sentence case, the capitals come
 * from the style.
 */
const Eyebrow = ({ children, className }: Props) => (
  <span className={cn('label-mono text-brand-text', className)}>{children}</span>
);

export default Eyebrow;
