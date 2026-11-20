import { setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import { Locale } from '@/i18n/config';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Sets the language of the request before the page or its loading state reads the translations: the
 * loading state is rendered beside the page and cannot learn the language from the route itself
 */
const Layout = async (props: Props) => {
  const params = await props.params;

  setRequestLocale(params.locale as Locale);

  return props.children;
};

export default Layout;
