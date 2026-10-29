import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

import ProjectListContainer from './ProjectListContainer';

const ProjectsSkeleton = () => {
  return (
    <ProjectListContainer>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} withShadow={false}>
          {/* see CardImage */}
          <Skeleton className={`
            h-[25vh] w-full rounded-lg
            md:h-[200px]
          `}
          />
          <CardContent className="space-y-2 !p-0">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-[80px]" />
            <div className="flex flex-row justify-end">
              <Skeleton className="h-6 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </ProjectListContainer>
  );
};

export default ProjectsSkeleton;
