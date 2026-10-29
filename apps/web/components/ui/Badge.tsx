import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';


import { cn } from '@/utils/app.utils';

const badgeVariants = cva(
  `
    inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors
    focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden
  `,
  {
    variants: {
      variant: {
        default:
          `
            border-transparent bg-primary text-white shadow
            hover:bg-primary/80
          `,
        secondary:
          `
            border-transparent bg-secondary text-secondary-foreground
            hover:bg-secondary/80
          `,
        destructive:
          `
            text-destructive-foreground border-transparent bg-destructive shadow
            hover:bg-destructive/80
          `,
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type IBadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean };

const Badge = ({
  className, variant, asChild = false, ...props
}: IBadgeProps) => {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      {...props}
    />
  );
};

export { Badge, badgeVariants };
