import { ReactNode } from 'react';

import { BreadcrumbsSegment } from '@/components/Breadcrumbs';
import Project from '@/containers/project/Project';
import ProjectHeader from '@/containers/project/ProjectHeader';
import { Locale } from '@/i18n/config';
import { IProject } from '@/types/project.type';

type Props = {
  project: IProject;
  locale: Locale;
  /**
   * Absolute address of the project, put in the sharing links
   */
  currentPathname: string;
  breadcrumbs: BreadcrumbsSegment[];
  /**
   * The other projects of the same society. It loads its own data (and carries its own loading
   * and error states), so the route streams it
   */
  otherProjects: ReactNode;
  newsletter: ReactNode;
};

/**
 * The page of one project: header, body, the other projects of the same society and the newsletter.
 * Each part owns its band, so the page only sets the order.
 */
const ProjectPage = ({
  project, locale, currentPathname, breadcrumbs, otherProjects, newsletter,
}: Props) => (
  <div className="flex flex-col self-stretch">
    <ProjectHeader breadcrumbs={breadcrumbs} locale={locale} project={project} />
    <Project currentPathname={currentPathname} locale={locale} project={project} />
    {otherProjects}
    {newsletter}
  </div>
);

export default ProjectPage;
