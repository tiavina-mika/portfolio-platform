import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes, ReactNode } from 'react';


import { ButtonPaletteColor, TitleLevelType } from '@/types/component.type';
import { cn } from '@/utils/app.utils';


export const titleVariants = cva('font-primary', {
  variants: {
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      error: 'text-error',
      info: 'text-info',
      warning: 'text-warning',
      default: 'text-default',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});
// --------- types --------- //
export type TitleProps = {
  /**
   * The title level
   * @example h1, h2, h3, h4, h5, h6
   * @default h1
   */
  level?: TitleLevelType;
  /**
   * The content of the title
   */
  children: ReactNode;
  /**
   * The color type of the title
   * @example primary, secondary, success, error, info, warning, default
   * @default default
   */
  color?: ButtonPaletteColor;
  /**
   * The class name of the title to override default styles
   * @example 'text-red-500'
   * @default ''
   */
  className?: string;
  /**
   * If true, the title will have a bottom margin
   * @default true
   */
  gutterBottom?: boolean;
} & HTMLAttributes<HTMLHeadingElement> &
VariantProps<typeof titleVariants>;

type Props = HTMLAttributes<HTMLHeadingElement> & TitleProps;
const TitleV1 = ({
  children,
  color = 'default',
  className,
  gutterBottom = true,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  level: Heading = 'h1',
  ...props
}: Props) => (
  <Heading
    className={cn(
      titleVariants({ color }),
      className,
      `
        font-bold
        dark:text-dark-300
      `,
      /**
       * mobile size, for mobile+, it's defined in theme
       * because there is no way to define responsive font-size there
       * @see /utils/theme.ts
       */
      {
        'text-3xl md:text-5xl lg:text-6xl': Heading === 'h1',
        'text-2xl max-md:leading-snug md:text-4xl lg:text-5xl':
            Heading === 'h2',
        'text-xl max-md:leading-[1.4em] md:text-3xl lg:text-4xl':
            Heading === 'h3',
        'text-lg max-md:leading-[1.4em] md:text-2xl lg:text-3xl':
            Heading === 'h4',
        'text-lg max-md:leading-[1.4em] md:text-xl lg:text-2xl':
            Heading === 'h5',
        'text-lg max-md:leading-[1.4em] lg:text-xl': Heading === 'h6',
        'pb-0': !gutterBottom,
      }
    )}
    {...props}
  >
    {children}
  </Heading>
);


export default TitleV1;
