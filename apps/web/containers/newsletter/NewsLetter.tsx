import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import { Locale } from '@/i18n/config';

import NewsletterForm from './NewsLetterForm';

type Props = {
  locale: Locale;
};
const Newsletter = ({ locale }: Props) => {
  const t = useTranslations('App');

  return (
    <Section
      rootClassName="max-md:mt-8 md:my-12 lg:my-24 max-lg:dark:bg-transparent max-lg:bg-gray-100"
      size="md"
      className={`
        flex flex-col items-center gap-6 py-10
        lg:flex-row lg:gap-20 lg:rounded-md lg:border lg:border-gray-200 lg:px-12
      `}
    >
      {/* left */}
      <div className="flex flex-1 flex-col gap-2">
        <Title level={4}>{t('subscribeToNewsletter')}</Title>
        <Text size="md">{t('newsLetterDescription')}</Text>
      </div>
      {/* right */}
      <div className={`
        flex-1 space-y-3
        xs:max-md:self-stretch
        md:space-y-5
      `}
      >
        <NewsletterForm locale={locale} />
        <div>
          <Text
            palette="light"
            size="sm"
            className={`
              !text-sm
              md:!text-sm
            `}
          >
            * {t('unsubscribeMessage')}
          </Text>
        </div>
      </div>
    </Section>
  );
};

export default Newsletter;
