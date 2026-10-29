import { ComponentProps, Suspense } from 'react';

import ProjectsBoundary from './ProjectsBoundary';
import ProjectsData from './ProjectsData';
import ProjectsSection from './ProjectsSection';

type Props = ComponentProps<typeof ProjectsData>;

/**
 * The paginated list of the projects page: skeleton cards while the projects load, a banner with a
 * retry (or an offline notice) if they fail, the empty notice when none is published yet
 */
const Projects = (props: Props) => (
  <ProjectsBoundary>
    <Suspense fallback={<ProjectsSection status="loading" />}>
      <ProjectsData {...props} />
    </Suspense>
  </ProjectsBoundary>
);

export default Projects;
