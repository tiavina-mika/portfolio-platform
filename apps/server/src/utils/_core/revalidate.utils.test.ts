import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { revalidateWebCacheTag } from './revalidate.utils';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('axios', () => ({ default: { post } }));
vi.mock('./logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));

const calledUrls = () => post.mock.calls.map(([url]) => url);

describe('revalidation of the websites cache', () => {
  beforeEach(() => {
    post.mockReset();
    vi.stubEnv('WEBSITE_REVALIDATE_SECRET', 'secret');
    vi.stubEnv('WEBSITE_URL', 'https://www.portfolio.test');
    vi.stubEnv('AGENCY_WEBSITE_URL', 'https://www.agency.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should invalidate the tag on the portfolio and on the agency websites', async () => {
    await revalidateWebCacheTag('pages');

    expect(calledUrls()).toEqual([
      'https://www.portfolio.test/api/revalidate',
      'https://www.agency.test/api/revalidate',
    ]);
  });

  it('should call a single website once while the agency one is not set', async () => {
    vi.stubEnv('AGENCY_WEBSITE_URL', '');

    await revalidateWebCacheTag('pages');

    expect(calledUrls()).toEqual(['https://www.portfolio.test/api/revalidate']);
  });

  it('should still call the agency website when the portfolio one fails', async () => {
    post.mockRejectedValueOnce(new Error('down'));

    await expect(revalidateWebCacheTag('pages')).resolves.toBeUndefined();

    expect(calledUrls()).toContain('https://www.agency.test/api/revalidate');
  });

  it('should call no website without a secret', async () => {
    vi.stubEnv('WEBSITE_REVALIDATE_SECRET', '');

    await revalidateWebCacheTag('pages');

    expect(post).not.toHaveBeenCalled();
  });
});
