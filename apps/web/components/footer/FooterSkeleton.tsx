import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/app.utils';

const FooterSkeleton = () => {
  return Array.from({ length: 2 }).map((_, index) => (
    <Skeleton
      className={cn('h-6 rounded-md', index === 0 ? 'w-52' : 'w-32')}
      key={index}
    />
  ));
};

export default FooterSkeleton;
