import { type StatisticsGranularity, mongoBucketDateExpression } from '@/utils/_core/period.utils';

import { aggregate } from './db.utils.cloud';

export type BucketCountRow = { _id: string | null; count: number };

/**
 * Number of documents per date bucket, counted by MongoDB rather than by walking rows in Node — a
 * capped `find()` silently under-counts once the collection outgrows the cap.
 *
 * Statistics pipelines run on the raw collection, so `match` and `dateField` use storage column
 * names (`_created_at`, `_p_<pointer>`). Parse's aggregate endpoint only renames fields inside
 * `$match`/`$group`/`$project` and passes `$lookup`, `$unionWith` or `$facet` through untouched, so
 * mixing both spellings in one pipeline is an easy way to match nothing without any error.
 * @param className collection to count in
 * @param match `$match` filter, in storage column names
 * @param dateField `$`-prefixed storage path of the date to bucket on
 * @param granularity day or month buckets
 * @returns one row per non-empty bucket
 */
export const countDocumentsByBucket = async (
  className: string,
  match: Record<string, unknown>,
  dateField: string,
  granularity: StatisticsGranularity
): Promise<BucketCountRow[]> => aggregate(className, [
  { $match: match },
  { $group: { _id: mongoBucketDateExpression(granularity, dateField), count: { $sum: 1 } } },
]);
