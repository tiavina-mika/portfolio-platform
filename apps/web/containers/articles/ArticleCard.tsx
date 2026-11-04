import { ComponentProps } from 'react';

import Title from '@/components/typography/Title';
import {
  Card, CardContent, CardDescription, CardImage, CardSubtitle,
} from '@/components/ui/Card';
import { Link as TranslatedLink } from '@/i18n/routing';
import { cn } from '@/utils/app.utils';

export type ArticleCardData = {
  id: string;
  title: string;
  href: ComponentProps<typeof TranslatedLink>['href'];
  /**
   * The cover. Without it the card shows a plain placeholder of the same height
   */
  imageUrl?: string;
  /**
   * Name of the first category, shown above the title
   */
  category?: string;
  /**
   * Short text under the title
   */
  description?: string;
  /**
   * Publication date and reading time, e.g. `12 sept. 2026 · 4 min`
   */
  meta?: string;
};

type Props = ArticleCardData & {
  /**
   * `false` keeps the cover still on hover (the underline of the title stays)
   * @default true
   */
  animated?: boolean;
};

/**
 * An article of the blog as a fully clickable card: one click zone, the title link stretched over
 * the whole card, so the link is named by the title alone
 */
const ArticleCard = ({
  title, href, imageUrl, category, description, meta, animated = true,
}: Props) => {
  return (
    <Card as="article" className="group relative" withShadow={false}>
      {/* the cover carries no meaning of its own: the title says what the article is */}
      {imageUrl ? (
        <CardImage
          alt=""
          src={imageUrl}
          className={cn(animated && `
            transition-transform delay-150 duration-500 ease-in-out
            group-hover:scale-105
            motion-reduce:transition-none motion-reduce:group-hover:scale-100
          `)}
        />
      ) : (
        <div
          aria-hidden
          className={`
            h-[25vh] w-full rounded-lg bg-muted
            md:h-[250px]
          `}
        />
      )}
      <CardContent className="p-0!">
        {category && <CardSubtitle>{category}</CardSubtitle>}
        <Title
          gutterBottom={false}
          level={3}
          className={`
            text-base leading-normal font-medium
            md:text-xl
          `}
        >
          <TranslatedLink
            href={href}
            className={`
              text-inherit no-underline decoration-[1.5px] underline-offset-4
              after:absolute after:inset-0 after:content-['']
              hover:text-info-light hover:underline
              focus-visible:rounded-md focus-visible:outline-3 focus-visible:outline-offset-4
              focus-visible:outline-ring
            `}
          >
            {title}
          </TranslatedLink>
        </Title>
        {description && <CardDescription>{description}</CardDescription>}
        {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
