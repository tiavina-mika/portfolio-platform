import Section from '@/components/layouts/Section';
import ProjectsSkeleton from '@/containers/projects/ProjectsSkeleton';

const ProjectsLoading = () => {
  return (
    <Section rootClassName="mt-16">
      <ProjectsSkeleton />
    </Section>
  );
};

export default ProjectsLoading;
