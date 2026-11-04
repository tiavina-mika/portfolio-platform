'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Locale, locales } from '@/i18n/config';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/utils/app.utils';
import { LOCALE_NATIVE_NAMES } from '@/utils/constants';

type Props = {
  className?: string;
};

/**
 * One button per language, side by side, the current one is pressed. Used where a select would hide
 * the choice behind a second tap (the open mobile menu). Each language is written in its own language.
 */
const LanguageButtons = ({ className }: Props) => {
  const t = useTranslations('LanguageSwitcher');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (locale: Locale) => {
    if (locale === currentLocale) return;

    startTransition(() => {
      router.replace({ pathname: pathname as string, params } as any, { locale });
    });
  };

  return (
    <div
      aria-label={t('label')}
      className={cn('flex gap-2', { 'opacity-60': isPending }, className)}
      role="group"
    >
      {locales.map((locale: Locale) => {
        const isCurrent = locale === currentLocale;

        return (
          <button
            aria-pressed={isCurrent}
            disabled={isPending}
            key={locale}
            lang={locale}
            onClick={() => changeLocale(locale)}
            type="button"
            className={cn(
              `
                inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md border px-2
                text-base transition-colors
                focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring
                motion-reduce:transition-none
              `,
              isCurrent
                ? 'border-foreground font-bold text-foreground'
                : `
                  border-input font-medium text-muted-foreground
                  hover:bg-muted
                `
            )}
          >
            {LOCALE_NATIVE_NAMES[locale]}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageButtons;
