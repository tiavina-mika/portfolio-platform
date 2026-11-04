import { useTranslations } from 'next-intl';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import PageHeader from '@/components/layouts/PageHeader';
import Section from '@/components/layouts/Section';
import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';

type Props = {
  locale: Locale;
};

/**
 * The top of the projects page: breadcrumbs, the only h1 of the page and its introduction
 */
const ProjectsHeader = ({ locale }: Props) => {
  const t = useTranslations('Project');
  const tNavBar = useTranslations('NavBar');

  return (
    <>
      <Section className="pt-4">
        <Breadcrumbs
          locale={locale}
          segments={[{ name: tNavBar('projects'), link: ROUTES.projects.root }]}
        />
      </Section>
      <PageHeader
        description={t('projectsIDevelopedOverMyCareerDescription')}
        title={t('projectsIDevelopedTitle')}
      />
    </>
  );
};

export default ProjectsHeader;
