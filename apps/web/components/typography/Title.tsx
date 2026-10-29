import { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

// Definition of Tailwind classes for each heading level
const headings = {
  1: 'text-4xl md:text-6xl font-bold leading-tight',
  2: 'text-3xl md:text-5xl font-bold leading-[1.2em]',
  3: 'text-2xl md:text-4xl font-semibold leading-snug',
  4: 'text-xl md:text-3xl font-semibold leading-normal',
  5: 'text-lg md:text-2xl font-medium leading-normal',
  6: 'text-base md:text-xl font-medium leading-normal',
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
        `
          font-primary font-bold text-default
          dark:text-dark-300
        `,
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
