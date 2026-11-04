import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

export type SectionProps = {
  children: ReactNode;
  className?: string;
  rootClassName?: string;
  /**
   * the center of the section is full width
   * so there is no space on the left and right side
   */
  fullWidth?: boolean;
  /**
   * as: the html tag of the section
   */
  as?: 'div' | 'section' | 'article' | 'header';
  /**
   * size of the center section
   * e.g. md: 1023px, lg: 1232px, xl: 1620px
   */
  size?: 'md' | 'lg' | 'xl';
  /**
   * names the section for screen readers, by the id of its heading
   */
  'aria-labelledby'?: string;
  /**
   * names the section for screen readers, when it has no visible heading
   */
  'aria-label'?: string;
};

const Section = ({
  children,
  className,
  rootClassName,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  as: Component = 'div',
  fullWidth = false,
  size = 'xl',
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
}: SectionProps) => {
  return (
    <Component
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'flex flex-row items-center justify-center self-stretch',
        rootClassName
      )}
    >
      <div
        className={cn(
          'flex flex-row',
          // fullWidth ? 'w-full': 'w-[93%] xl:w-[90%]',
          {
            'w-full 2xl:max-w-[1620px]': fullWidth,
            'w-[93%] xl:w-[90%] 2xl:max-w-[1620px]':
              !fullWidth && size === 'xl',
            'w-[93%] xl:max-w-[1023px]': !fullWidth && size === 'md',
            'w-[93%] xl:max-w-[1232px]': !fullWidth && size === 'lg',
          },
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
};

export default Section;
