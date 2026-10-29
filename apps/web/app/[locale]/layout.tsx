import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache, ReactNode, Suspense } from 'react';
import { capitalize } from 'string-ts';

import { fontsVariables } from '@/components/fonts';
import Footer from '@/components/footer/Footer';
import NavBarDesktop from '@/components/navBar/NavBarDesktop';
import NavBarMobile from '@/components/navBar/NavBarMobile';
import NextIcon from '@/components/NextIcon';
import ToasterProvider from '@/components/ToasterProvider';
import ToggleTheme from '@/components/ToggleTheme';
import ViewportIndicator from '@/components/ViewportIndicator';
import { siteConfig } from '@/config/site';
import { loadZodI18nLocale } from '@/config/zod/zod-i18n';
import DownloadCV from '@/containers/app/DownloadCV';
import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import ThemeProvider from '@/providers/ThemeProvider';
import { getPagesForMenusUrls } from '@/server/queries/page.queries';
import { IMenu, ISelectOption } from '@/types/app.type';
import { PagesForUrlsOutput } from '@/types/cms.type';
import { IMAGES } from '@/utils/constants';
import { getSSRCurrentPathname } from '@/utils/server.utils';

import { getCachedApp } from './page';


// import WebVitals from '@/components/WebVitals';

/**
 * get pages and cache them so that this can be duplicated
 * even if used in another components
 * NOTE: this request is also called in navbar menus
 */
export const getCachedPagesForUrls = cache(
  async (locale: Locale): Promise<PagesForUrlsOutput> => {
    const pages = await getPagesForMenusUrls(locale);

    return pages;
  }
);

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

  const app = await getCachedApp();

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },
    description: t('home.metaDescription'),
    keywords: siteConfig.keywords,
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
      alternateLocale: locales.filter(locale => locale !== defaultLocale),
      url: siteConfig.url,
      title: siteConfig.name,
      description: t('home.metaDescription'),
      siteName: siteConfig.name,
      images: [
        {
          url: app?.get('image')?.url || `${siteConfig.url}${IMAGES.logo}`,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    icons: {
      icon: '/favicon.ico',
    },
    // manifest: `${siteConfig.url}/site.webmanifest`,
  };
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
  loadZodI18nLocale(locale);

  const t = await getTranslations('NavBar');
  const tCommon = await getTranslations('Common');
  const tApp = await getTranslations('App');

  const pathname = await getSSRCurrentPathname();
  const pathnameArr = pathname.split('/');
  const isHome = pathnameArr.length <= 2; // / or /[locale]

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
      label: t('articles'),
      value: (ROUTES.articles as any).root,
      id: 'articles',
    },
    {
      label: t('contactMe'),
      value: ROUTES.contact,
      id: 'contact',
    },
    // ------ dynamic pages ------ //
    ...pages.menus.map((page: ISelectOption) => ({
      label: capitalize(page.label),
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
          <NextIntlClientProvider>
            {/* <WebVitals /> */}

            <ThemeProvider
              disableTransitionOnChange
              enableSystem
              attribute="class"
              defaultTheme="light"
            >
              <main className="flex min-h-screen flex-col items-center justify-between">
                <div className={`
                  flex flex-col self-stretch
                  md:pb-0
                  lg:items-center
                `}
                >
                  <NavBarDesktop
                    buttonText={tApp('downloadCV')}
                    className="self-stretch"
                    isHome={isHome}
                    locale={locale}
                    menus={menus}
                    noResultMessage={tCommon('noResults')}
                    searchPlaceholder={tCommon('search')}
                  />
                  <NavBarMobile
                    locale={locale}
                    menus={menus}
                    tNoResults={tCommon('noResults')}
                    toggleTheme={<ToggleTheme />}
                    tSearch={tCommon('search')}
                    className={`
                      self-stretch
                      max-lg:mb-3
                    `}
                    cvDownloadButton={(
                      <Suspense fallback={null}>
                        <DownloadCV
                          className="flex flex-col items-center justify-center"
                          componentType="icon"
                        >
                          <NextIcon
                            alt="download"
                            size={32}
                            src="/icons/download.svg"
                            className={`
                              block
                              dark:hidden
                            `}
                          />
                          <NextIcon
                            alt="download"
                            size={32}
                            src="/icons/download-dark.svg"
                            className={`
                              hidden
                              dark:block
                            `}
                          />
                        </DownloadCV>
                      </Suspense>
                    )}
                  />
                  {children}
                </div>
                <Footer locale={locale} />
              </main>
              <ToasterProvider />

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
