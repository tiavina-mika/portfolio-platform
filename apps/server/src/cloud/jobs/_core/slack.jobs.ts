import { logger } from '@/utils/_core/logger';

import { postDailySlackSummary } from '../../services/_core/daily-summary.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

defineJob('postDailySlackSummaryJob',
  async (_request: Parse.Cloud.JobRequest<object>): Promise<void> => {
    logger.info('Starting postDailySlackSummaryJob', { function: 'postDailySlackSummaryJob' });

    await postDailySlackSummary();
  });
