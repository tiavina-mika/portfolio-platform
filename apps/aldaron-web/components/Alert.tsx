'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useState } from 'react';


import { cn } from '@/utils/app.utils';

import { ButtonProps } from './buttons/Button';
import IconButton from './buttons/IconButton';
import NextIcon from './NextIcon';

export const alertVariants = cva('rounded-md p-3 font-primary', {
  variants: {
    variant: {
      contained: 'text-white',
      outlined: '',
    },
    color: {
      success: '',
      error: '',
      info: '',
      warning: '',
    },
  },
  compoundVariants: [
    {
      variant: 'contained',
      color: 'error',
      class: 'bg-error',
    },
    {
      variant: 'contained',
      color: 'success',
      class: 'bg-success',
    },
    {
      variant: 'contained',
      color: 'info',
      class: 'bg-info',
    },
    {
      variant: 'contained',
      color: 'warning',
      class: 'bg-warning',
    },
    // outlined
    {
      variant: 'outlined',
      color: 'error',
      class: 'bg-error-light text-error',
    },
    {
      variant: 'outlined',
      color: 'success',
      class: 'bg-success-light text-success',
    },
    {
      variant: 'outlined',
      color: 'info',
      class: 'bg-info-light text-info',
    },
    {
      variant: 'outlined',
      color: 'warning',
      class: 'bg-warning-light text-warning',
    },
  ],
});

export type AlertProps = {
  message: string;
  className?: string;
  open?: boolean;
  canBeClosed?: boolean;
} & Pick<ButtonProps, 'variant' | 'color'> &
VariantProps<typeof alertVariants>;

const Alert = ({
  message,
  className,
  variant = 'contained',
  color = 'info',
  canBeClosed = true,
  open = true,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    setIsVisible(open);
  }, [open]);

  const onClose = () => setIsVisible(false);

  return (
    <div
      className={cn(
        alertVariants({ variant, color }),
        isVisible ? 'flex' : 'hidden',
        'flex-row items-center justify-between',
        className
      )}
    >
      {message}
      {canBeClosed && (
        <IconButton noHovered className="p-1" onClick={onClose}>
          <NextIcon
            size={16}
            src={
              variant === 'contained' ? '/icons/x2-white.svg' : '/icons/x2.svg'
            }
          />
        </IconButton>
      )}
    </div>
  );
};

export default Alert;
