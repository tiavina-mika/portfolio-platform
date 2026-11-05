'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const Checkbox = ({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      `
        peer size-5 shrink-0 cursor-pointer rounded-sm border border-input bg-card
        transition-[background-color,border-color] duration-120 ease-out
        not-disabled:hover:border-input-hover
        disabled:cursor-not-allowed disabled:opacity-45
        aria-invalid:border-destructive
        data-[state=checked]:border-primary data-[state=checked]:bg-primary
        data-[state=checked]:text-primary-foreground
      `,
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className="flex items-center justify-center text-current"
      data-slot="checkbox-indicator"
    >
      <Check aria-hidden size={14} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export { Checkbox };
