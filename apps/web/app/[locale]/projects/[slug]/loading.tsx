import Section from '@/components/layouts/Section';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const ProjectSkeleton = () => {
  return (
    <Section className="grid grid-cols-1" size="md">
      <Card withShadow={false}>
        {/* see CardImage */}
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-[85%]" />
        <Skeleton className="h-14 w-[85%]" />
        <Skeleton className={`
          h-[25vh] w-full rounded-lg
          md:h-[400px]
        `}
        />
        <Skeleton className={`
          h-[40vh] w-full
          md:h-[500px]
        `}
        />
      </Card>
    </Section>
  );
};

export default ProjectSkeleton;
