import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Stands for the description while it loads from the database: the bars reserve its final height
 */
const HomeHeroTextsSkeleton = () => {
  const t = useTranslations('HomeHero');

  return (
    <div
      aria-busy="true"
      aria-label={t('loading')}
      role="status"
      className={`
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

export default HomeHeroTextsSkeleton;
