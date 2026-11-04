import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/Skeleton';

// a title and three link rows, the size of the loaded group
const SitemapGroupLoading = () => {
  const t = useTranslations('Sitemap');

  return (
    <div aria-label={t('loading')} className="flex flex-col gap-3 self-stretch" role="status">
      <Skeleton aria-hidden="true" className="h-8 w-24" />
      <Skeleton aria-hidden="true" className="h-8 w-full" />
      <Skeleton aria-hidden="true" className="h-8 w-full" />
      <Skeleton aria-hidden="true" className="h-8 w-full" />
    </div>
  );
};

export default SitemapGroupLoading;
