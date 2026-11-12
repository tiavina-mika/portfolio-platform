import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import DownloadCV from '@/containers/home/download/DownloadCV';

/**
 * The icon-only CV download button of the mobile bar (server slot, used inside a Suspense boundary)
 */
const NavBarCvIcon = () => {
  const t = useTranslations('App');

  return (
    <DownloadCV componentType="icon">
      <Download aria-hidden size={20} />
      <span className="sr-only">{t('downloadCV')}</span>
    </DownloadCV>
  );
};

export default NavBarCvIcon;
