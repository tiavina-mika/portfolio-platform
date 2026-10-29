import { getTranslations } from 'next-intl/server';

import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getProjects } from '@/server/queries/project.queries';
import { getProjectCardData } from '@/utils/project.utils';

import ProjectsSection from './ProjectsSection';

const DEFAULT_PROJECTS_LIMIT = 16;

type Props = {
  locale: Locale;
  /**
   * Title of the list. By default it counts the projects: "Projects developed recently (12)"
   */
  title?: string;
  description?: string;
  /**
   * Only the projects of this society
   */
  society?: string;
  /**
   * The project of the page the list is on, left out of it
   */
  otherThanProjectId?: string;
  limit?: number;
  className?: string;
  listClassName?: string;
};

/**
 * Loads the first projects (no pagination) and renders them under a title, with a link to the others.
 * Nothing is rendered when there is no project. A failed request throws, so the boundary around shows
 * the error (or offline) banner with a retry.
 */
const NonPaginatedProjectsData = async ({
  locale,
  title,
  description,
  society,
  otherThanProjectId,
  limit = DEFAULT_PROJECTS_LIMIT,
  className,
  listClassName,
}: Props) => {
  const t = await getTranslations({ locale, namespace: 'Project' });
  const data = await getProjects({
    locale,
    limit,
    skip: 0,
    society,
    otherThanProjectId,
  });

  if ('error' in data) throw new Error(data.error);

  const projects = await Promise.all(
    data.projects.map((project) => getProjectCardData(project, locale))
  );
  const remainingCount = data.count - projects.length;

  return (
    <ProjectsSection
      hideWhenEmpty
      className={className}
      description={description}
      listClassName={listClassName}
      projects={projects}
      status="ready"
      title={title || t('projectDevelopedRecently', { count: data.count })}
      moreLink={remainingCount > 0
        ? { href: ROUTES.projects.root, label: t('seeOtherProjects', { count: remainingCount }) }
        : undefined}
    />
  );
};

export default NonPaginatedProjectsData;
