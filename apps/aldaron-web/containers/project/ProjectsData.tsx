import { Locale } from '@/i18n/config';
import { getProjects } from '@/server/queries/project.queries';
import { getPaginatedQuery } from '@/utils/app.utils';
import { PAGINATION } from '@/utils/constants';
import { getProjectCardData } from '@/utils/project.utils';

import ProjectsSection from './ProjectsSection';

type Props = {
  locale: Locale;
  page: number;
  /**
   * `desc` lists the newest first
   */
  order: 'asc' | 'desc';
  orderedBy?: string;
  tag?: string;
  technologies?: string;
  /**
   * Search params kept in the links of the pagination
   */
  searchParams: Record<string, string>;
};

/**
 * Loads one page of the projects and renders it. A failed request throws, so the boundary around
 * shows the error (or offline) banner with a retry.
 */
const ProjectsData = async ({
  locale, page, order, orderedBy, tag, technologies, searchParams,
}: Props) => {
  const { perPage } = PAGINATION;

  const data = await getProjects({
    orderedBy,
    order,
    locale,
    tag,
    technologies,
    ...getPaginatedQuery(perPage, page),
  });

  if ('error' in data) throw new Error(data.error);

  const projects = await Promise.all(
    data.projects.map((project) => getProjectCardData(project, locale))
  );

  return (
    <ProjectsSection
      pagination={{ page, perPage, total: data.count }}
      projects={projects}
      searchParams={searchParams}
      status="ready"
    />
  );
};

export default ProjectsData;
