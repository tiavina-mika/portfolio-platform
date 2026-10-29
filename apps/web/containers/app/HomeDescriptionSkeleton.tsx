import { Skeleton } from '@/components/ui/Skeleton';

const HomeDescriptionSkeleton = () => {
  return (
    <div className={`
      flex flex-1 flex-col gap-3
      2xl:gap-4
    `}
    >
      <Skeleton className={`
        h-6 w-full
        xl:h-7
      `}
      />
      <Skeleton className={`
        h-6 w-full
        xl:h-7
      `}
      />
      <Skeleton className={`
        h-6 w-full
        xl:h-7
        2xl:w-80
      `}
      />
      <Skeleton className={`
        h-6 w-full
        sm:w-80
        xl:h-7
        2xl:hidden
      `}
      />
      <Skeleton className={`
        h-6 w-80
        sm:hidden
        xl:h-7
      `}
      />
    </div>
  );
};

export default HomeDescriptionSkeleton;
