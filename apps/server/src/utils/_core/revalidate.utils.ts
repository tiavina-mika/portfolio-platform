import axios from 'axios';

import { logger } from './logger';
import { getClientUrl } from './utils';

/**
 * Invalidates a Next.js cache tag on the public website (apps/web) after CMS content
 * (articles/pages/categories) is created, published, unpublished, or deleted from the BO — the
 * website's `'use cache'` queries rely solely on a TTL (cacheLife) otherwise, so published
 * changes could stay invisible on the public site for up to an hour without this call.
 * @NOTE WEBSITE_REVALIDATE_SECRET must match apps/web's REVALIDATE_SECRET env var
 */
export const revalidateWebCacheTag = async (tag: string): Promise<void> => {
  const secret = process.env.WEBSITE_REVALIDATE_SECRET;

  if (!secret) {
    logger.warn('WEBSITE_REVALIDATE_SECRET is not set — skipping web cache revalidation', { tag });
    return;
  }

  try {
    await axios.post(
      `${getClientUrl()}/api/revalidate`,
      { tag },
      { headers: { 'x-revalidate-secret': secret } }
    );
  }
  catch (error) {
    logger.error('Failed to revalidate web cache tag', { tag, error });
  }
};
