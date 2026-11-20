import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

import Section from './Section';

type Props = {
  children: ReactNode;
  /**
   * Draws the line that separates the section from the one above. The first section of a page has none.
   * @default true
   */
  hasDivider?: boolean;
  /**
   * The id of the section, for an anchor link
   */
  id?: string;
  /**
   * Names the section by the id of its title
   */
  'aria-labelledby'?: string;
  className?: string;
};

/**
 * A band of a marketing page: the content width of the site, a vertical rhythm of 64px (40px on a phone)
 * and a line above it. The children are stacked with a 32px gap.
 */
const PageSection = ({
  children, hasDivider = true, id, 'aria-labelledby': ariaLabelledBy, className,
}: Props) => (
  <Section
    aria-labelledby={ariaLabelledBy}
    as="section"
    id={id}
    className={cn(
      `
        flex-col gap-8 py-10
        md:py-16
      `,
      hasDivider && 'border-t border-border',
      className
    )}
  >
    {children}
  </Section>
);

export default PageSection;
