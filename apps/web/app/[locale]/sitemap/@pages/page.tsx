import { getTranslations } from 'next-intl/server';

import SitemapGroup from '@/containers/sitemaps/SitemapGroup';
import { Locale } from '@/i18n/config';
import { getDataForUrls } from '@/server/queries/app.queries';
import { IPage } from '@/types/cms.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { collections } from '@/utils/constants';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

const SitemapPagesSlot = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  const t = await getTranslations('Page');
  const items = await getDataForUrls<IPage>(collections.Page);

  return (
    <SitemapGroup<IPage>
      items={items || []}
      title={t('pages')}
      renderItemLinkText={item =>
        getTranslatedField(item.get('translated'), locale, 'name') || ''}
      renderItemUrl={item =>
        goToItemBySlug(item.get('translated'), locale, 'pages')}
    />
  );
};

export default SitemapPagesSlot;
