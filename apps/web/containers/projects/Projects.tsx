import { Locale } from '@/i18n/config';

import Project from './Project';
import ProjectListContainer from './ProjectListContainer';

type Props = {
  projects: any[];
  locale: Locale;
  className?: string;
};

const Projects = ({ projects, locale, className }: Props) => {
  return (
    <ProjectListContainer className={className}>
      {projects.map((project, index) => (
        <Project key={project.id + index} locale={locale} project={project} />
      ))}
    </ProjectListContainer>
  );
};

export default Projects;
