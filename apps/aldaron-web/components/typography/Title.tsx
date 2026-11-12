import { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

// each level on the type scale of the theme, one step larger from md
const headings = {
  1: 'text-h1 md:text-display',
  2: 'text-h2 md:text-h1',
  3: 'text-h3 md:text-h2',
  4: 'text-h4 md:text-h3',
  5: 'text-lg md:text-h4',
  6: 'text-base md:text-lg',
} as const;

// Type for heading levels 1-6
type HeadingLevel = keyof typeof headings;

export type TitleProps = {
  level?: HeadingLevel;
  className?: string;
  children: ReactNode;
  gutterBottom?: boolean;
} &
  // To allow passing all native heading props (id, aria-label, etc.)
  HTMLAttributes<HTMLHeadingElement>;

/**
 * A heading. Its font and weight come from the base styles of `h1`…`h6`, and its color from its
 * parent, so it stays readable on an inverted surface.
 */
const Title = ({
  level = 1,
  children,
  className = '',
  gutterBottom = true,
  ...rest
}: TitleProps) => {
  // Security: if level is invalid, fallback to h1
  const safeLevel = level in headings ? level : 1;
  const Tag = `h${safeLevel}` as const;

  return (
    <Tag
      className={cn(
        headings[safeLevel],
        { 'pb-0': !gutterBottom },
        className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Title;
