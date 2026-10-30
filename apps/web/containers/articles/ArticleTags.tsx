import { useTranslations } from 'next-intl';
import { ComponentProps, useId } from 'react';

import Section from '@/components/layouts/Section';
import TextLink from '@/components/typography/TextLink';

export type ArticleTag = {
  label: string;
  /**
   * The blog list filtered on this tag
   */
  href: ComponentProps<typeof TextLink>['href'];
};

type Props = {
  tags: ArticleTag[];
};

/**
 * The keywords of an article as links to the blog filtered on each one. Nothing is rendered without
 * a tag.
 */
const ArticleTags = ({ tags }: Props) => {
  const t = useTranslations('Article');
  const titleId = useId();

  if (tags.length === 0) return null;

  return (
    <Section
      aria-labelledby={titleId}
      as="section"
      className="flex-col gap-3"
      rootClassName="mt-8 md:mt-12"
      size="md"
    >
      <div aria-hidden className="h-[5px] w-6 bg-foreground" />
      <div className={`
        flex flex-row gap-2
        md:gap-5
      `}
      >
        <h2
          id={titleId}
          className={`
            text-base font-medium
            max-sm:text-sm
          `}
        >{t('tags')}</h2>
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
          {tags.map((tag, index) => (
            <li className="flex" key={tag.label}>
              <TextLink
                href={tag.href}
                className={`
                  font-light
                  max-md:text-sm!
                `}
              >
                {tag.label}
              </TextLink>
              {index < tags.length - 1 && (
                <span
                  aria-hidden
                  className={`
                    font-light
                    max-md:text-sm
                  `}
                >,</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};

export default ArticleTags;
