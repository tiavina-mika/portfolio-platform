'use client';

import { ReactNode } from 'react';

import Button, { ButtonProps } from '@/components/buttons/Button';
import IconButton from '@/components/buttons/IconButton';
import { downloadFile } from '@/utils/utils';

export type DownloadCVButtonProps = {
  publicId: string;
  children: ReactNode;
  className?: string;
  componentType?: 'button' | 'icon';
} & Pick<ButtonProps, 'variant'>;

const DownloadCVButton = ({
  publicId,
  className,
  children,
  variant,
  componentType = 'button',
}: DownloadCVButtonProps) => {
  const handleDownload = () => {
    downloadFile({
      pathName: 'cv.pdf',
      data: { publicId },
    });
  };

  const ButtonComponent = componentType === 'button' ? Button : IconButton;

  return (
    <ButtonComponent
      className={className}
      onClick={handleDownload}
      variant={variant}
    >
      {children}
    </ButtonComponent>
  );
};

export default DownloadCVButton;
