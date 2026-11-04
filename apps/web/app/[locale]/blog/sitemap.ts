import { type MetadataRoute } from 'next';

import { generateArticlesSitemap } from '@/server/queries/article.queries';

/**
 * generate a sitemap for the articles
 * @returns
 */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const articlesSiteMap = (await generateArticlesSitemap()) || [];

  return articlesSiteMap;
};

export default sitemap;
