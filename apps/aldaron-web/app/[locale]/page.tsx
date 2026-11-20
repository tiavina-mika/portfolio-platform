import { setRequestLocale } from 'next-intl/server';

import { Locale } from '@/i18n/config';

import HomePage from './HomePage';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

/*
 * The metadata of the home page are the ones of the root layout (`Metadata.home`), which every page
 * without its own inherits.
 */
const HomeApp = async (props: Props) => {
  const params = await props.params;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  return <HomePage />;
};

export default HomeApp;
