import { useTranslations } from 'next-intl';

import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import Title from '@/components/typography/Title';
import { APP_NAME } from '@/utils/constants';

const ConfirmNewsletterPage = () => {
  const t = useTranslations('Newsletter');

  return (
    <Section className="flex flex-col gap-4 py-8">
      <Title level={3}>{t('confirmedTitle')}</Title>
      <Text className="font-medium">
        {t('confirmedDescription', { appName: APP_NAME })}
      </Text>
    </Section>
  );
};

export default ConfirmNewsletterPage;
