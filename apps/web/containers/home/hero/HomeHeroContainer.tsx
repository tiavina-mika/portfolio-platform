/**
 * The layout of the home hero, props only: used by HomeHero (which streams the database parts into it)
 */
import { ReactNode } from 'react';

import PageHeader from '@/components/layouts/PageHeader';
import { APP_NAME } from '@/utils/constants';

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
      description={texts}
      image={image}
      imageDarkMode={imageDarkMode}
      mainClassName="mb-[30px] md:mb-[50px] md:mt-12 flex flex-row"
      title={APP_NAME}
      titleClassName="2xl:text-10xl!"
      className={`
        md:pb-8
        xl:pb-10
        2xl:pb-10
      `}
    >
      {action}
    </PageHeader>
  );
};

export default HomeHeroContainer;
