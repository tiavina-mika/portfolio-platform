import { getTranslations } from 'next-intl/server';

import SitemapGroup from '@/containers/sitemaps/SitemapGroup';
import { Locale } from '@/i18n/config';
import { getDataForUrls } from '@/server/queries/app.queries';
import { IArticle } from '@/types/article.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { collections } from '@/utils/constants';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

const SitemapArticlesSlot = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  const t = await getTranslations('Article');
  const items = await getDataForUrls<IArticle>(collections.Article);

  return (
    <SitemapGroup<IArticle>
      items={items || []}
      title={t('articles')}
      renderItemLinkText={item =>
        getTranslatedField(item.get('translated'), locale, 'title') || ''}
      renderItemUrl={item =>
        goToItemBySlug(item.get('translated'), locale, 'articles')}
    />
  );
};

export default SitemapArticlesSlot;
