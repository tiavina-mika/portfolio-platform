import { type MetadataRoute } from 'next';

import { generatePagesSitemap } from '@/server/queries/page.queries';

/**
 * generate a sitemap for the CMS pages
 * NOTE: lives under a dedicated static `pages/` segment (not nested in the `[slug]` dynamic
 * route) so the sitemap resolves at a fixed URL instead of requiring a `[slug]` value —
 * see `blog/sitemap.ts` for the same pattern applied to articles.
 * @returns
 */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const pagesSiteMap = (await generatePagesSitemap()) || [];

  return pagesSiteMap;
};

export default sitemap;
