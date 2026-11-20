import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import SectionIntro from '@/components/layouts/SectionIntro';
import ContactFormProvider from '@/containers/contact/ContactFormProvider';
import { Locale } from '@/i18n/config';

type Props = {
  /**
   * Language of the page
   * @example 'en'
   * @required
   */
  locale: Locale;
};

/**
 * The contact page layout: the title (the only h1 of the page) and its lead, then the quote request form
 */
const ContactUs = ({ locale }: Props) => {
  const t = useTranslations('ContactPage');

  return (
    <div className="flex flex-col self-stretch">
      <Section
        aria-labelledby="contact-title"
        as="section"
        className={`
          pt-10 pb-6
          md:pt-[72px] md:pb-10
        `}
      >
        <SectionIntro
          className="gap-7"
          description={t('subtitle')}
          eyebrow={t('label')}
          level={1}
          title={t('title')}
          titleId="contact-title"
        />
      </Section>
      <Section className={`
        pb-10
        md:pb-16
      `}
      >
        <ContactFormProvider locale={locale} />
      </Section>
    </div>
  );
};

export default ContactUs;
