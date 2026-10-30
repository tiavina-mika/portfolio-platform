import { CategoryEntityEnum } from '@shared/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';


import SitemapGroup from '@/containers/sitemaps/SitemapGroup';
import { Locale } from '@/i18n/config';
import { getCategoriesForUrls } from '@/server/queries/category.queries';
import { ICategory } from '@/types/cms.type';
import { goToItemsByCategory } from '@/utils/cms.utils';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

const SitemapCategoriesSlot = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const t = await getTranslations('Article');
  const categories = await getCategoriesForUrls();

  /*
   * each category entity has its own url
   * ex: article, page, ...
   */
  const renderItemUrl = (item: ICategory) => {
    const pathname = item.entity === CategoryEntityEnum.ARTICLE ? 'articles' : 'pages';

    return goToItemsByCategory(item.translated, locale, pathname);
  };

  return (
    <SitemapGroup<ICategory>
      items={categories || []}
      renderItemUrl={renderItemUrl}
      title={t('categories')}
      renderItemLinkText={item =>
        getTranslatedField(item.translated, locale, 'name') || ''}
    />
  );
};

export default SitemapCategoriesSlot;
