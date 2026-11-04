import Title from '@/components/typography/Title';
import {
  Card, CardContent, CardDescription, CardImage,
} from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { Link as TranslatedLink } from '@/i18n/routing';
import { IPage } from '@/types/cms.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  page: IPage;
  locale: Locale;
  /**
   * The level of the name: 3 under the h2 of a list, 4 inside a block that has its own h3
   * @default 3
   */
  titleLevel?: 3 | 4;
};

/**
 * A CMS page as a fully clickable card: the banner, the name and the short description. One click
 * zone, the name link stretched over the whole card, so the link is named by the name alone.
 */
const PageCard = ({ page, locale, titleLevel = 3 }: Props) => {
  const translated = page.translated;
  const name = getTranslatedField(translated, locale, 'name');
  const description = getTranslatedField(translated, locale, 'description');

  return (
    <Card as="article" className="group relative" withShadow={false}>
      {/* the banner repeats the name written under it: a screen reader would say it twice */}
      {page.bannerImage?.url ? (
        <CardImage
          alt=""
          src={page.bannerImage.url}
          className={`
            transition-all delay-150 ease-in-out
            group-hover:scale-105
            motion-reduce:transition-none motion-reduce:group-hover:scale-100
          `}
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
        <Title
          gutterBottom={false}
          level={titleLevel}
          className={`
            text-base leading-normal font-medium
            md:text-xl
          `}
        >
          <TranslatedLink
            href={goToItemBySlug(translated, locale, 'pages')}
            className={`
              text-inherit no-underline decoration-[1.5px] underline-offset-4
              after:absolute after:inset-0 after:content-['']
              hover:text-info-light hover:underline
              focus-visible:rounded-md focus-visible:outline-3 focus-visible:outline-offset-4
              focus-visible:outline-ring
            `}
          >
            {name}
          </TranslatedLink>
        </Title>
        {description && <CardDescription>{description}</CardDescription>}
      </CardContent>
    </Card>
  );
};

export default PageCard;
