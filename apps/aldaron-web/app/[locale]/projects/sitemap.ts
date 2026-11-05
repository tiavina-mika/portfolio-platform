import { type MetadataRoute } from 'next';

import { generateProjectsSitemap } from '@/server/queries/project.queries';

/**
 * generate a sitemap for the projects
 * @returns
 */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const projectsSiteMap = (await generateProjectsSitemap()) || [];

  return projectsSiteMap;
};

export default sitemap;
