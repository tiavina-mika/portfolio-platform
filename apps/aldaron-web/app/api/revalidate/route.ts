import { revalidateTag } from 'next/cache';

import env from '@/env';

interface IPostData {
  tag: string;
}

/**
 * Invalidates a Next.js cache tag (see cacheTag() calls in server/queries/*.queries.ts).
 * Called by apps/server (see utils/_core/revalidate.utils.ts) whenever CMS content
 * (articles/pages/categories) is published, unpublished, or deleted from the BO, so the public
 * site doesn't keep serving stale content until its TTL (cacheLife) expires.
 */
export const POST = async (request: Request) => {
  const secret = request.headers.get('x-revalidate-secret');

  if (!env.REVALIDATE_SECRET || secret !== env.REVALIDATE_SECRET) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body: IPostData = await request.json();

  if (!body.tag) {
    return Response.json({ success: false, error: 'tag is required' }, { status: 400 });
  }

  /*
   * { expire: 0 } forces an immediate, full revalidation regardless of the tagged entry's
   * original cacheLife profile ('hours' vs 'minutes') — see next/dist .../revalidate.js
   */
  revalidateTag(body.tag, { expire: 0 });

  return Response.json({ success: true }, { status: 200 });
};
