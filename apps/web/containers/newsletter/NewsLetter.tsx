import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import TranslationClientProvider from '@/components/TranslationClientProvider';
import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import { Locale } from '@/i18n/config';

import NewsletterForm from './NewsLetterForm';

type Props = {
  locale: Locale;
};

/**
 * The newsletter card: the pitch on one side, the subscription form on the other
 */
const Newsletter = ({ locale }: Props) => {
  const t = useTranslations('Newsletter');

  return (
    <Section
      aria-labelledby="newsletter-title"
      as="section"
      rootClassName="max-md:mt-8 md:my-12 lg:my-24 max-lg:dark:bg-transparent max-lg:bg-muted"
      size="md"
      className={`
        flex flex-col items-center gap-6 py-10
        lg:flex-row lg:gap-20 lg:rounded-md lg:border lg:border-border lg:px-12
      `}
    >
      {/* left */}
      <div className="flex flex-1 flex-col gap-2">
        <Title id="newsletter-title" level={2}>{t('title')}</Title>
        <Text size="md">{t('description')}</Text>
      </div>
      {/* right */}
      <div className={`
        flex flex-1 flex-col gap-3
        xs:max-md:self-stretch
        md:gap-5
      `}
      >
        <TranslationClientProvider rootKeys={['Form', 'Newsletter', 'Common']}>
          <NewsletterForm locale={locale} />
        </TranslationClientProvider>
        <Text
          palette="light"
          size="sm"
          className={`
            text-sm!
            md:text-sm!
          `}
        >
          * {t('unsubscribeMessage')}
        </Text>
      </div>
    </Section>
  );
};

export default Newsletter;
