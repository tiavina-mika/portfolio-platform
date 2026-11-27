import { TargetEnum } from '@shared/types';
import axios from 'axios';
import uniq from 'lodash/uniq.js';

import { logger } from './logger';
import { getClientUrl } from './utils';

/**
 * Invalidates a Next.js cache tag on both public websites (portfolio and agency) after CMS content
 * is created, published, unpublished, or deleted from the BO — their `'use cache'` queries rely solely
 * on a TTL (cacheLife) otherwise, so published changes could stay invisible for up to an hour.
 * Both are called whatever the content's targets: a content can move from one website to the other,
 * and invalidating a tag for nothing only costs one extra read.
 * @NOTE WEBSITE_REVALIDATE_SECRET must match the REVALIDATE_SECRET env var of both websites
 */
export const revalidateWebCacheTag = async (tag: string): Promise<void> => {
  const secret = process.env.WEBSITE_REVALIDATE_SECRET;

  if (!secret) {
    logger.warn('WEBSITE_REVALIDATE_SECRET is not set — skipping web cache revalidation', { tag });
    return;
  }

  // the agency URL falls back to the portfolio's while AGENCY_WEBSITE_URL is not set: call it once
  const websiteUrls = uniq([getClientUrl(TargetEnum.PORTFOLIO), getClientUrl(TargetEnum.AGENCY)]);

  // one website being down must not keep the other one stale
  await Promise.all(websiteUrls.map(async (websiteUrl) => {
    try {
      await axios.post(
        `${websiteUrl}/api/revalidate`,
        { tag },
        { headers: { 'x-revalidate-secret': secret } }
      );
    }
    catch (error) {
      logger.error('Failed to revalidate web cache tag', { tag, websiteUrl, error });
    }
  }));
};
