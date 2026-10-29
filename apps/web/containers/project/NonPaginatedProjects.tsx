import { ComponentProps, Suspense } from 'react';

import NonPaginatedProjectsData from './NonPaginatedProjectsData';
import ProjectsBoundary from './ProjectsBoundary';
import ProjectsSection from './ProjectsSection';

type Props = ComponentProps<typeof NonPaginatedProjectsData>;

/**
 * The first projects under a title, for a page that has other sections (the home page, a project of
 * the same society): skeleton cards while they load, a banner with a retry (or an offline notice) if
 * they fail, nothing when there is no project
 */
const NonPaginatedProjects = ({ className, ...props }: Props) => (
  <ProjectsBoundary>
    <Suspense fallback={<ProjectsSection className={className} status="loading" />}>
      <NonPaginatedProjectsData className={className} {...props} />
    </Suspense>
  </ProjectsBoundary>
);

export default NonPaginatedProjects;
