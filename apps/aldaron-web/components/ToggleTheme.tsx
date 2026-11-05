'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import * as React from 'react';


import { cn } from '@/utils/app.utils';

import IconButton from './buttons/IconButton';
import NextIcon from './NextIcon';

type Props = {
  className?: string;
};
const ToggleTheme = ({ className }: Props) => {
  const t = useTranslations('NavBar');
  const { theme, setTheme } = useTheme();

  return (
    <IconButton
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={cn(
        `
          relative cursor-pointer rounded-md border border-gray-100! p-2
          dark:border-secondary-dark!
        `,
        className
      )}
    >
      <NextIcon
        alt=""
        aria-hidden="true"
        size={19}
        src="/icons/sun.svg"
        className={`
          scale-100 rotate-0 transition-all
          dark:scale-0 dark:-rotate-90
        `}
      />
      <NextIcon
        alt=""
        aria-hidden="true"
        size={24}
        src="/icons/moon.svg"
        className={`
          absolute top-[5px] left-[5px] scale-0 rotate-90 transition-all
          dark:scale-100 dark:rotate-0
        `}
      />

      <span className="sr-only">{t('toggleTheme')}</span>
    </IconButton>
  );
};

export default ToggleTheme;
