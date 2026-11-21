import { cn } from '@/utils/app.utils';

import Section from './Section';
import SectionIntro from './SectionIntro';

type Props = {
  /**
   * The mono label above the title
   */
  eyebrow: string;
  /**
   * The h1 of the page
   */
  title: string;
  /**
   * The lead sentence under the title
   */
  description: string;
  /**
   * Overrides the style of the lead sentence, e.g. a wider measure
   */
  descriptionClassName?: string;
  /**
   * The space under the hero, which the page sets to the one of its first band
   */
  className?: string;
};

/**
 * The opening band of a page: the eyebrow, the h1 and a lead sentence, with the generous space above
 * that sets a page apart from a section
 */
const PageHero = ({
  eyebrow, title, description, descriptionClassName, className,
}: Props) => (
  <Section
    as="header"
    className={cn(`
      flex-col pt-10
      md:pt-[72px]
    `, className)}
  >
    <SectionIntro
      className="gap-7"
      description={description}
      descriptionClassName={descriptionClassName}
      eyebrow={eyebrow}
      level={1}
      title={title}
    />
  </Section>
);

export default PageHero;
