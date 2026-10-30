import { logger } from '@/utils/_core/logger';

import { expireOldNotifications } from '../../services/_core/notification-expiry.service.cloud';
import { purgeOldNotifications } from '../../services/_core/notification.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

type ExpireNotificationsParams = {
  /** Soft-delete notifications older than this many days (default: 365) */
  olderThanDays?: number;
};

/**
 * Soft-deletes notifications older than `olderThanDays` days that have not already been deleted.
 * Designed to run as a scheduled Parse Job (e.g. daily via node-cron or a Parse dashboard schedule).
 */
defineJob(
  'expireOldNotificationsJob',
  async (request: Parse.Cloud.JobRequest<ExpireNotificationsParams>): Promise<void> => {
    const { olderThanDays = 365 } = request.params;
    const processed = await expireOldNotifications(olderThanDays);

    logger.info(
      `expireOldNotificationsJob: soft-deleted ${processed} notifications older than ${olderThanDays} days`
    );
  }
);

/**
 * Permanently destroys notifications already soft-deleted by expireOldNotificationsJob once
 * their grace period (NOTIFICATION_HARD_DELETE_GRACE_DAYS) has elapsed.
 */
defineJob('purgeOldNotificationsJob', async (): Promise<void> => {
  await purgeOldNotifications();
});
