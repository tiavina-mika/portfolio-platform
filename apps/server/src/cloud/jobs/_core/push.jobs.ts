import { processPushReceipts } from '../../services/_core/push.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

/**
 * Processes pending Expo push receipts and clears stale UserSession.pushToken values —
 * see processPushReceipts in push.service.cloud.ts for the full rationale.
 */
defineJob('processPushReceiptsJob', async (): Promise<void> => {
  await processPushReceipts();
});
