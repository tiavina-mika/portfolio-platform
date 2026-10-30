import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';

import TranslationClientProvider from '@/components/TranslationClientProvider';
import SitemapGroupLoading from '@/containers/sitemaps/SitemapGroupLoading';
import { locales, Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { OgCardLayoutEnum } from '@/types/og.type';
import { getAlternates, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { APP_NAME } from '@/utils/constants';
import { getSocialMetadata } from '@/utils/og.utils';

import SitemapPage from './SitemapPage';


/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type Props = {
  children: ReactNode;
  articles: ReactNode;
  pages: ReactNode;
  projects: ReactNode;
  categories: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

/**
 * this route composes parallel slots (`@articles`/`@categories`/`@pages`/`@projects`) — despite every
 * dynamic access already being wrapped in `<Suspense>` (see below) and `setRequestLocale` +
 * explicit-locale `getTranslations` used throughout, the parallel-route + `cacheComponents`
 * static-shell validation still flags this route as accessing runtime data outside `<Suspense>`.
 * `instant = false` is the framework's own sanctioned escape hatch for this case (see
 * https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents#instant) — it
 * opts this low-traffic utility page out of instant-navigation validation, rendering it fully on
 * every request instead. It does not affect any other route.
 */
// Next.js requires this exact export name — cannot be renamed to match naming-convention
// eslint-disable-next-line @typescript-eslint/naming-convention
export const instant = false;

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;

  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });
  const tOg = await getTranslations({ locale, namespace: 'OpenGraph' });

  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [loc, getTranslatedAbsoluteUrl(ROUTES.sitemap, { locale: loc })])
  );

  const title = t('sitemap.metaTitle');
  const description = t('sitemap.metaDescription', { appName: APP_NAME });

  return {
    title,
    description,
    alternates: getAlternates(urlsByLocale, locale),
    ...getSocialMetadata({
      card: {
        layout: OgCardLayoutEnum.CENTERED,
        chip: tOg('sitemap.chip'),
        title: tOg('sitemap.title'),
        subtitle: tOg('sitemap.subtitle', { appName: APP_NAME }),
      },
      title,
      description,
      url: urlsByLocale[locale],
      locale,
    }),
  };
};

const Layout = async (props: Props) => {
  const params = await props.params;
  const locale = params.locale as Locale;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Sitemap' });

  const {
    children,
    articles,
    pages,
    projects,
    categories,
  } = props;

  return (
    <SitemapPage description={t('description', { appName: APP_NAME })} title={t('sitemap')}>
      {/* the error boundary of the route renders here: it reads the `Sitemap` messages on the client */}
      <TranslationClientProvider rootKeys={['Sitemap']}>
        {/* each parallel slot reads its own `params` independently of this layout's — isolated
            behind Suspense so cacheComponents can validate/prerender the static shell around it */}
        <Suspense fallback={<SitemapGroupLoading />}>
          {projects}
        </Suspense>
        <Suspense fallback={<SitemapGroupLoading />}>
          {articles}
        </Suspense>
        <Suspense fallback={<SitemapGroupLoading />}>
          {categories}
        </Suspense>
        <Suspense fallback={<SitemapGroupLoading />}>
          {pages}
        </Suspense>
      </TranslationClientProvider>
      {children}
    </SitemapPage>
  );
};

export default Layout;
