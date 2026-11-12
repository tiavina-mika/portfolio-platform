'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root> & {
  /**
   * The name of the setting. With a `label` or a `description`, the whole row (44px high) is the
   * click zone
   */
  label?: ReactNode;
  description?: ReactNode;
};

/**
 * A setting that applies at once. In a form, where the choice is sent with the rest, use a `Checkbox`.
 */
const Switch = ({
  className, label, description, ...props
}: SwitchProps) => {
  const track = (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        `
          inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent
          bg-input p-0 transition-colors duration-180 ease-out
          not-disabled:hover:bg-[color-mix(in_oklab,var(--input),var(--foreground)_22%)]
          disabled:cursor-not-allowed disabled:opacity-45
          data-[state=checked]:bg-primary data-[state=checked]:not-disabled:hover:bg-primary-hover
        `,
        // in a row, the row carries the dimmed state of the whole setting
        (label || description) && `
          not-disabled:group-hover/switch:bg-[color-mix(in_oklab,var(--input),var(--foreground)_22%)]
          disabled:opacity-100
          data-[state=checked]:not-disabled:group-hover/switch:bg-primary-hover
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

  if (!label && !description) return track;

  return (
    <label
      data-slot="switch-row"
      className={`
        group/switch inline-flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-foreground
        has-disabled:cursor-not-allowed has-disabled:opacity-45
      `}
    >
      {track}
      <span>
        {label}
        {description && <span className="block text-[13px] text-muted-foreground">{description}</span>}
      </span>
    </label>
  );
};

export { Switch };
