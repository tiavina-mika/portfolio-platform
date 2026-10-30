import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { OgCardLayoutEnum } from '@/types/og.type';
import { getAlternates, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { APP_NAME } from '@/utils/constants';
import { getSocialMetadata } from '@/utils/og.utils';

import ContactUs from './ContactUsPage';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type MetaDataProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async (props: MetaDataProps): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;
  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });
  const tOg = await getTranslations({ locale, namespace: 'OpenGraph' });

  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [loc, getTranslatedAbsoluteUrl(ROUTES.contact, { locale: loc })])
  );

  const title = t('contact.metaTitle');
  const description = t('contact.metaDescription', { appName: APP_NAME });

  return {
    title,
    description,
    alternates: getAlternates(urlsByLocale, locale),
    ...getSocialMetadata({
      card: {
        layout: OgCardLayoutEnum.CENTERED,
        chip: tOg('contact.chip'),
        title: tOg('contact.title'),
        subtitle: tOg('contact.subtitle', { appName: APP_NAME }),
      },
      title,
      description,
      url: urlsByLocale[locale],
      locale,
    }),
  };
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
type Props = {
  params: Promise<{
    locale: string;
  }>;
};

const ContactApp = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);

  return <ContactUs locale={locale} />;
};

export default ContactApp;
