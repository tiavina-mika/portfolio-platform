import { ComponentProps } from 'react';

import { Breadcrumbs, BreadcrumbsSegment } from '@/components/Breadcrumbs';
import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';
import { CardDescription, CardImage } from '@/components/ui/Card';
import { Locale } from '@/i18n/config';

export type ArticleHeaderCategory = {
  name: string;
  /**
   * The blog list filtered on this category
   */
  href: ComponentProps<typeof TextLink>['href'];
};

type Props = {
  locale: Locale;
  breadcrumbs: BreadcrumbsSegment[];
  /**
   * Shown as links to the blog filtered on each category
   */
  categories: ArticleHeaderCategory[];
  title: string;
  description?: string;
  /**
   * Already translated and dated, e.g. `Published on Sep 12, 2026`
   */
  publishedOn: string;
  /**
   * Same as `publishedOn`: only given when the article changed since it was published
   */
  updatedOn?: string;
  /**
   * Already interpolated estimated reading time, e.g. `4 min read`
   */
  readingTime: string;
  /**
   * The cover. Without it the block is not rendered; its text alternative is the title
   */
  imageUrl?: string;
};

const SEPARATOR = (
  <span aria-hidden>·</span>
);

/**
 * The top of an article page: breadcrumbs, categories, the only h1 of the page (the title), the
 * description, the cover, then the dates with the reading time
 */
const ArticleHeader = ({
  locale, breadcrumbs, categories, title, description, publishedOn, updatedOn, readingTime, imageUrl,
}: Props) => {
  return (
    <Section
      as="header"
      className="flex-col gap-4"
      rootClassName="mt-4 md:mt-8 xl:mt-12"
      size="md"
    >
      <Breadcrumbs locale={locale} segments={breadcrumbs} />

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-1.5">
          {categories.map((category, index) => (
            <span className="flex items-center" key={category.name}>
              <TextLink
                href={category.href}
                underline={false}
                className={`
                  font-light
                  max-md:text-sm!
                `}
              >
                {category.name}
              </TextLink>
              {index < categories.length - 1 && (
                <span
                  aria-hidden
                  className={`
                    font-light
                    max-md:text-sm
                  `}
                >,</span>
              )}
            </span>
          ))}
        </div>
      )}

      <Title>{title}</Title>

      {description && <CardDescription>{description}</CardDescription>}

      {imageUrl && (
        <CardImage
          priority
          alt={title}
          containerClassName="sm:h-[300px] md:h-[400px] lg:h-[543px]"
          src={imageUrl}
        />
      )}

      <div className={`
        flex flex-wrap items-center gap-x-2.5 gap-y-1 self-stretch border-b border-b-dark-300 pb-3
        md:pb-4
      `}
      >
        <Text className={`
          text-sm font-light
          md:text-base
        `}
        >{publishedOn}</Text>
        {updatedOn && (
          <>
            {SEPARATOR}
            <Text className={`
              text-sm font-light
              md:text-base
            `}
            >{updatedOn}</Text>
          </>
        )}
        {SEPARATOR}
        <Text className={`
          text-sm font-light
          md:text-base
        `}
        >{readingTime}</Text>
      </div>
    </Section>
  );
};

export default ArticleHeader;
