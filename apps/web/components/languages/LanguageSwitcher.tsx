'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Locale, locales } from '@/i18n/config';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/utils/app.utils';
import { LOCALE_NATIVE_NAMES } from '@/utils/constants';

import Select, { SelectProps } from '../forms/inputs/Select';

type Props = {
  /**
   * Shows the flag of each language before its name
   * @default false
   */
  withIcon?: boolean;
} & Omit<SelectProps, 'options' | 'value' | 'onChange'>;

/**
 * The language select: choosing a language swaps the locale of the current page.
 * Each language is written in its own language.
 */
const LanguageSwitcher = ({ withIcon = false, className, ...props }: Props) => {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const options = locales.map((value: Locale) => ({
    label: LOCALE_NATIVE_NAMES[value],
    value,
    icon: withIcon ? `/icons/flags/${value}.svg` : '',
  }));

  const handleChange = (value: Locale) => {
    if (value === locale) return;

    startTransition(() => {
      router.replace({ pathname: pathname as string, params } as any, { locale: value });
    });
  };

  return (
    <div aria-label={t('label')} className="contents" role="group">
      <Select
        {...props}
        className={cn({ 'transition-opacity [&:disabled]:opacity-30': isPending }, className)}
        onChange={handleChange}
        options={options}
        value={locale}
      />
    </div>
  );
};

export default LanguageSwitcher;
