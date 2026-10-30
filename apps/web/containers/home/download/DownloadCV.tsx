/**
 * SSR container for the download button (CSR)
 * this component should be used inside a suspense boundary
 */
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { getCachedApp } from '@/app/[locale]/page';

import DownloadCVButton, { type DownloadCVButtonProps } from './DownloadCVButton';

type Props = {
  // override the required children prop
  children?: ReactNode;
} & Omit<DownloadCVButtonProps, 'publicId' | 'children'>;

const DownloadCV = async ({ children, className, ...rest }: Props) => {
  const t = await getTranslations('App');
  const app = await getCachedApp();

  if (!app?.cv) return null;

  return (
    <DownloadCVButton
      className={className}
      publicId={app.cv.publicId}
      {...rest}
    >
      {children || t('downloadMyCV')}
    </DownloadCVButton>
  );
};

export default DownloadCV;
