'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

/**
 * A setting that applies at once. In a form, where the choice is sent with the rest, use a `Checkbox`.
 */
const Switch = ({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) => (
  <SwitchPrimitive.Root
    data-slot="switch"
    className={cn(
      `
        inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent
        bg-input transition-colors duration-180 ease-out
        not-disabled:hover:bg-input-hover
        disabled:cursor-not-allowed disabled:opacity-45
        data-[state=checked]:bg-primary data-[state=checked]:not-disabled:hover:bg-primary-hover
      `,
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={`
        block size-4.5 translate-x-0.5 rounded-full bg-card shadow-sm transition-transform duration-180
        ease-out
        data-[state=checked]:translate-x-4.5 data-[state=checked]:bg-primary-foreground
      `}
    />
  </SwitchPrimitive.Root>
);

export { Switch };
