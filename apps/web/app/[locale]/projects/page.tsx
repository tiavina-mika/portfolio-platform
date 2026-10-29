
import { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import { siteConfig } from '@/config/site';
import PaginatedProjects from '@/containers/projects/PaginatedProjects';
import ProjectsSkeleton from '@/containers/projects/ProjectsSkeleton';
import { defaultLocale, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { ISearchParams } from '@/types/app.type';
import { getTranslatedAbsoluteUrl } from '@/utils/app.utils';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type MetaDataProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async (
  props: MetaDataProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;

  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });

  const image = `${siteConfig.url}/images/metadata/og-image-projects.${locale || defaultLocale}.jpg`;

  const og = (await parent).openGraph;
  const keywords = (await parent).keywords || [];

  return {
    title: t('projects.metaTitle'),
    description: t('projects.metaDescription'),
    keywords: [...keywords, 'projects', 'blog', 'news'],
    openGraph: {
      ...og,
      title: t('projects.metaTitle'),
      description: t('projects.metaDescription'),
      url: getTranslatedAbsoluteUrl(ROUTES.projects.root, { locale }),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: t('projects.metaTitle'),
        },
      ],
    },
  };
};

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<ISearchParams>;
};

const ProjectsPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const tProject = await getTranslations('Project');

  return (
    <Section className="flex flex-col" rootClassName="mb-6 md:mb-8 lg:mb-16">
      <PageHeader
        fullWidth
        description={tProject('projectsIDevelopedOverMyCareerDescription')}
        title={tProject('projectsIDevelopedTitle')}
      />
      <Suspense fallback={<ProjectsSkeleton />}>
        <PaginatedProjects locale={locale} searchParams={searchParams} />
      </Suspense>
    </Section>
  );
};

export default ProjectsPage;
