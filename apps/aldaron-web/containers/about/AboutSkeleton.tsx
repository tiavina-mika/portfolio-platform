'use client';

import { useTranslations } from 'next-intl';

import PageHeroSkeleton from '@/components/layouts/PageHeroSkeleton';
import Section from '@/components/layouts/Section';
import SkeletonLines from '@/components/layouts/SkeletonLines';
import { Skeleton } from '@/components/ui/Skeleton';

const PRINCIPLE_COUNT = 3;

/**
 * The about page while it loads: the hero, an image and a paragraph side by side, then three principles
 */
const AboutSkeleton = () => {
  const t = useTranslations('Common');

  return (
    <div
      aria-busy="true"
      aria-label={t('loading')}
      className="self-stretch"
      role="status"
    >
      <Section className="flex-col pb-12">
        <PageHeroSkeleton titleWidth="80%" />
        <div className="grid gap-10">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-6">
            <Skeleton className="h-[280px] w-full rounded-xl" />
            <SkeletonLines count={7} lastWidth="50%" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-6">
            {Array.from({ length: PRINCIPLE_COUNT }, (_, index) => (
              <div className="grid gap-3 border-t border-border pt-5" key={index}>
                <Skeleton className="h-3 w-[40%] rounded-md" />
                <Skeleton className="h-[22px] w-[70%] rounded-md" />
                <SkeletonLines count={3} lastWidth="60%" />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AboutSkeleton;
