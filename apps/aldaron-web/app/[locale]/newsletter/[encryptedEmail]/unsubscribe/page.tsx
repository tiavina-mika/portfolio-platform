import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import TranslationClientProvider from '@/components/TranslationClientProvider';
import { getParseServer } from '@/config/parse-server.config';
import { Locale } from '@/i18n/config';
import { APP_NAME } from '@/utils/constants';

import UnsubscribeNewsletterPage from './UnsubscribeNewsletterPage';

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
const UnsubscribeNewsletterContent = async (props: Props) => {
  const params = await props.params;

  const encryptedEmail = params.encryptedEmail;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const hasEmail = await getParseServer().Cloud.run('unsubscribeNewsletter', {
    encryptedEmail,
    locale,
  });

  if (!hasEmail) {
    notFound();
  }

  return (
    <TranslationClientProvider rootKeys={['Form', 'Newsletter']}>
      <UnsubscribeNewsletterPage encryptedEmail={encryptedEmail} locale={locale} />
    </TranslationClientProvider>
  );
};

/**
 * this route has no `generateStaticParams` (encrypted emails are unbounded), so `params` is
 * always request-time data — wrapped in its own `<Suspense>` boundary so `cacheComponents` can
 * still validate/prerender the static shell around it
 */
const UnsubscribeNewsletterApp = (props: Props) => (
  <Suspense fallback={null}>
    <UnsubscribeNewsletterContent {...props} />
  </Suspense>
);

export default UnsubscribeNewsletterApp;
