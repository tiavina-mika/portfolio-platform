'use client';

import { useTranslations } from 'next-intl';

import PageHeroSkeleton from '@/components/layouts/PageHeroSkeleton';
import Section from '@/components/layouts/Section';
import SkeletonLines from '@/components/layouts/SkeletonLines';
import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_COUNT = 4;

/**
 * The projects page while it loads: the hero, then four cards
 */
const ProjectsSkeleton = () => {
  const t = useTranslations('Common');

  return (
    <div
      aria-busy="true"
      aria-label={t('loading')}
      className="self-stretch"
      role="status"
    >
      <Section className="flex-col pb-12">
        <PageHeroSkeleton titleWidth="85%" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div
              className="grid gap-3.5 rounded-xl border border-border bg-card p-5"
              key={index}
            >
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-3 w-[40%] rounded-md" />
              <Skeleton className="h-[22px] w-3/4 rounded-md" />
              <SkeletonLines count={3} lastWidth="55%" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-[72px] rounded-md" />
                <Skeleton className="h-6 w-[72px] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default ProjectsSkeleton;
