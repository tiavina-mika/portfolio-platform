import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import DownloadCV from '@/containers/home/download/DownloadCV';

/**
 * The CV download button of the desktop bar (server slot, used inside a Suspense boundary)
 */
const NavBarCvButton = () => {
  const t = useTranslations('App');

  return (
    <DownloadCV
      className="max-2xl:w-11 max-2xl:px-0"
      componentType="button"
      variant="outline"
    >
      <Download aria-hidden size={18} />
      <span className="max-2xl:sr-only">{t('downloadCV')}</span>
    </DownloadCV>
  );
};

export default NavBarCvButton;
