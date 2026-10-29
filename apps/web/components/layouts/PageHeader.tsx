import { ReactNode } from 'react';

import Section, { SectionProps } from '@/components/layouts/Section';
import { cn } from '@/utils/app.utils';

import AnimatedPageHeaderImage from './AnimatedPageHeaderImage';
import PageDescription from '../typography/PageDescription';
import PageTitle from '../typography/PageTitle';

type Props = {
  children?: ReactNode;
  // the main title of the page
  title: string;
  /**
   * it's displayed under the title
   * it can be a text or a component
   */
  description?: any;
  /**
   * image to display in the right side
   * can be a path or url of the image or a component
   */
  image?: string | ReactNode;
  /**
   * image to display in the right side in dark mode
   * can be a path or url of the image or a component
   */
  imageDarkMode?: string | ReactNode;
  className?: string;
  titleClassName?: string;
  // if the image should be displayed in mobile
  displayInMobile?: boolean;
  textContainerClassName?: string;
  contentClassName?: string;
  /**
   * class name of the children container
   */
  mainClassName?: string;
  /**
   * direction of the image and text
   * row: image in the right side of the text
   * col: image in the bottom of the text
   */
  direction?: 'row' | 'col';
} & Pick<SectionProps, 'fullWidth' | 'size'>;
const PageHeader = ({
  title,
  description,
  children,
  image,
  className,
  displayInMobile = true,
  textContainerClassName,
  contentClassName,
  mainClassName,
  imageDarkMode,
  fullWidth,
  titleClassName,
  direction = 'row',
  size = 'xl',
}: Props) => {
  return (
    <Section
      as="header"
      fullWidth={fullWidth}
      size={size}
      className={cn(
        className,
        `
          flex flex-col items-center justify-between
          max-xl:gap-3
        `,
        direction === 'row' ? 'xl:flex-row' : ''
      )}
    >
      {/* ---------------------------- */}
      {/* ----------- text ----------- */}
      {/* ---------------------------- */}
      <div
        className={cn(
          `
            mt-[12px] flex flex-row justify-center self-stretch
            md:mt-[40px] md:mb-[80px]
            lg:mb-[60px]
            xl:mt-[50px]
          `,
          !description && !children
            ? `
              mb-0
              xl:mb-[50px]
            `
            : `
              mb-2
              md:mb-[60px]
              xl:mb-[10px]
            `,
          contentClassName
        )}
      >
        <div
          className={cn(
            'flex flex-col justify-center',
            textContainerClassName,
            image && direction === 'row'
              ? `
                max-xl:flex-1
                xl:w-[40vw]
                2xl:w-[800px]
              `
              : 'w-full flex-1'
          )}
        >
          <div>
            {/* main title of the page */}
            <PageTitle className={titleClassName}>{title}</PageTitle>
            {/* description of the page, may be text or component */}
            <PageDescription>{description}</PageDescription>
          </div>

          {/* if has children */}
          {children && (
            <div className={cn(`
              mt-10 flex-row
              md:mt-[54px]
            `, mainClassName)}
            >
              {children}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------- */}
      {/* ---------- images ---------- */}
      {/* ---------------------------- */}
      <div
        className={cn('flex self-stretch', {
          'max-md:mt-4 md:max-xl:mb-16':
            displayInMobile && (image || imageDarkMode),
          'lg:mt-8': direction === 'col' && (image || imageDarkMode),
        })}
      >
        {/* dark image and light image */}
        {/* if it a component, it's passed as a props */}
        {typeof image === 'string' ? (
          <AnimatedPageHeaderImage
            displayInAllTheme
            displayInMobile={displayInMobile}
            image={image}
            theme="light"
          />
        ) : (
          image
        )}
        {typeof imageDarkMode === 'string' ? (
          <AnimatedPageHeaderImage
            displayInMobile={displayInMobile}
            image={imageDarkMode}
            theme="dark"
          />
        ) : (
          imageDarkMode
        )}
      </div>
    </Section>
  );
};

export default PageHeader;
