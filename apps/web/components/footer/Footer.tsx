
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { ISelectOption } from '@/types/app.type';
import { APP_SHORT_NAME, CONTACTS } from '@/utils/constants';

import LanguageSwitcher from '../languages/LanguageSwitcher';
import Section from '../layouts/Section';
import LogoSVG from '../LogoSVG';
import DynamicFooterPages from './DynamicFooterPages';
import FooterLink from './FooterLink';
import FooterQuote from './FooterQuote';
import FooterSkeleton from './FooterSkeleton';
import FooterTitle from './FooterTitle';
import Socials from './Socials';
import Text from '../typography/Text';
import { Skeleton } from '../ui/Skeleton';

type Props = {
  locale: Locale;
};

const Footer = async ({ locale }: Props) => {
  const t = await getTranslations('Footer');

  const defaultMenus: ISelectOption[] = [
    { label: t('contactMe'), value: ROUTES.contact },
    { label: t('myProjects'), value: '/' },
    { label: t('siteMap'), value: ROUTES.sitemap },
  ];

  return (
    <footer className="flex flex-col self-stretch p-0">
      <Section className="flex flex-col self-stretch">
        {/* ------------- divider ------------- */}
        <div className={`
          h-1 self-stretch border-t border-t-dark-300
          dark:border-neutral-700
        `}
        />
        {/* ------------- top row ------------- */}
        <div className={`
          flex flex-col gap-8 self-stretch py-8
          md:flex-row md:gap-0
        `}
        >
          {/* ------------- left ------------- */}
          <div className={`
            flex-[1.8] px-0
            lg:pl-3
          `}
          >
            <LogoSVG className="w-[50px]" />
            <div className="mt-[13px]">
              {/* <Text className="w-full leading-7 max-md:text-base">
                {t('message')}
              </Text> */}
              <Suspense
                fallback={(
                  <Skeleton className={`
                    h-7 w-4/5
                    max-md:h-[18px]
                  `}
                  />
                )}
              >
                <FooterQuote locale={locale} />
              </Suspense>
              <Socials className={`
                mt-6 flex flex-row justify-start
                md:mt-[35px]
              `}
              />
            </div>
          </div>

          {/* ------------- center ------------- */}
          <div className="flex-1">
            <FooterTitle text={t('moreInfo')} />
            <div className="mt-[13px] flex flex-col">
              <div className={`
                flex flex-col gap-2
                md:gap-3
              `}
              >
                {defaultMenus.map((menu, index) => (
                  <FooterLink href={menu.value || '/'} key={index}>
                    {menu.label}
                  </FooterLink>
                ))}
                {/* ------ dynamic pages ------ */}
                <Suspense fallback={<FooterSkeleton />}>
                  <DynamicFooterPages locale={locale} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* ------------- right ------------- */}
          <div className="flex-1">
            <FooterTitle text={t('contact')} />
            <div className="mt-[13px] flex flex-col">
              <div className={`
                flex flex-col gap-2
                md:gap-3
              `}
              >
                {CONTACTS.map((contact, index) => (
                  <Text className="text-base" key={index}>
                    {contact}
                  </Text>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* ------------- divider ------------- */}
        <div className={`
          h-1 self-stretch border-t border-t-dark-300
          dark:border-neutral-700
        `}
        />
        {/* ------------- bottom ------------- */}
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
            {APP_SHORT_NAME} © {new Date().getFullYear()}.{' '}
            {t('allRightsReserved')}.
          </Text>
          <LanguageSwitcher
            className="w-[110px]!"
            inputClassName="border-none"
          />
        </div>
      </Section>
    </footer>
  );
};

export default Footer;
