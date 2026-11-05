'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { cn } from '@/utils/app.utils';

import IconButton from './buttons/IconButton';

type Props = {
  className?: string;
};
const ToggleTheme = ({ className }: Props) => {
  const t = useTranslations('NavBar');
  const { theme, setTheme } = useTheme();

  return (
    <IconButton
      aria-label={t('toggleTheme')}
      className={cn('border-input', className)}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun
        aria-hidden
        className="dark:hidden"
        size={18}
      />
      <Moon
        aria-hidden
        size={18}
        className={`
          hidden
          dark:block
        `}
      />
    </IconButton>
  );
};

export default ToggleTheme;
