import { purgeOldLogs } from '../../services/_core/log-retention.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

/** Permanently destroys the audit, moderation and expired-link rows past their retention period. */
defineJob('purgeOldLogsJob', async (): Promise<void> => {
  await purgeOldLogs();
});
