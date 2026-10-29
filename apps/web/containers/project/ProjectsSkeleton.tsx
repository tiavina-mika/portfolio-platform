import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

import ProjectList from './ProjectList';

const SKELETON_COUNT = 3;

const ProjectsSkeleton = () => {
  return (
    <ProjectList>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <li className="flex min-w-0" key={index}>
          <Card withShadow={false}>
            {/* see CardImage */}
            <Skeleton className={`
              h-[25vh] w-full rounded-lg
              md:h-[200px]
            `}
            />
            <CardContent className="gap-2 p-0!">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-[80px]" />
              <div className="flex flex-row justify-end">
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ProjectList>
  );
};

export default ProjectsSkeleton;
