import { ReactNode } from 'react';

import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import SitemapContainer from '@/containers/sitemaps/SitemapContainer';

type Props = {
  title: string;
  description: string;
  /**
   * The groups of links: each one loads on its own, so the route wraps them in `Suspense`
   */
  children: ReactNode;
};

const SitemapPage = ({ title, description, children }: Props) => (
  <>
    <PageHeader description={description} title={title} />
    <Section
      className="flex flex-col gap-6"
      rootClassName="md:mt-8 xl:mt-12 mb-8 md:mb-10 lg:md-16"
    >
      <SitemapContainer>
        {children}
      </SitemapContainer>
    </Section>
  </>
);

export default SitemapPage;
