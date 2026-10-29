import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import { CardImage } from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { cn } from '@/utils/app.utils';
import { getTranslatedField } from '@/utils/translation.utils';

import ReadOnlyTextCodeEditor from '../articles/ReadOnlyTextCodeEditor';

type Props = {
  title: string;
  description: string;
  blocks: any[];
  locale: Locale;
};
const PageBlocks = ({
  title, description, blocks, locale,
}: Props) => {
  return (
    <div className={`
      flex flex-col gap-6
      md:gap-8
      lg:gap-14
    `}
    >
      <div>
        <div className={`
          flex flex-col gap-3
          md:max-w-3xl
        `}
        >
          <Title level={2}>{title}</Title>
          {description && (
            <div>
              <Text size="lg">{description}</Text>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------- */}
      {/* ------------- blocks ------------- */}
      {/* ---------------------------------- */}
      <div className={`
        flex flex-col gap-10 self-stretch
        md:gap-12
        xl:gap-20
      `}
      >
        {blocks.map((block, index) => {
          const title = getTranslatedField(
            block.get('translated'),
            locale,
            'title'
          );
          const description = getTranslatedField(
            block.get('translated'),
            locale,
            'description'
          );
          const imagePosition = block.get('imagePosition');

          return (
            <div
              key={block.id + index}
              className={cn('flex', {
                'flex-col': imagePosition === 'bottom',
                'flex-col gap-6 lg:flex-row': imagePosition !== 'bottom',
              })}
            >
              {/* ---------------------------------- */}
              {/* ----------- text (left) ---------- */}
              {/* ---------------------------------- */}
              <div
                className={cn(
                  `
                    flex flex-1 flex-col gap-3
                    lg:justify-center lg:gap-6
                  `,
                  {
                    'flex-col': imagePosition === 'left',
                  }
                )}
              >
                <div className="flex flex-col gap-2">
                  <Title level={4}>{title}</Title>
                  {description && <Text size="lg">{description}</Text>}
                </div>
                <ReadOnlyTextCodeEditor
                  content={getTranslatedField(
                    block.get('translated'),
                    locale,
                    'content'
                  )}
                />
              </div>
              {/* ---------------------------------- */}
              {/* ----------- image (right) ---------- */}
              {/* ---------------------------------- */}
              <div
                className={cn(
                  'flex flex-1 flex-col items-center justify-center',
                  {
                    'lg:-order-1': imagePosition === 'left',
                    'mt-4': imagePosition === 'bottom',
                  }
                )}
              >
                <CardImage
                  alt={title}
                  src={block.get('image')?.url}
                  containerClassName={cn({
                    'md:h-[350px]! md:w-[70%] lg:w-[90%]':
                      imagePosition !== 'bottom',
                    'md:h-[380px]! md:w-[50%]': imagePosition === 'bottom',
                  })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PageBlocks;
