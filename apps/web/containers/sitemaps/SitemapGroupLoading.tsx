import { Skeleton } from '@/components/ui/Skeleton';

const SitemapGroupLoading = () => {
  return (
    <div className="flex flex-col gap-3 self-stretch">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
};

export default SitemapGroupLoading;
