import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import Section from '@/components/layouts/Section';
import PageDescription from '@/components/typography/PageDescription';
import PageTitle from '@/components/typography/PageTitle';
import { Card, CardContent } from '@/components/ui/Card';
import ContactForm from '@/containers/contact/ContactForm';
import { Locale } from '@/i18n/config';
import { APP_NAME } from '@/utils/constants';

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

  return {
    title: t('contact.metaTitle'),
    description: t('contact.metaDescription', { appName: APP_NAME }),
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

const ContactPage = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const t = await getTranslations('Contact');

  return (
    <Section
      rootClassName="mt-4 md:mt-8 xl:mt-12"
      className={`
        mb-15 flex flex-col gap-10
        md:gap-16
        lg:mb-20 lg:gap-20
        xl:mb-30 xl:flex-row xl:gap-24
      `}
    >
      <div className="flex-1">
        <PageTitle className="2xl:text-10xl!">{t('contactMe')}</PageTitle>
        <div>
          <PageDescription>{t('description')}</PageDescription>
        </div>
      </div>
      <div className="flex-1">
        <Card>
          <CardContent>
            <ContactForm
              withLabel
              locale={locale}
              className={`
                space-y-4!
                md:space-y-6!
              `}
            />
          </CardContent>
        </Card>
      </div>
    </Section>
  );
};

export default ContactPage;
