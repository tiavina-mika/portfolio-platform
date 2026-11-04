import { useTranslations } from 'next-intl';

import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import { CardTitle } from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { ICategory, IPage } from '@/types/cms.type';
import { goToSubcategory } from '@/utils/cms.utils';
import { getTranslatedField } from '@/utils/translation.utils';

import Pages from './Pages';

type Props = {
  parentCategory: ICategory;
  subcategory: ICategory;
  pages: IPage[];
  total: number;
  locale: Locale;
};

/*
 * nested under its parent's "sub category 1" heading, one level to the right, and titled the
 * same as a page card (never a section-level Title) so it reads as content, not a new section
 */
const PageSubcategoryPreview = ({
  parentCategory, subcategory, pages, total, locale,
}: Props) => {
  const t = useTranslations('Page');
  const name = getTranslatedField(subcategory.translated, locale, 'name');
  const link = goToSubcategory(parentCategory, subcategory, locale);
  const hasMorePages = total > pages.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <CardTitle href={link}>{name}</CardTitle>
        {hasMorePages && <TextLink href={link}>{t('viewAll')}</TextLink>}
      </div>
      {pages.length > 0 ? (
        <div className={`
          pl-4
          md:pl-6
        `}
        >
          <Pages isStandalone={false} locale={locale} pages={pages} />
        </div>
      ) : (
        <Text className={`
          pl-4
          md:pl-6
        `}
        >{t('noPagesYet')}</Text>
      )}
    </div>
  );
};

export default PageSubcategoryPreview;
