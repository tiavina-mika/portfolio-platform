import { setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import HomeArticles from '@/containers/home/articles/HomeArticles';
import HomeContact from '@/containers/home/contact/HomeContact';
import HomeHero from '@/containers/home/hero/HomeHero';
import HomeProjects from '@/containers/home/projects/HomeProjects';
import HomeServices from '@/containers/home/services/HomeServices';
import Newsletter from '@/containers/newsletter/NewsLetter';
import { Locale } from '@/i18n/config';
import { getApp } from '@/server/queries/app.queries';

import HomePage from './HomePage';

/*
 * ------------------------------------------- //
 * ------------- cached requests ------------- //
 * ------------------------------------------- //
 */
/**
 * get the app settings and cache them so that this can be duplicated
 * even if used in another components
 * NOTE: this request is also called in the layout, the footer and the download button of the CV
 * NOTE: it's a react feature, not a next.js feature, so it should be used and imported in a react component
 */
export const getCachedApp = cache(getApp);

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

const HomeApp = async (props: Props) => {
  const params = await props.params;
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  return (
    <HomePage
      articles={<HomeArticles locale={locale} />}
      contact={<HomeContact locale={locale} />}
      hero={<HomeHero locale={locale} />}
      newsletter={<Newsletter locale={locale} />}
      projects={<HomeProjects locale={locale} />}
      services={<HomeServices />}
    />
  );
};

export default HomeApp;
