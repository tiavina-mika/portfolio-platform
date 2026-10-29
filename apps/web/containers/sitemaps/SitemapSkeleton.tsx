import { Skeleton } from '@/components/ui/Skeleton';

const SitemapSkeleton = () => {
  return (
    <div className={`
      flex flex-1 flex-col gap-4
      md:gap-5
    `}
    >
      <div>
        <Skeleton className={`
          h-8 w-[200px] rounded-md
          md:h-12
        `}
        />
      </div>
      <div className={`
        flex flex-col gap-3
        md:gap-4
      `}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
};

export default SitemapSkeleton;
