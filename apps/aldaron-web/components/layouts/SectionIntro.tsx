import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

import Eyebrow from '../typography/Eyebrow';
import Title from '../typography/Title';

type Props = {
  /**
   * The mono label above the title
   */
  eyebrow?: string;
  title: ReactNode;
  /**
   * A sentence under the title
   */
  description?: ReactNode;
  /**
   * `h1` introduces a whole page (one per page), `h2` a section of it
   * @default 2
   */
  level?: 1 | 2;
  /**
   * The id of the title, for the `aria-labelledby` of its section
   */
  titleId?: string;
  /**
   * Overrides the style of the title, e.g. a wider measure than the default 20 characters
   */
  titleClassName?: string;
  /**
   * Overrides the style of the description, e.g. a wider measure than the default 56 characters
   */
  descriptionClassName?: string;
  /**
   * Overrides the color of the eyebrow, e.g. on an inverted surface
   */
  eyebrowClassName?: string;
  className?: string;
};

/**
 * The head of a section: the eyebrow, a title and a lead sentence, stacked and left aligned
 */
const SectionIntro = ({
  eyebrow,
  title,
  description,
  level = 2,
  titleId,
  titleClassName,
  descriptionClassName,
  eyebrowClassName,
  className,
}: Props) => (
  <div className={cn('flex flex-col items-start gap-3', className)}>
    {eyebrow && <Eyebrow className={eyebrowClassName}>{eyebrow}</Eyebrow>}
    <Title
      gutterBottom={false}
      id={titleId}
      level={level}
      className={cn(
        'max-w-[20ch] font-display text-balance',
        level === 1
          ? `
            max-w-[16ch] text-[38px] leading-[1.02] tracking-[-0.035em]
            md:text-[52px]
            lg:text-[68px]
          `
          : `
            text-[30px] leading-[1.05] tracking-[-0.03em]
            md:text-[40px]
          `,
        titleClassName
      )}
    >
      {title}
    </Title>
    {description && (
      <p
        className={cn(
          'max-w-[56ch] text-lg leading-[1.55] text-pretty text-muted-foreground',
          level === 1 && 'md:text-xl',
          descriptionClassName
        )}
      >
        {description}
      </p>
    )}
  </div>
);

export default SectionIntro;
