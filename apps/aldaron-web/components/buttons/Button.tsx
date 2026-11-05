import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, ReactNode } from 'react';


import {
  ButtonPaletteColor,
  ButtonSize,
  ButtonVariantType,
} from '@/types/component.type';
import { cn } from '@/utils/app.utils';

export const buttonVariants = cva('rounded-md font-primary', {
  variants: {
    variant: {
      contained: `
        text-white
        hover:opacity-90
        dark:bg-default
      `,
      outlined: 'border border-solid',
      text: `
        bg-transparent
        hover:bg-gray-50
        dark:hover:bg-transparent dark:hover:opacity-70
      `,
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      error: '',
      info: '',
      warning: '',
      default: '',
    },
    size: {
      sm: 'px-2 py-1',
      md: 'px-3 py-2',
      lg: 'px-4 py-2',
    },
    disabled: {
      true: `
        cursor-not-allowed bg-gray-200!
        dark:bg-gray-700
      `,
      false: 'cursor-pointer',
    },
  },
  compoundVariants: [
    {
      variant: 'contained',
      color: 'primary',
      class: 'bg-primary',
    },
    {
      variant: 'contained',
      color: 'secondary',
      class: 'bg-secondary',
    },
    {
      variant: 'contained',
      color: 'error',
      class: 'bg-error',
    },
    {
      variant: 'contained',
      color: 'success',
      class: 'bg-success',
    },
    {
      variant: 'contained',
      color: 'info',
      class: 'bg-info',
    },
    {
      variant: 'contained',
      color: 'warning',
      class: 'bg-warning',
    },
    {
      variant: 'contained',
      color: 'default',
      class: 'bg-gray-400',
    },
    // outlined
    {
      variant: 'outlined',
      color: 'primary',
      class: 'border-primary text-primary',
    },
    {
      variant: 'outlined',
      color: 'secondary',
      class: 'border-secondary text-secondary',
    },
    {
      variant: 'outlined',
      color: 'error',
      class: 'border-error text-error',
    },
    {
      variant: 'outlined',
      color: 'success',
      class: 'border-success text-success',
    },
    {
      variant: 'outlined',
      color: 'info',
      class: 'border-info text-info',
    },
    {
      variant: 'outlined',
      color: 'warning',
      class: 'border-warning text-warning',
    },
    {
      variant: 'outlined',
      color: 'default',
      class: 'border-gray-400 text-gray-400',
    },
    // text
    {
      variant: 'text',
      color: 'primary',
      class: 'text-primary',
    },
    {
      variant: 'text',
      color: 'secondary',
      class: 'text-secondary',
    },
    {
      variant: 'text',
      color: 'error',
      class: 'text-error',
    },
    {
      variant: 'text',
      color: 'success',
      class: 'text-success',
    },
    {
      variant: 'text',
      color: 'info',
      class: 'text-info',
    },
    {
      variant: 'text',
      color: 'warning',
      class: 'text-warning',
    },
    {
      variant: 'text',
      color: 'default',
      class: 'text-gray-400',
    },
  ],
});

export type ButtonProps = {
  /**
   * The variant of the button
   * @example contained, outlined, text
   * @default contained
   */
  variant?: ButtonVariantType;
  /**
   * The content of the button
   * @type ReactNode
   * @required
   */
  children: ReactNode;
  /**
   * Color of the button
   * @example primary, secondary, success, error, info, warning, default
   * @default primary
   */
  color?: ButtonPaletteColor;
  /**
   * Additional class name
   * @default ''
   * @type string
   */
  className?: string;
  /**
   * If true, the button will take up the full width of its container.
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Size of the button
   * @example sm, md, lg
   * @default md
   */
  size?: ButtonSize;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
VariantProps<typeof buttonVariants>;

const Button = ({
  variant = 'contained',
  children,
  color = 'primary',
  className,
  fullWidth = true,
  size = 'md',
  disabled = false,
  ...props
}: ButtonProps) => (
  <button
    disabled={disabled}
    type="button"
    className={cn(
      buttonVariants({ variant, color, size, disabled }),
      className,
      fullWidth && 'w-full'
    )}
    {...props}
  >
    {children}
  </button>
);

export default Button;
