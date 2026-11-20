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
 * One button per language, side by side (FR, EN, MG), the current one is pressed. Each button is named
 * by its language written in its own language.
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
      className={cn('flex gap-1', { 'opacity-60': isPending }, className)}
      role="group"
    >
      {locales.map((locale: Locale) => {
        const isCurrent = locale === currentLocale;

        return (
          <button
            aria-label={LOCALE_NATIVE_NAMES[locale]}
            aria-pressed={isCurrent}
            disabled={isPending}
            key={locale}
            lang={locale}
            onClick={() => changeLocale(locale)}
            type="button"
            className={cn(
              `
                inline-flex size-11 cursor-pointer items-center justify-center rounded-md border px-2.5
                font-mono text-xs font-medium tracking-[0.08em] transition-colors
                hover:bg-muted
                motion-reduce:transition-none
              `,
              isCurrent
                ? `
                  border-transparent bg-primary text-primary-foreground
                  hover:bg-primary-hover
                `
                : 'border-input bg-transparent text-muted-foreground'
            )}
          >
            {locale.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageButtons;
