import { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

import { buttonVariants } from './Button';

type Props = {
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * A square ghost button holding one icon, with its 44px touch target. An icon does not name the button:
 * pass an `aria-label` or a `sr-only` text.
 */
const IconButton = ({ children, className, ...props }: Props) => (
  <button
    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), className)}
    type="button"
    {...props}
  >
    {children}
  </button>
);

export default IconButton;
