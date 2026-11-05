import { Suspense } from 'react';

import { Locale } from '@/i18n/config';

import HomeArticlesBoundary from './HomeArticlesBoundary';
import HomeArticlesData from './HomeArticlesData';
import HomeArticlesSection from './HomeArticlesSection';

type Props = {
  locale: Locale;
};

/**
 * The latest articles section of the home page: skeleton cards while the articles load, a banner
 * with a retry (or an offline notice) if they fail, nothing when none is published yet
 */
const HomeArticles = ({ locale }: Props) => (
  <HomeArticlesBoundary>
    <Suspense fallback={<HomeArticlesSection status="loading" />}>
      <HomeArticlesData locale={locale} />
    </Suspense>
  </HomeArticlesBoundary>
);

export default HomeArticles;
