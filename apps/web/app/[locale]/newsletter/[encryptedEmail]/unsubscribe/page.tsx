import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { uncapitalize } from 'string-ts';

import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import { getParseServer } from '@/config/parse-server.config';
import ResubscribeToNewsletter from '@/containers/newsletter/ResubscribeToNewsletter';
import UnsubscribeReasonForm from '@/containers/newsletter/UnsubscribeReasonForm';
import { Locale } from '@/i18n/config';
import { APP_NAME } from '@/utils/constants';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type Props = {
  params: Promise<{
    locale: string;
    encryptedEmail: string;
  }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;

  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });

  return {
    title: t('unsubscribeNewsletter.metaTitle'),
    description: t('unsubscribeNewsletter.metaDescription', {
      appName: APP_NAME,
    }),
  };
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const UnsubscribeNewsletterPage = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;
  const encryptedEmail = params.encryptedEmail;

  setRequestLocale(locale);
  const Parse = getParseServer();

  const t = await getTranslations('Newsletter');
  const tCommon = await getTranslations('Errors');

  const hasEmail = await Parse.Cloud.run('unsubscribeNewsletter', {
    encryptedEmail,
    locale,
  });

  if (!hasEmail) {
    notFound();
  }

  const unsubscribeReasonOptions = [
    {
      value: 'tooFrequent',
      label: t('tooFrequently'),
    },
    {
      value: 'notInterested',
      label: t('notInterested'),
    },
    {
      value: 'notRelevant',
      label: t('notRelevant'),
    },
    {
      value: 'other',
      label: t('other'),
    },
  ];

  return (
    <Section className="flex flex-col gap-10 py-8">
      <div className="flex flex-col gap-4">
        <Title level={3}>{t('unsubscribeWithSuccess')}</Title>
        <Text className="font-medium">
          {t('youWillNotReceived', { appName: APP_NAME })}
        </Text>
      </div>

      <div>
        <UnsubscribeReasonForm
          encryptedEmail={encryptedEmail}
          locale={locale}
          options={unsubscribeReasonOptions}
        />
      </div>

      <div className="flex flex-row items-center">
        <Text>{t('ifThisIsAMistake')}</Text>
        <ResubscribeToNewsletter
          encryptedEmail={encryptedEmail}
          label={uncapitalize(t('resubscribe'))}
          locale={locale}
          tError={t('resubscribeError')}
          tSuccess={t('resubscribeSuccess')}
          tUnknownError={tCommon('somethingWentWrong')}
        />
      </div>
    </Section>
  );
};

export default UnsubscribeNewsletterPage;
