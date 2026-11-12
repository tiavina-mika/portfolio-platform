'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const RadioGroup = ({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) => (
  <RadioGroupPrimitive.Root
    className={cn('grid gap-3', className)}
    data-slot="radio-group"
    {...props}
  />
);

const RadioGroupItem = ({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) => (
  <RadioGroupPrimitive.Item
    data-slot="radio-group-item"
    className={cn(
      `
        aspect-square size-5 shrink-0 cursor-pointer rounded-full border border-input bg-card
        transition-[border-color] duration-120 ease-out outline-none
        not-disabled:hover:border-input-hover
        disabled:cursor-not-allowed disabled:opacity-45
        aria-invalid:border-destructive
        data-[state=checked]:border-primary
      `,
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator
      className="relative flex items-center justify-center"
      data-slot="radio-group-indicator"
    >
      <span aria-hidden className="size-2.5 rounded-full bg-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);

export { RadioGroup, RadioGroupItem };
