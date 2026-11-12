import Section from '@/components/layouts/Section';
import ProjectsSkeleton from '@/containers/project/ProjectsSkeleton';

const ProjectsLoading = () => {
  return (
    <Section rootClassName="pt-16">
      <ProjectsSkeleton />
    </Section>
  );
};

export default ProjectsLoading;
