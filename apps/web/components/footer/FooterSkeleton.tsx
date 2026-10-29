import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/app.utils';

const FooterSkeleton = () => {
  return Array.from({ length: 2 }).map((_, index) => (
    <Skeleton
      key={index}
      className={cn('h-6 rounded-md', index === 0 ? 'w-52' : 'w-32')}
    />
  ));
};

export default FooterSkeleton;
