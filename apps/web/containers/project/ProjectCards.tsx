import ProjectCard, { type ProjectCardData } from './ProjectCard';
import ProjectList from './ProjectList';

type Props = {
  projects: ProjectCardData[];
  className?: string;
};

const ProjectCards = ({ projects, className }: Props) => {
  return (
    <ProjectList className={className}>
      {projects.map((project) => (
        <li className="flex min-w-0" key={project.id}>
          <ProjectCard {...project} />
        </li>
      ))}
    </ProjectList>
  );
};

export default ProjectCards;
