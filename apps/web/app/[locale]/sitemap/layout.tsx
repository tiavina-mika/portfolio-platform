import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import SitemapContainer from '@/containers/sitemaps/SitemapContainer';
import { Locale } from '@/i18n/config';
import { APP_NAME } from '@/utils/constants';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type Props = {
  children: ReactNode;
  articles: ReactNode;
  pages: ReactNode;
  projects: ReactNode;
  categories: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;

  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });

  return {
    title: t('sitemap.metaTitle'),
    description: t('sitemap.metaDescription', { appName: APP_NAME }),
  };
};

const Layout = async (props: Props) => {
  const params = await props.params;

  const t = await getTranslations('Sitemap');

  const {
    locale,
  } = params;

  setRequestLocale(locale);

  const {
    children,
    articles,
    pages,
    categories,
    projects,
  } = props;

  return (
    <>
      <PageHeader description={t('description', { appName: APP_NAME })} title={t('sitemap')} />
      <Section
        className="flex flex-col gap-6"
        rootClassName="md:mt-8 xl:mt-12 mb-8 md:mb-10 lg:md-16"
      >
        <SitemapContainer>
          {projects}
          {pages}
          {articles}
          {categories}
          {children}
        </SitemapContainer>
      </Section>
    </>
  );
};

export default Layout;
