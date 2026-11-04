/**
 * The home hero with its database parts streamed in: an async tree, so it has no story
 */
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import DownloadCV from '@/containers/home/download/DownloadCV';
import { Locale } from '@/i18n/config';

import DynamicHomeHeroTexts from './DynamicHomeHeroTexts';
import DynamicHomeHeroVisual from './DynamicHomeHeroVisual';
import HomeHeroContainer from './HomeHeroContainer';
import HomeHeroTextsBoundary from './HomeHeroTextsBoundary';
import HomeHeroTextsSkeleton from './HomeHeroTextsSkeleton';

type Props = {
  locale: Locale;
};

const HomeHero = ({ locale }: Props) => {
  return (
    <HomeHeroContainer
      action={(
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <div>
              <DownloadCV className={`
                rounded-md bg-default px-4 py-3 text-base font-medium text-white
                md:text-lg
                lg:px-8 lg:py-4
                dark:bg-secondary! dark:text-neutral-900!
              `}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}
      // the images load on their own too; on an error they stay out
      image={(
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <DynamicHomeHeroVisual theme="light" />
          </Suspense>
        </ErrorBoundary>
      )}
      imageDarkMode={(
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <DynamicHomeHeroVisual theme="dark" />
          </Suspense>
        </ErrorBoundary>
      )}
      // the description loads on its own: a skeleton, then the text, or a banner with a retry button
      texts={(
        <HomeHeroTextsBoundary>
          <Suspense fallback={<HomeHeroTextsSkeleton />}>
            <DynamicHomeHeroTexts locale={locale} />
          </Suspense>
        </HomeHeroTextsBoundary>
      )}
    />
  );
};

export default HomeHero;
