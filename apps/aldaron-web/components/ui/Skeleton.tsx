import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        `
          bg-default/10
          dark:bg-dark-100/10
        `,
        'animate-pulse rounded-xs bg-accent', className)}
      {...props}
    />
  );
};

export { Skeleton };
