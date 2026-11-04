import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache, ReactNode, Suspense } from 'react';
import { capitalize } from 'string-ts';

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
import NavBarCvButton from '@/containers/nav-bar/NavBarCvButton';
import NavBarCvIcon from '@/containers/nav-bar/NavBarCvIcon';
import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import ThemeProvider from '@/providers/ThemeProvider';
import { getPagesForMenusUrls } from '@/server/queries/page.queries';
import { IMenu, ISelectOption } from '@/types/app.type';
import { PagesForUrlsOutput } from '@/types/cms.type';
import { OgCardLayoutEnum } from '@/types/og.type';
import { getAlternates, getTranslatedAbsoluteUrl } from '@/utils/app.utils';
import { getPersonJsonLd, getWebSiteJsonLd } from '@/utils/jsonLd.utils';
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
      template: `%s - ${siteConfig.name}`,
    },
    description: t('home.metaDescription'),
    keywords: siteConfig.keywords,
    alternates: getAlternates(urlsByLocale, locale),
    authors: [
      {
        name: siteConfig.author,
        url: siteConfig.social.linkedIn,
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
      icon: '/favicon.ico',
    },
  };
};

export const generateStaticParams = () => {
  return locales.map((locale: Locale) => ({ locale }));
};

/**
 * get pages and cache them so that this can be duplicated
 * even if used in another components
 * NOTE: this request is also called in the footer links
 */
export const getCachedPagesForUrls = cache(
  async (locale: Locale): Promise<PagesForUrlsOutput> => {
    const pages = await getPagesForMenusUrls(locale);

    return pages;
  }
);

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

  const pages: PagesForUrlsOutput = await getCachedPagesForUrls(locale);

  const menus: IMenu[] = [
    {
      label: t('home'),
      value: ROUTES.home,
      id: 'home',
    },
    {
      label: t('projects'),
      value: (ROUTES.projects as any).root,
      id: 'projects',
    },
    {
      label: t('blog'),
      value: (ROUTES.articles as any).root,
      id: 'articles',
    },
    {
      label: t('contact'),
      value: ROUTES.contact,
      id: 'contact',
    },
    // ------ dynamic pages ------ //
    ...pages.menus.map((page: ISelectOption) => ({
      label: capitalize(page.label || ''),
      value: page.value,
      id: page.value,
    })),
  ];

  return (
    // {/* @issue: https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c */}
    (
      <html lang={locale} suppressHydrationWarning={isDev}>
        <body
          suppressHydrationWarning={isDev}
          className={`
            ${fontsVariables}
            antialiased
            dark:bg-neutral-900
          `}
        >
          <JsonLd data={getPersonJsonLd()} />
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
              <a
                href="#main-content"
                className={`
                  sr-only
                  focus:not-sr-only focus:fixed focus:top-3.5 focus:left-6 focus:z-50 focus:inline-flex
                  focus:h-11 focus:items-center focus:rounded-full focus:bg-foreground focus:px-5
                  focus:text-sm focus:font-semibold focus:text-background focus:outline-3
                  focus:outline-offset-3 focus:outline-ring
                `}
              >
                {tCommon('skipToContent')}
              </a>
              <div className="flex min-h-screen flex-col items-center justify-between">
                {/* the bar reads `usePathname()` (a client hook resolved at request time) — isolated
                    behind Suspense so it doesn't block the static shell shared by every route; the
                    fallback keeps its height so the page does not jump when it streams in. The CV
                    download buttons are server components (they read the App data): they are
                    passed in as slots, each behind its own Suspense */}
                <Suspense fallback={(
                  <div
                    aria-hidden
                    className={`
                      h-[55px] self-stretch border-b border-dark-300
                      lg:h-[93px]
                      dark:border-neutral-800/90
                    `}
                  />
                )}
                >
                  <NavBar
                    locale={locale}
                    menus={menus}
                    cvButton={(
                      <Suspense fallback={null}>
                        <NavBarCvButton />
                      </Suspense>
                    )}
                    cvIcon={(
                      <Suspense fallback={null}>
                        <NavBarCvIcon />
                      </Suspense>
                    )}
                  />
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
                {/* FooterBottom's LanguageSwitcher reads `usePathname()` — same reason as the bar above */}
                <Suspense fallback={null}>
                  <Footer locale={locale} />
                </Suspense>
              </div>
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
