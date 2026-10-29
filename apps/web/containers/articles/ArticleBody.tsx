import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import { CardImage } from '@/components/ui/Card';

import ReadOnlyTextCodeEditor from './ReadOnlyTextCodeEditor';

type Props = {
  /**
   * Title of the article: the text alternative of each gallery image, with its position
   */
  title: string;
  /**
   * The rich text of the article. Its headings start at h2: the h1 is the title in the header
   */
  content?: string;
  /**
   * Images shown in a grid under the text
   */
  images?: { url: string }[];
};

/**
 * The reading area of an article: the text of the CMS, then the images of the article in a grid
 */
const ArticleBody = ({ title, content = '', images = [] }: Props) => {
  const t = useTranslations('Article');

  return (
    <Section
      as="article"
      className="flex-col gap-12"
      rootClassName="mt-6 lg:mt-8"
      size="md"
    >
      <ReadOnlyTextCodeEditor content={content} />

      {images.length > 0 && (
        <ul
          className={`
            grid list-none grid-cols-1 gap-8
            md:grid-cols-2
          `}
        >
          {images.map((image, index) => (
            <li key={image.url + index}>
              <CardImage
                containerClassName="h-[400px]!"
                src={image.url}
                alt={t('galleryImageAlt', {
                  title,
                  position: index + 1,
                  total: images.length,
                })}
              />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

export default ArticleBody;
