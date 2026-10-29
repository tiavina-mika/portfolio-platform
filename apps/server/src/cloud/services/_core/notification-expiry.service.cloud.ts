import dayjs from 'dayjs';

import { DEFAULT_QUERY_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';

import { Notification } from './notification.service.cloud';

/**
 * Soft-deletes the notifications older than `olderThanDays` days that are not deleted yet.
 * @returns how many notifications were soft-deleted
 */
export const expireOldNotifications = async (olderThanDays: number): Promise<number> => {
  const cutoffDate = dayjs().subtract(olderThanDays, 'day').toDate();
  let processed = 0;

  /*
   * always the first page: every row of a batch leaves the `deleted: false` filter once it is
   * soft-deleted, so the next unprocessed rows are back at offset 0 — paging with skip() on a
   * filter the loop itself shrinks jumped over one batch out of two
   */
  while (true) {
    const batch = await new Parse.Query(Notification)
      .equalTo('deleted', false)
      .lessThan('createdAt', cutoffDate)
      .select(['objectId'])
      .limit(DEFAULT_QUERY_LIMIT)
      .find(USE_MASTER_KEY);

    if (batch.length === 0) break;

    await Promise.all(
      batch.map(async (notification) => {
        notification.set('deleted', true);
        notification.set('deletedAt', new Date());
        await notification.save(null, { ...USE_MASTER_KEY, context: { disableAfterSave: true } });
      })
    );

    processed += batch.length;

    if (batch.length < DEFAULT_QUERY_LIMIT) break;
  }

  return processed;
};
