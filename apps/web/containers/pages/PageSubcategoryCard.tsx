import { Card, CardImage } from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { Link as TranslatedLink } from '@/i18n/routing';
import { ICategory } from '@/types/cms.type';
import { goToSubcategory } from '@/utils/cms.utils';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  parentCategory: ICategory;
  subcategory: ICategory;
  locale: Locale;
};

/**
 * A subcategory as one link named by its name: the picture on top, the name under it, the link
 * stretched over the whole card
 */
const PageSubcategoryCard = ({ parentCategory, subcategory, locale }: Props) => {
  const name = getTranslatedField(subcategory.translated, locale, 'name');

  return (
    <Card className="group relative" withShadow={false}>
      {/* the name under the picture says what the link is */}
      {subcategory.image?.url ? (
        <CardImage
          alt=""
          src={subcategory.image.url}
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
      <TranslatedLink
        href={goToSubcategory(parentCategory, subcategory, locale)}
        className={`
          text-base font-medium no-underline decoration-[1.5px] underline-offset-4
          after:absolute after:inset-0 after:content-['']
          hover:text-info-light hover:underline
          focus-visible:rounded-md focus-visible:outline-3 focus-visible:outline-offset-4
          focus-visible:outline-ring
          md:text-xl
        `}
      >
        {name}
      </TranslatedLink>
    </Card>
  );
};

export default PageSubcategoryCard;
