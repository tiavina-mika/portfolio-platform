import { useId } from 'react';

import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import { CardImage } from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { ISectionBlockObj } from '@/types/cms.type';
import { cn } from '@/utils/app.utils';
import { getTranslatedField } from '@/utils/translation.utils';

import ReadOnlyTextCodeEditor from '../articles/ReadOnlyTextCodeEditor';

type Props = {
  title: string;
  description: string;
  blocks: ISectionBlockObj[];
  locale: Locale;
};

type ImagePosition = ISectionBlockObj['imagePosition'];

/*
 * The image is always read first on a phone. From lg, left and right put the two columns side by
 * side (the image on its side), top and bottom stay one column at every width, the image before or
 * after the text.
 */
const TEXT_ORDER_CLASSES: Record<ImagePosition, string> = {
  right: 'order-2 lg:order-1',
  left: 'order-2',
  top: 'order-2',
  bottom: 'order-1',
};

const IMAGE_ORDER_CLASSES: Record<ImagePosition, string> = {
  right: 'order-1 lg:order-2',
  left: 'order-1',
  top: 'order-1',
  bottom: 'order-2',
};

/**
 * One section of a CMS page: its title (h2) and description, then its blocks, each a title (h3), a
 * description, a rich text and an image
 */
const PageBlocks = ({
  title, description, blocks, locale,
}: Props) => {
  const titleId = useId();

  return (
    <Section
      aria-labelledby={titleId}
      as="section"
      size="lg"
      className={`
        flex-col gap-6
        md:gap-8
        lg:gap-14
      `}
      rootClassName={`
        mt-6
        md:mt-14
        lg:mt-24
      `}
    >
      <div className={`
        flex flex-col gap-3
        md:max-w-3xl
      `}
      >
        <Title id={titleId} level={2}>{title}</Title>
        {description && <Text size="lg">{description}</Text>}
      </div>

      <div className={`
        flex flex-col gap-10 self-stretch
        md:gap-12
        xl:gap-20
      `}
      >
        {blocks.map((block, index) => {
          const blockTitle = getTranslatedField(block.translated, locale, 'title');
          const blockDescription = getTranslatedField(block.translated, locale, 'description');
          const imagePosition = block.imagePosition;
          // above or below the text: the block is one column at every width
          const isStacked = imagePosition === 'top' || imagePosition === 'bottom';

          return (
            <div
              key={block.id + index}
              className={cn('flex flex-col gap-6', {
                'lg:flex-row': !isStacked,
              })}
            >
              <div
                className={cn(
                  `
                    flex flex-1 flex-col gap-3
                    lg:justify-center lg:gap-6
                  `,
                  TEXT_ORDER_CLASSES[imagePosition]
                )}
              >
                <div className="flex flex-col gap-2">
                  <Title level={3}>{blockTitle}</Title>
                  {blockDescription && <Text size="lg">{blockDescription}</Text>}
                </div>
                <ReadOnlyTextCodeEditor
                  content={getTranslatedField(block.translated, locale, 'content')}
                />
              </div>
              <div
                className={cn(
                  'flex flex-1 flex-col items-center justify-center',
                  IMAGE_ORDER_CLASSES[imagePosition]
                )}
              >
                <CardImage
                  alt={blockTitle}
                  src={block.image?.url}
                  containerClassName={cn({
                    'md:h-[350px]! md:w-[70%] lg:w-[90%]': !isStacked,
                    'md:h-[380px]! md:w-[50%]': isStacked,
                  })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default PageBlocks;
