/* eslint-disable better-tailwindcss/no-unregistered-classes */
'use client';

import FadeInImage from '@/components/FadeImage';
import { cn } from '@/utils/app.utils';
import { APP_NAME } from '@/utils/constants';

type Props = {
  // image to display in the right side (path of the image)
  image: string | undefined;
  // if the image should be displayed in mobile
  displayInMobile?: boolean;
  theme?: 'light' | 'dark';
  displayInAllTheme?: boolean;
  className?: string;
};
const AnimatedPageHeaderImage = ({
  image,
  className,
  theme = 'light',
  displayInMobile = true,
  displayInAllTheme = false,
}: Props) => {
  if (!image) return null;
  return (
    <div
      className={cn(
        `
          mb-8 flex-1 flex-col items-center
          md:mb-0
        `,
        /*
         * display dark image in dark mode and light image in light mode
         * theme === 'dark' ? 'hidden dark:flex' : 'flex dark:hidden',
         */
        {
          // display image in all theme
          'hidden dark:flex': !displayInAllTheme && theme === 'dark',
          'flex dark:hidden': !displayInAllTheme && theme === 'light',
        }
      )}
    >
      {/* image is animated when first load */}
      <FadeInImage
        priority
        alt={APP_NAME}
        className={cn('relative h-full w-auto object-contain', className)}
        height={400}
        src={image}
        width={400}
        rootClassName={cn(
          `
            2xl:[45vw]
            w-full justify-center
            md:flex md:w-[60vw] md:flex-row
            lg:w-[700px]
            xl:w-[42vw] xl:pt-12
          `,
          displayInMobile ? 'flex' : 'hidden'
        )}
      />
    </div>
  );
};

export default AnimatedPageHeaderImage;
