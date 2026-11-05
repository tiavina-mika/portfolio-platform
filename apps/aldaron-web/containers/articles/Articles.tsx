import { ComponentProps, Suspense } from 'react';

import ArticlesBoundary from './ArticlesBoundary';
import ArticlesData from './ArticlesData';
import ArticlesSection from './ArticlesSection';

type Props = ComponentProps<typeof ArticlesData>;

/**
 * The list of the blog: skeleton cards while the articles load, a banner with a retry (or an
 * offline notice) if they fail, the empty notice when none is published yet
 */
const Articles = (props: Props) => (
  <ArticlesBoundary>
    <Suspense fallback={<ArticlesSection status="loading" />}>
      <ArticlesData {...props} />
    </Suspense>
  </ArticlesBoundary>
);

export default Articles;
