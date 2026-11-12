import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes, ReactNode } from 'react';

import { TextColorType, TextSizeType } from '@/types/component.type';
import { cn } from '@/utils/app.utils';

export const textVariants = cva('text-lg font-normal', {
  variants: {
    color: {
      primary: 'text-primary',
      secondary: 'text-muted-foreground',
      success: 'text-success',
      error: 'text-destructive-text',
      info: 'text-info',
      warning: 'text-warning',
      default: 'text-foreground',
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
  },
});

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
  color?: TextColorType;
  /**
   * The class name of the text to override default styles
   * @example 'text-brand-text'
   * @default ''
   */
  className?: string;
} & VariantProps<typeof textVariants>;

type Props = HTMLAttributes<HTMLParagraphElement> & TextProps;
const Text = ({
  children,
  color = 'default',
  className,
  size = 'md',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  as: Component = 'p',
  ...props
}: Props) => {
  return (
    <Component
      className={cn(textVariants({ color, size }), className)}
      {...props}
    >
      {children}
    </Component>
  );
};


export default Text;
