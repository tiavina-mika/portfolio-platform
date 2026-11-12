import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-pulse rounded-sm bg-muted', className)}
      {...props}
    />
  );
};

export { Skeleton };
