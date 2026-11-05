import { useTranslations } from 'next-intl';

import StatusBanner from '@/components/StatusBanner';

type Props = {
  isOnline: boolean;
  onRetry: () => void;
};

/**
 * Replaces the description when it cannot be loaded: a banner says so with an icon and a text, with a
 * button that loads it again (a notice only when the device is offline)
 */
const HomeHeroTextsError = ({ isOnline, onRetry }: Props) => {
  const t = useTranslations('HomeHero');
  const tCommon = useTranslations('Common');

  if (!isOnline) return <StatusBanner variant="offline">{t('offline')}</StatusBanner>;

  return (
    <StatusBanner onRetry={onRetry} retryLabel={tCommon('tryAgain')} variant="error">
      {t('error')}
    </StatusBanner>
  );
};

export default HomeHeroTextsError;
