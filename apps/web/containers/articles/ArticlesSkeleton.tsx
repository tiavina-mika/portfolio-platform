import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const ArticlesSkeleton = () => {
  return (
    <div className={`
      flex flex-1 flex-col gap-x-6 gap-y-12
      md:grid md:grid-cols-2 md:gap-x-8
      lg:grid-cols-3 lg:gap-x-12
      xl:gap-y-16
    `}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} withShadow={false}>
          {/* see CardImage */}
          <Skeleton className={`
            h-[25vh] w-full rounded-lg
            md:h-[230px]
          `}
          />
          <CardContent className="space-y-2 p-0!">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6" />
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ArticlesSkeleton;
