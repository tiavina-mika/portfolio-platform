import { ReactNode } from 'react';

type Props = {
  /**
   * The breadcrumbs, the title and the introduction
   */
  header: ReactNode;
  /**
   * The list of projects with its pagination. It loads its own data (and carries its own loading
   * and error states), so the route streams it
   */
  projects: ReactNode;
};

/**
 * The projects page layout: the header above the list. Each part owns its band, so the page only
 * sets the order
 */
const ProjectsPage = ({ header, projects }: Props) => (
  <div className={`
    flex flex-col self-stretch pb-6
    md:pb-8
    lg:pb-16
  `}
  >
    {header}
    <div className={`
      flex flex-col self-stretch pt-10
      lg:pt-20
    `}
    >
      {projects}
    </div>
  </div>
);

export default ProjectsPage;
