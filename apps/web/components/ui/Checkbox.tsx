'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

import NextIcon from '../NextIcon';

const Checkbox = ({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      `
        peer h-4 w-4 shrink-0 rounded-xs border border-primary shadow
        focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden
        disabled:cursor-not-allowed disabled:opacity-50
        data-[state=checked]:bg-primary-light data-[state=checked]:text-primary-foreground
      `,
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
      data-slot="checkbox-indicator"
    >
      <NextIcon size={9} src="/icons/check.svg" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export { Checkbox };
