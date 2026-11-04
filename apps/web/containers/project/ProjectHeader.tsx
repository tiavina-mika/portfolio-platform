import { useTranslations } from 'next-intl';

import { Breadcrumbs, type BreadcrumbsSegment } from '@/components/Breadcrumbs';
import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import TextLink from '@/components/typography/TextLink';
import { Locale } from '@/i18n/config';
import { IProject } from '@/types/project.type';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  project: IProject;
  locale: Locale;
  breadcrumbs: BreadcrumbsSegment[];
};

/**
 * The top of a project page: breadcrumbs, the only h1 of the page (the title), the description, the
 * link to the website and to the source code, and the main picture
 */
const ProjectHeader = ({ project, locale, breadcrumbs }: Props) => {
  const t = useTranslations('Project');

  const { translated } = project;
  const repositoryUrl = project.repositories?.[0]?.url;

  return (
    <>
      <Section className="pt-4">
        <Breadcrumbs locale={locale} segments={breadcrumbs} />
      </Section>
      <PageHeader
        description={getTranslatedField(translated, locale, 'description')}
        image={project.image?.url}
        title={getTranslatedField(translated, locale, 'title')}
      >
        <div className={`
          flex flex-col gap-8
          lg:flex-row lg:gap-5
        `}
        >
          {project.website && (
            <TextLink buttonVariant="contained" href={project.website} variant="button">
              {t('visitSite')}
            </TextLink>
          )}
          {repositoryUrl && (
            <TextLink
              buttonVariant={project.website ? 'outlined' : 'contained'}
              href={repositoryUrl}
              variant="button"
            >
              {t('seeCodeSource')}
            </TextLink>
          )}
        </div>
      </PageHeader>
    </>
  );
};

export default ProjectHeader;
