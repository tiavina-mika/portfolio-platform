import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { getParseServer } from '@/config/parse-server.config';
import { Locale } from '@/i18n/config';
import { APP_NAME } from '@/utils/constants';

import ConfirmNewsletterPage from './ConfirmNewsletterPage';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type Props = {
  params: Promise<{
    locale: string;
    token: string;
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
    title: t('confirmNewsletter.metaTitle'),
    description: t('confirmNewsletter.metaDescription', {
      appName: APP_NAME,
    }),
    // a personal link from an e-mail, never a page to index
    robots: { index: false, follow: false },
  };
};

/**
 * Second half of the newsletter double opt-in: the address only starts receiving articles once
 * this link has been opened. A malformed or unknown token is answered as a missing page.
 */
const confirmSubscription = async (token: string, locale: Locale): Promise<boolean> => {
  try {
    return await getParseServer().Cloud.run('confirmNewsletterSubscription', { token, locale });
  }
  catch {
    return false;
  }
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
const ConfirmNewsletterContent = async (props: Props) => {
  const params = await props.params;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  if (!(await confirmSubscription(params.token, locale))) {
    notFound();
  }

  return <ConfirmNewsletterPage />;
};

/**
 * this route has no `generateStaticParams` (tokens are unbounded), so `params` is always
 * request-time data — wrapped in its own `<Suspense>` boundary so `cacheComponents` can still
 * validate/prerender the static shell around it
 */
const ConfirmNewsletterApp = (props: Props) => (
  <Suspense fallback={null}>
    <ConfirmNewsletterContent {...props} />
  </Suspense>
);

export default ConfirmNewsletterApp;
