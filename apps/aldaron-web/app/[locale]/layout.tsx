import { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';

import Analytics from '@/components/Analytics';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { fontsVariables } from '@/components/fonts';
import Footer from '@/components/footer/Footer';
import JsonLd from '@/components/JsonLd';
import NavBar from '@/components/nav-bar/NavBar';
import ToasterProvider from '@/components/ToasterProvider';
import ViewportIndicator from '@/components/ViewportIndicator';
import WebVitals from '@/components/WebVitals';
import { siteConfig } from '@/config/site';
import CurrencySelect from '@/containers/currency/CurrencySelect';
import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import CurrencyProvider from '@/providers/CurrencyProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import { OgCardLayoutEnum } from '@/types/og.type';
import { getAlternates, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { THEME_COLORS } from '@/utils/constants';
import { getOrganizationJsonLd, getWebSiteJsonLd } from '@/utils/jsonLd.utils';
import { getSocialImages } from '@/utils/og.utils';

/*
 * ----------------------------- //
 * -------- metadata ----------- //
 * ----------------------------- //
 */
type MetaDataProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async (props: MetaDataProps): Promise<Metadata> => {
  const params = await props.params;
  const locale = params.locale as Locale;

  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });
  const tOg = await getTranslations({ locale, namespace: 'OpenGraph' });

  const urlsByLocale = Object.fromEntries(
    locales.map((loc) => [loc, getTranslatedAbsoluteUrl(ROUTES.home, { locale: loc })])
  );

  // the home card, also inherited by every page that has none of its own (404, newsletter…)
  const { openGraphImages, twitter } = getSocialImages(
    { layout: OgCardLayoutEnum.CENTERED, title: tOg('home.title'), subtitle: tOg('home.subtitle') },
    siteConfig.name,
    t('home.metaDescription')
  );

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    description: t('home.metaDescription'),
    keywords: siteConfig.keywords,
    alternates: getAlternates(urlsByLocale, locale),
    authors: [
      {
        name: siteConfig.author,
        url: siteConfig.social.linkedin,
      },
    ],
    creator: siteConfig.author,
    openGraph: {
      type: 'website',
      locale: defaultLocale,
      alternateLocale: locales.filter(loc => loc !== defaultLocale),
      url: siteConfig.url,
      title: siteConfig.name,
      description: t('home.metaDescription'),
      siteName: siteConfig.name,
      images: openGraphImages,
    },
    twitter,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
  };
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.paper },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.night },
  ],
};

export const generateStaticParams = () => {
  return locales.map((locale: Locale) => ({ locale }));
};

/*
 * ----------------------------- //
 * ------------ page ----------- //
 * ----------------------------- //
 */
type Props = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

const RootLayout = async (props: Props) => {
  const params = await props.params;

  const locale = params.locale as Locale;

  const {
    children,
  } = props;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'NavBar' });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });

  const isDev = process.env.APP_ENV === 'development';

  // the pages of the site, in the order of the navigation bar and of the footer
  const menus = [
    { id: 'pricing', label: t('pricing'), value: ROUTES.pricing },
    { id: 'simulator', label: t('simulator'), value: ROUTES.simulator },
    { id: 'projects', label: t('projects'), value: ROUTES.projects.root },
    { id: 'about', label: t('about'), value: ROUTES.about },
    { id: 'contact', label: t('contact'), value: ROUTES.contact },
  ];

  return (
    // {/* @issue: https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c */}
    (
      <html className={fontsVariables} lang={locale} suppressHydrationWarning={isDev}>
        <body suppressHydrationWarning={isDev}>
          <JsonLd data={getOrganizationJsonLd()} />
          <JsonLd data={getWebSiteJsonLd()} />
          <WebVitals />
          <Analytics />
          <NextIntlClientProvider locale={locale}>
            <ThemeProvider
              disableTransitionOnChange
              enableSystem
              attribute="class"
              defaultTheme="light"
            >
              <CurrencyProvider>
                <a
                  href="#main-content"
                  className={`
                    sr-only
                    focus:not-sr-only focus:fixed focus:top-3.5 focus:left-6 focus:z-50 focus:inline-flex
                    focus:h-11 focus:items-center focus:rounded-md focus:bg-foreground focus:px-5
                    focus:text-sm focus:font-semibold focus:text-background focus:outline-3
                    focus:outline-offset-3 focus:outline-ring
                  `}
                >
                  {tCommon('skipToContent')}
                </a>
                <div className="flex min-h-screen flex-col items-center justify-between">
                  {/* the bar reads `usePathname()` (a client hook resolved at request time) — isolated
                    behind Suspense so it doesn't block the static shell shared by every route; the
                    fallback keeps its height so the page does not jump when it streams in */}
                  <Suspense fallback={(
                    <div
                      aria-hidden
                      className={'h-[73px] self-stretch border-b border-border'}
                    />
                  )}
                  >
                    <NavBar currencySelect={<CurrencySelect />} menus={menus} />
                  </Suspense>
                  {/* the landmarks are siblings: the bar and the footer are not inside `main` */}
                  <main
                    id="main-content"
                    className={`
                      flex flex-col self-stretch
                      lg:items-center
                    `}
                  >
                    {/* catch-all boundary: some routes read dynamic APIs (searchParams, unbounded
                      params) with no ancestor Suspense of their own — without one here, that
                      dynamism would otherwise block the shared static shell (nav/footer) from
                      prerendering at all */}
                    <Suspense fallback={null}>
                      {children}
                    </Suspense>
                  </main>
                  {/* the language buttons read `usePathname()` — same reason as the bar above */}
                  <Suspense fallback={null}>
                    <Footer menus={menus} />
                  </Suspense>
                </div>
              </CurrencyProvider>
              <ToasterProvider />
              <CookieConsentBanner />

              {/* ----- viewport ----- */}
              <ViewportIndicator />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    )
  );
};

export default RootLayout;
