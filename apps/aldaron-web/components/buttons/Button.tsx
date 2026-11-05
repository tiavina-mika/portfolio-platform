import { cva } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

import { ButtonSize, ButtonVariantType } from '@/types/component.type';
import { cn } from '@/utils/app.utils';

export const buttonVariants = cva(
  `
    inline-flex cursor-pointer items-center justify-center rounded-md border border-transparent font-medium
    whitespace-nowrap no-underline transition-[background-color,border-color,color,translate] duration-120
    ease-out select-none
    not-disabled:active:translate-y-px
    disabled:cursor-not-allowed disabled:opacity-45
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-primary text-primary-foreground
          not-disabled:hover:bg-primary-hover
        `,
        brand: `
          bg-brand text-brand-foreground
          not-disabled:hover:bg-brand-hover
        `,
        secondary: `
          bg-secondary text-secondary-foreground
          not-disabled:hover:bg-secondary-hover
        `,
        outline: `
          border-input bg-transparent text-foreground
          not-disabled:hover:border-input-hover not-disabled:hover:bg-muted
        `,
        ghost: `
          bg-transparent text-foreground
          not-disabled:hover:bg-muted
        `,
        destructive: `
          bg-destructive text-destructive-foreground
          not-disabled:hover:bg-destructive-hover
        `,
        link: `
          bg-transparent text-brand-text underline decoration-1 underline-offset-3
          not-disabled:hover:text-foreground
        `,
      },
      size: {
        sm: 'h-9 gap-1.5 px-3 text-sm',
        md: 'h-11 gap-2 px-4.5 text-[15px]',
        lg: 'h-13 gap-2 px-6 text-base',
        icon: 'size-11 p-0',
      },
    },
    compoundVariants: [
      // a link reads as text in a sentence: it takes the height and the padding of the text
      { variant: 'link', class: 'h-auto px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonProps = {
  /**
   * `primary` is the main action of a screen, `brand` the main call of a marketing page (one per
   * screen); `outline` and `ghost` are for everything else
   * @default primary
   */
  variant?: ButtonVariantType;
  /**
   * `icon` is square: it needs an `aria-label`
   * @default md
   */
  size?: ButtonSize;
  /**
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Disables the button and shows a spinner in place of `iconLeft`
   * @default false
   */
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  children,
  className,
  ...props
}: ButtonProps) => (
  <button
    aria-busy={loading || undefined}
    className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
    disabled={disabled || loading}
    type="button"
    {...props}
  >
    {loading
      ? <LoaderCircle aria-hidden className="animate-spin" size={size === 'sm' ? 14 : 16} />
      : iconLeft}
    {children}
    {iconRight}
  </button>
);

export default Button;
