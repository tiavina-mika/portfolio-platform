import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes, ReactNode } from 'react';


import {
  ButtonPaletteColor,
  SimplePaletteColorOptions,
  TextSizeType,
} from '@/types/component.type';
import { cn } from '@/utils/app.utils';


export const textVariants = cva('font-primary text-lg font-normal', {
  variants: {
    color: {
      primary: `
        text-primary
        dark:text-primary-light
      `,
      secondary: `
        text-secondary
        dark:text-secondary-light
      `,
      success: `
        text-success
        dark:text-success-light
      `,
      error: `
        text-error
        dark:text-error-light
      `,
      info: `
        text-info
        dark:text-info-light
      `,
      warning: `
        text-warning
        dark:text-warning-light
      `,
      default: `
        text-secondary
        dark:text-dark-300
      `,
    },
    size: {
      xl: `
        text-base leading-normal
        md:text-xl
      `,
      lg: `
        text-base
        max-md:leading-normal
        md:text-lg
      `,
      md: `
        text-base
        max-md:leading-normal
        md:text-base
      `,
      sm: `
        text-base
        max-md:leading-normal
        md:text-sm
      `,
      xs: `
        text-base
        max-md:leading-normal
        md:text-xs
      `,
    },
    palette: {
      dark: '',
      main: '',
      light: '',
    },
  },
  compoundVariants: [
    // dark
    {
      palette: 'dark',
      color: 'primary',
      class: 'text-primary-dark',
    },
    {
      palette: 'dark',
      color: 'secondary',
      class: 'text-secondary-dark',
    },
    {
      palette: 'dark',
      color: 'error',
      class: 'text-error-dark',
    },
    {
      palette: 'dark',
      color: 'success',
      class: 'text-success-dark',
    },
    {
      palette: 'dark',
      color: 'info',
      class: 'text-info-dark',
    },
    {
      palette: 'dark',
      color: 'warning',
      class: 'text-warning-dark',
    },
    {
      palette: 'dark',
      color: 'default',
      class: 'text-default',
    },
    // light
    {
      palette: 'light',
      color: 'primary',
      class: 'text-primary-light',
    },
    {
      palette: 'light',
      color: 'secondary',
      class: 'text-secondary-light',
    },
    {
      palette: 'light',
      color: 'error',
      class: 'text-error-light',
    },
    {
      palette: 'light',
      color: 'success',
      class: 'text-success-light',
    },
    {
      palette: 'light',
      color: 'info',
      class: 'text-info-light',
    },
    {
      palette: 'light',
      color: 'warning',
      class: 'text-warning-light',
    },
    {
      palette: 'light',
      color: 'default',
      class: 'text-default-light',
    },
    // main
    {
      palette: 'main',
      color: 'primary',
      class: 'text-primary',
    },
    {
      palette: 'main',
      color: 'secondary',
      class: 'text-secondary',
    },
    {
      palette: 'main',
      color: 'error',
      class: 'text-error',
    },
    {
      palette: 'main',
      color: 'success',
      class: 'text-success',
    },
    {
      palette: 'main',
      color: 'info',
      class: 'text-info',
    },
    {
      palette: 'main',
      color: 'warning',
      class: 'text-warning',
    },
    {
      palette: 'main',
      color: 'default',
      class: 'text-default',
    },
  ],
  defaultVariants: {
    color: 'default',
  },
});
// --------- types --------- //
export type TextProps = {
  /**
   * The size of the text
   * @example xs, sm, md, lg, xl
   * @default md
   */
  size?: TextSizeType;
  /**
   * The content of the text
   */
  children: ReactNode;
  /**
   * tag element to render
   * @example as="span", as="p"
   * @default p
   */
  as?: 'span' | 'p';
  /**
   * The color type of the text
   * @example primary, secondary, success, error, info, warning, default
   * @default default
   */
  color?: ButtonPaletteColor;
  /**
   * The class name of the text to override default styles
   * @example 'text-red-500'
   * @default ''
   */
  className?: string;
  /**
   * The palette theme color of the text
   * @example dark, main, light
   * @default dark
   */
  palette?: SimplePaletteColorOptions;
} & VariantProps<typeof textVariants>;

type Props = HTMLAttributes<HTMLParagraphElement> & TextProps;
const Text = ({
  children,
  color = 'default',
  palette = 'dark',
  className,
  size = 'md',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  as: Component = 'p',
  ...props
}: Props) => {
  return (
    <Component
      className={cn(textVariants({ color, size, palette }), className)}
      {...props}
    >
      {children}
    </Component>
  );
};


export default Text;
