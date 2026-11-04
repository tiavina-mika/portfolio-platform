'use client';

import { useTranslations } from 'next-intl';

import SitemapError from '@/containers/sitemaps/SitemapError';

type Props = {
  reset: () => void;
};

// the translations come from the `TranslationClientProvider` of the sitemap layout
const SitemapErrorBoundary = ({ reset }: Props) => {
  const t = useTranslations('Sitemap');

  return <SitemapError onRetry={reset} retryText={t('retry')} text={t('loadError')} />;
};

export default SitemapErrorBoundary;
