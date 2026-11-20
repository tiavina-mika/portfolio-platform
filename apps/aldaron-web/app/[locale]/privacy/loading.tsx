'use client';

import { useTranslations } from 'next-intl';

import LegalSkeleton from '@/containers/legal/LegalSkeleton';

const PrivacyLoading = () => {
  const t = useTranslations('Common');

  return <LegalSkeleton label={t('loading')} />;
};

export default PrivacyLoading;
