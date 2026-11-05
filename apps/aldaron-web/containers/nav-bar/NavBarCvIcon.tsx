import { useTranslations } from 'next-intl';

import NextIcon from '@/components/NextIcon';
import DownloadCV from '@/containers/home/download/DownloadCV';

/**
 * The icon-only CV download button of the mobile bar (server slot, used inside a Suspense boundary)
 */
const NavBarCvIcon = () => {
  const t = useTranslations('App');

  return (
    <DownloadCV
      className="flex flex-col items-center justify-center"
      componentType="icon"
    >
      <NextIcon
        alt=""
        aria-hidden="true"
        size={32}
        src="/icons/download.svg"
        className={`
          block
          dark:hidden
        `}
      />
      <NextIcon
        alt=""
        aria-hidden="true"
        size={32}
        src="/icons/download-dark.svg"
        className={`
          hidden
          dark:block
        `}
      />
      <span className="sr-only">{t('downloadCV')}</span>
    </DownloadCV>
  );
};

export default NavBarCvIcon;
