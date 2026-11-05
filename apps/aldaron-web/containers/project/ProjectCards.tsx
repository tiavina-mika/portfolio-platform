import RevealListItem from '@/components/animation/RevealListItem';

import ProjectCard, { type ProjectCardData } from './ProjectCard';
import ProjectList from './ProjectList';

type Props = {
  projects: ProjectCardData[];
  className?: string;
};

const ProjectCards = ({ projects, className }: Props) => {
  return (
    <ProjectList className={className}>
      {projects.map((project, index) => (
        <RevealListItem className="flex min-w-0" index={index} key={project.id}>
          <ProjectCard {...project} />
        </RevealListItem>
      ))}
    </ProjectList>
  );
};

export default ProjectCards;
