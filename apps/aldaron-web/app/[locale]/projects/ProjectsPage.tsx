import { useTranslations } from 'next-intl';

import ButtonLink from '@/components/buttons/ButtonLink';
import PageHero from '@/components/layouts/PageHero';
import Section from '@/components/layouts/Section';
import ProjectsGallery from '@/containers/project/ProjectsGallery';
import { ROUTES } from '@/i18n/routes';
import { PROJECTS } from '@/utils/project.constants';

/**
 * The projects page: the hero, then the delivered projects and the way to estimate one's own
 */
const ProjectsPage = () => {
  const t = useTranslations('ProjectsPage');

  return (
    <div className="flex flex-col self-stretch">
      <PageHero
        description={t('description')}
        eyebrow={t('eyebrow')}
        title={t('title')}
        className={`
          pb-6
          md:pb-10
        `}
      />
      <Section
        as="section"
        className={`
          flex-col gap-10 pb-10
          md:pb-16
        `}
      >
        <ProjectsGallery projects={PROJECTS} />
        <div>
          <ButtonLink href={ROUTES.simulator} size="lg" variant="outline">
            {t('estimate')}
          </ButtonLink>
        </div>
      </Section>
    </div>
  );
};

export default ProjectsPage;
