import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import LegalDocument from '@/containers/legal/LegalDocument';
import { locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { OgCardLayoutEnum } from '@/types/og.type';
import { getAlternates, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { getLegalSections } from '@/utils/legal.utils';
import { getSocialMetadata } from '@/utils/og.utils';

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
  const t = await getTranslations({ locale, namespace: 'PrivacyPage' });

  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [loc, getTranslatedAbsoluteUrl(ROUTES.privacy, { locale: loc })])
  );

  const title = t('metadata.title');
  const description = t('metadata.description');

  return {
    title,
    description,
    alternates: getAlternates(urlsByLocale, locale),
    ...getSocialMetadata({
      card: {
        layout: OgCardLayoutEnum.CENTERED,
        chip: t('og.chip'),
        title: t('og.title'),
        subtitle: t('og.subtitle'),
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

const PrivacyApp = async (props: Props) => {
  const params = await props.params;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'PrivacyPage' });

  return (
    <LegalDocument
      label={t('label')}
      sections={getLegalSections(t.raw('sections'))}
      title={t('title')}
      updated={t('updated')}
    />
  );
};

export default PrivacyApp;
