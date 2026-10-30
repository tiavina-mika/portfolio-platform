import { ARTICLE_SINGLE_IMAGE_FIELDS, PAGE_IMAGES_FIELDS, PAGE_SINGLE_IMAGE_FIELDS } from '@shared/validations';

export { PAGE_SINGLE_IMAGE_FIELDS };
export const PAGE_FILES_FIELDS = ['images', 'editorFiles'];

/**
 * fields snapshotted into a `ContentVersion` row before an Article/Page update overwrites them, so
 * an editor can restore the previous content after a bad publish.
 * Mirrors the client-side ARTICLE_PROPERTIES/PAGE_PROPERTIES sets used by createOrUpdateArticle/
 * createOrUpdatePage (apps/bo/src/redux/actions/_core/article.action.ts, page.action.ts).
 */
export const CONTENT_VERSION_SNAPSHOT_FIELDS: Record<'Article' | 'Page', string[]> = {
  Article: ['translated', 'categories', ...ARTICLE_SINGLE_IMAGE_FIELDS],
  Page: ['translated', 'categories', ...PAGE_SINGLE_IMAGE_FIELDS, ...PAGE_IMAGES_FIELDS],
};

/**
 * max number of versions kept per Article/Page — auto-snapshotting on every content-changing
 * save would otherwise grow this collection unbounded.
 */
export const CONTENT_VERSION_RETENTION_LIMIT = 20;

/**
 * social networks an Article/Page share counter may be incremented for. The `incrementShareCount`
 * Cloud Function is callable without a session (the public website has no user), so the value is
 * whitelisted rather than free-text — an open endpoint writing arbitrary keys would let anyone
 * grow the `shares` object of a published article indefinitely.
 * Mirrors the share buttons rendered by the public website's Share container.
 */
export const SHARE_SOCIAL_NETWORKS = [
  'facebook',
  'x',
  'linkedin',
  'whatsapp',
  'telegram',
  'reddit',
  'skype',
] as const;

/**
 * audience counters bumped by visitors on the public website, never by an editor. A save touching
 * only these is traffic, not a content change: it must not revalidate the website cache (a popular
 * article would otherwise drop the cache on every single visit) nor snapshot a content version.
 */
export const CMS_COUNTER_FIELDS = ['shares', 'totalMediaShare', 'views'];
