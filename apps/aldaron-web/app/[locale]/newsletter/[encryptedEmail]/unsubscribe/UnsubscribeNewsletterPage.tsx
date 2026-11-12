import { useTranslations } from 'next-intl';
import { uncapitalize } from 'string-ts';

import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import ResubscribeToNewsletter from '@/containers/newsletter/ResubscribeToNewsletter';
import UnsubscribeReasonForm from '@/containers/newsletter/UnsubscribeReasonForm';
import { Locale } from '@/i18n/config';
import { APP_NAME } from '@/utils/constants';

type Props = {
  encryptedEmail: string;
  locale: Locale;
};

/**
 * Its forms are client components: the route wraps it in `TranslationClientProvider` with the
 * `Form` and `Newsletter` texts they use
 */
const UnsubscribeNewsletterPage = ({ encryptedEmail, locale }: Props) => {
  const t = useTranslations('Newsletter');
  const tCommon = useTranslations('Errors');

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
