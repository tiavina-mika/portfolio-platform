import { useTranslations } from 'next-intl';

import NextIcon from '@/components/NextIcon';
import DownloadCV from '@/containers/home/download/DownloadCV';

/**
 * The CV download button of the desktop bar (server slot, used inside a Suspense boundary)
 */
const NavBarCvButton = () => {
  const t = useTranslations('App');

  return (
    <DownloadCV
      componentType="button"
      variant="text"
      className={`
        flex flex-row items-center gap-2 rounded-md border! px-5 py-3 text-base font-medium
        max-2xl:px-2 max-2xl:py-1
        dark:bg-secondary dark:text-neutral-900! dark:hover:bg-secondary/90
      `}
    >
      <NextIcon
        alt=""
        aria-hidden="true"
        size={24}
        src="/icons/download.svg"
        className={`
          block
          dark:hidden
        `}
      />
      <NextIcon
        alt=""
        aria-hidden="true"
        size={24}
        src="/icons/download-dark.svg"
        className={`
          hidden
          dark:block
        `}
      />
      <span className="max-2xl:sr-only">{t('downloadCV')}</span>
    </DownloadCV>
  );
};

export default NavBarCvButton;
