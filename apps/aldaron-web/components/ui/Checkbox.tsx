'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  /**
   * The text of the choice. With a `label` or a `description`, the whole row (44px high) is the
   * click zone
   */
  label?: ReactNode;
  description?: ReactNode;
  /**
   * @default false
   */
  invalid?: boolean;
};

const BOX_CLASSES = `
  group/box flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border
  border-input bg-card p-0 text-primary-foreground transition-[background-color,border-color] duration-120
  ease-out
  not-disabled:hover:border-[color-mix(in_oklab,var(--input),var(--foreground)_35%)]
  disabled:cursor-not-allowed disabled:opacity-45
  aria-invalid:border-destructive
  data-[state=checked]:border-primary data-[state=checked]:bg-primary
  data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary
`;

/**
 * A choice that is sent with the rest of a form. Pass `checked="indeterminate"` for a "select all"
 * box where only some of the items are checked.
 */
const Checkbox = ({
  className, label, description, invalid = false, ...props
}: CheckboxProps) => {
  const box = (
    <CheckboxPrimitive.Root
      aria-invalid={invalid || props['aria-invalid']}
      data-slot="checkbox"
      className={cn(
        BOX_CLASSES,
        // in a row, the row carries the dimmed state of the whole choice
        (label || description) && `
          not-disabled:group-hover/check:border-[color-mix(in_oklab,var(--input),var(--foreground)_35%)]
          disabled:opacity-100
        `,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-current"
        data-slot="checkbox-indicator"
      >
        <Check
          aria-hidden
          className="group-data-[state=indeterminate]/box:hidden"
          size={14}
          strokeWidth={2}
        />
        <Minus
          aria-hidden
          size={14}
          strokeWidth={2}
          className={`
            hidden
            group-data-[state=indeterminate]/box:block
          `}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label && !description) return box;

  return (
    <label
      data-slot="checkbox-row"
      className={`
        group/check inline-flex min-h-11 cursor-pointer items-start gap-2.5 py-3 text-[15px] leading-5
        text-foreground
        has-disabled:cursor-not-allowed has-disabled:opacity-45
      `}
    >
      {box}
      <span className="grid gap-0.5">
        {label && <span>{label}</span>}
        {description && (
          <span className="text-[13px] leading-4.5 text-muted-foreground">{description}</span>
        )}
      </span>
    </label>
  );
};

export { Checkbox };
