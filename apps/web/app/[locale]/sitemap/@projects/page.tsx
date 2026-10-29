import { getTranslations } from 'next-intl/server';

import SitemapGroup from '@/containers/sitemaps/SitemapGroup';
import { Locale } from '@/i18n/config';
import { getDataForUrls } from '@/server/queries/app.queries';
import { IProject } from '@/types/project.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { collections } from '@/utils/constants';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

const SitemapProjectsSlot = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  const t = await getTranslations('Project');
  const items = await getDataForUrls<IProject>(collections.Project);

  return (
    <SitemapGroup<IProject>
      items={items || []}
      title={t('projects')}
      renderItemLinkText={item =>
        getTranslatedField(item.get('translated'), locale, 'name') || ''}
      renderItemUrl={item =>
        goToItemBySlug(item.get('translated'), locale, 'projects')}
    />
  );
};

export default SitemapProjectsSlot;
