import { useTranslations } from 'next-intl';

import { APP_SHORT_NAME } from '@/utils/constants';

import LanguageSwitcher from '../languages/LanguageSwitcher';
import Text from '../typography/Text';

/*
 * read once at module load (build/deploy time), not per-render — `cacheComponents` treats
 * `new Date()` read during render as an unstable blocking value, and a copyright year only
 * needs to be correct as of the last deploy, not per-request
 */
const currentYear = new Date().getFullYear();

/**
 * The bottom bar of the footer: the copyright and the language switcher
 */
const FooterBottom = () => {
  const t = useTranslations('Footer');

  return (
    <div
      className={`
        mt-[20px] mb-[30px] flex flex-1 flex-col justify-between gap-2
        md:my-[15px] md:flex-row md:items-center md:gap-0
        xl:mt-[31px] xl:mb-[40px]
      `}
    >
      <Text className={`
        text-sm
        md:text-base
      `}
      >
        {APP_SHORT_NAME} © {currentYear}.{' '}
        {t('allRightsReserved')}.
      </Text>
      <LanguageSwitcher className="w-[110px]!" inputClassName="border-none" />
    </div>
  );
};

export default FooterBottom;
