/**
 * The layout of the home hero, props only: used by HomeHero (which streams the database parts into it)
 */
import { ReactNode } from 'react';

import PageHeader from '@/components/layouts/PageHeader';
import { cn } from '@/utils/app.utils';
import { APP_NAME } from '@/utils/constants';

// the hero parts rise one after the other on load; a still page for reduced motion
const ENTRANCE_CLASSES = `
  animate-in duration-700 fade-in slide-in-from-bottom-4 fill-mode-backwards
  motion-reduce:animate-none
`;

type Props = {
  /**
   * The description, or its loading or error state
   */
  texts: ReactNode;
  /**
   * The main image of the light theme
   */
  image?: ReactNode;
  /**
   * The main image of the dark theme
   */
  imageDarkMode?: ReactNode;
  /**
   * The call to action under the description (the CV download)
   */
  action?: ReactNode;
};

const HomeHeroContainer = ({
  texts, image, imageDarkMode, action,
}: Props) => {
  return (
    <PageHeader
      description={<div className={cn(ENTRANCE_CLASSES, 'delay-150')}>{texts}</div>}
      image={image}
      imageDarkMode={imageDarkMode}
      title={APP_NAME}
      titleClassName={cn(ENTRANCE_CLASSES, '2xl:text-10xl!')}
      className={`
        md:pb-8
        xl:pb-10
        2xl:pb-10
      `}
      mainClassName={cn(
        ENTRANCE_CLASSES,
        `
          mb-[30px] flex flex-row delay-300
          md:mt-12 md:mb-[50px]
        `
      )}
    >
      {action}
    </PageHeader>
  );
};

export default HomeHeroContainer;
