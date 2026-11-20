'use client';

import { useTranslations } from 'next-intl';

import LegalSkeleton from '@/containers/legal/LegalSkeleton';

const LegalLoading = () => {
  const t = useTranslations('Common');

  return <LegalSkeleton label={t('loading')} />;
};

export default LegalLoading;
