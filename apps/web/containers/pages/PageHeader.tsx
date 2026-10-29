import { ReactNode } from 'react';

import { Breadcrumbs, BreadcrumbsSegment } from '@/components/Breadcrumbs';
import Section from '@/components/layouts/Section';
import Title from '@/components/typography/Title';
import { CardImage } from '@/components/ui/Card';
import { Locale } from '@/i18n/config';

type Props = {
  locale: Locale;
  breadcrumbs: BreadcrumbsSegment[];
  /**
   * The only h1 of the page, also the text alternative of the banner
   */
  title: string;
  /**
   * The rich text under the title, already rendered by the caller (the CMS field is HTML)
   */
  description?: ReactNode;
  /**
   * The banner. Without it the block is not rendered
   */
  bannerUrl?: string;
};

/**
 * The top of a CMS page or of a category: breadcrumbs, the banner, then the title and its
 * description
 */
const PageHeader = ({
  locale, breadcrumbs, title, description, bannerUrl,
}: Props) => {
  return (
    <Section
      as="header"
      className="flex-col gap-5"
      rootClassName="mt-4 md:mt-8 xl:mt-12"
      size="lg"
    >
      <Breadcrumbs locale={locale} segments={breadcrumbs} />

      {bannerUrl && (
        <CardImage
          priority
          alt={title}
          containerClassName="h-[25vh] md:h-[350px] lg:h-[420px]"
          src={bannerUrl}
        />
      )}

      <div className="flex flex-col gap-3">
        <Title>{title}</Title>
        {description && <div>{description}</div>}
      </div>
    </Section>
  );
};

export default PageHeader;
