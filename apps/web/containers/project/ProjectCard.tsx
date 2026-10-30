import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/buttons/Button';
import TextLink from '@/components/typography/TextLink';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from '@/components/ui/Card';
import { cn } from '@/utils/app.utils';

export type ProjectCardData = {
  id: string;
  name: string;
  description: string;
  /**
   * Address of the project page
   */
  href: any;
  /**
   * The preview picture, sized for the device. Without it the card has no picture
   */
  imageUrl?: string;
  /**
   * Text alternative of the picture
   */
  imageAlt?: string;
};

/**
 * A project of the portfolio as a card with one click zone: the name is the link and is stretched over
 * the whole card, so the link is named by the project alone. The "see more" button is only a cue.
 */
const ProjectCard = ({
  name, description, href, imageUrl, imageAlt,
}: ProjectCardData) => {
  const t = useTranslations('Common');

  return (
    <Card className={`
      group relative gap-5
      lg:gap-0
    `}
    >
      <CardHeader>
        {imageUrl && (
          <CardImage
            alt={imageAlt || ''}
            loading="lazy"
            objectSize="scale-down"
            src={imageUrl}
          />
        )}
      </CardHeader>
      <CardContent>
        <CardTitle level={5}>
          <TextLink
            href={href}
            underline={false}
            useChildSpan={false}
            className={`
              group-hover:text-info-light group-hover:underline
              after:absolute after:inset-0 after:content-['']
              focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring
            `}
          >
            {name}
          </TextLink>
        </CardTitle>
        <CardDescription size="md">{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-1 items-end self-stretch">
        <span
          aria-hidden
          className={cn(
            buttonVariants({ variant: 'contained', color: 'primary', size: 'md' }),
            'w-full text-center'
          )}
        >
          {t('seeMore')}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
