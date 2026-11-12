import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const badgeVariants = cva(
  `
    inline-flex items-center gap-1.5 rounded-full border border-transparent leading-none font-medium
    whitespace-nowrap
  `,
  {
    variants: {
      variant: {
        default: 'bg-muted text-foreground',
        primary: 'bg-primary text-primary-foreground',
        brand: 'bg-accent text-accent-foreground',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        destructive: 'bg-danger-subtle text-destructive-text',
        info: 'bg-info-subtle text-info',
        outline: 'border-input bg-transparent text-foreground',
      },
      size: {
        md: 'h-6 px-2.25 text-xs',
        sm: 'h-5 px-1.75 text-[11px]',
      },
      isMono: {
        true: 'font-mono tracking-[.02em]',
      },
      isSquare: {
        true: 'rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants> & {
  asChild?: boolean;
  /**
   * A status dot before the text: the status is still told by the text, never by the color alone
   * @default false
   */
  hasDot?: boolean;
};

const Badge = ({
  className,
  variant,
  size,
  isMono,
  isSquare,
  asChild = false,
  hasDot = false,
  children,
  ...props
}: BadgeProps) => {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      className={cn(badgeVariants({ variant, size, isMono, isSquare }), className)}
      data-slot="badge"
      {...props}
    >
      {hasDot && <span aria-hidden className="size-1.5 flex-none rounded-full bg-current" />}
      {children}
    </Comp>
  );
};

export { Badge, badgeVariants };
