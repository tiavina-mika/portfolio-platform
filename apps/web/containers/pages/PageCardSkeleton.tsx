import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * The placeholder of a card of a list of pages or subcategories while it loads
 */
const PageCardSkeleton = () => (
  <Card withShadow={false}>
    <Skeleton className={`
      h-[25vh] w-full rounded-lg
      md:h-[230px]
    `}
    />
    <CardContent className="gap-2 p-0!">
      <Skeleton className="h-6" />
      <Skeleton className="h-12" />
    </CardContent>
  </Card>
);

export default PageCardSkeleton;
