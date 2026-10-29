import { useLocale, useTranslations } from 'next-intl';

import LanguageSwitcherSelect from '@/components/languages/LanguageSwitcherSelect';
import { Locale, locales } from '@/i18n/config';

import { SelectProps } from '../forms/inputs/Select';

type Props = {
  withIcon?: boolean;
} & Omit<SelectProps, 'options'>;
const LanguageSwitcher = ({ withIcon = false, ...props }: Props) => {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale() as Locale;

  const options = locales.map((locale: Locale) => ({
    label: t('locale', { locale }),
    value: locale,
    icon: withIcon ? `/icons/flags/${locale}.svg` : '',
  }));

  return (
    <LanguageSwitcherSelect
      {...props}
      defaultValue={locale}
      options={options}
    />
  );
};

export default LanguageSwitcher;
