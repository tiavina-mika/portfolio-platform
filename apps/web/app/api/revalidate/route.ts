import { timingSafeEqual } from 'node:crypto';

import { revalidateTag } from 'next/cache';

import env from '@/env';

interface IPostData {
  tag?: unknown;
}

/**
 * compares two secrets in constant time, so the response time does not reveal how many leading
 * characters of a guess were right
 */
const isSameSecret = (received: string | null, expected: string): boolean => {
  if (!received) return false;

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
};

/**
 * Invalidates a Next.js cache tag (see cacheTag() calls in server/queries/*.queries.ts).
 * Called by apps/server (see utils/_core/revalidate.utils.ts) whenever CMS content
 * (articles/pages/categories) is published, unpublished, or deleted from the BO, so the public
 * site doesn't keep serving stale content until its TTL (cacheLife) expires.
 */
export const POST = async (request: Request) => {
  const secret = request.headers.get('x-revalidate-secret');

  if (!env.REVALIDATE_SECRET || !isSameSecret(secret, env.REVALIDATE_SECRET)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: IPostData;

  try {
    body = await request.json();
  }
  catch {
    return Response.json({ success: false, error: 'invalid JSON body' }, { status: 400 });
  }

  if (typeof body?.tag !== 'string' || !body.tag) {
    return Response.json({ success: false, error: 'tag is required' }, { status: 400 });
  }

  /*
   * { expire: 0 } forces an immediate, full revalidation regardless of the tagged entry's
   * original cacheLife profile ('hours' vs 'minutes') — see next/dist .../revalidate.js
   */
  revalidateTag(body.tag, { expire: 0 });

  return Response.json({ success: true }, { status: 200 });
};
