'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { cn } from '@/utils/app.utils';

import IconButton from './buttons/IconButton';

const subscribeToNothing = () => () => undefined;

type Props = {
  className?: string;
};

/**
 * Switches between the light and dark themes. The icon and the name are those of the theme a click
 * leads to: a moon ("Dark") on a light page, a sun ("Light") on a dark one.
 */
const ToggleTheme = ({ className }: Props) => {
  const t = useTranslations('NavBar');
  const { resolvedTheme, setTheme } = useTheme();
  /*
   * the server does not know the visitor's theme: the name follows it once mounted in the browser,
   * while the icons follow it from the first paint through CSS
   */
  const isMounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const isDark = isMounted && resolvedTheme === 'dark';
  const label = isDark ? t('lightTheme') : t('darkTheme');

  return (
    <IconButton
      aria-label={label}
      className={cn('border-input', className)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={label}
    >
      <Moon
        aria-hidden
        size={20}
        className={`
          stroke-2
          dark:hidden
        `}
      />
      <Sun
        aria-hidden
        size={20}
        className={`
          hidden stroke-2
          dark:block
        `}
      />
    </IconButton>
  );
};

export default ToggleTheme;
