import { destroyFilesByFolder } from '@/api/_core/cloudinary.api';
import { getCloudinaryWorkspaces } from '@/utils/_core/cloudinary.utils';
import { logger } from '@/utils/_core/logger';

import { defineJob } from '../../utils/_core/job.utils.cloud';

export const Test = Parse.Object.extend('Test');

defineJob('clearRecycleBinInCloudJob', async (request: Parse.Cloud.JobRequest): Promise<any> => {
  try {
    const { limit = 100 } = request.params;

    // each Cloudinary account has its own recycle bin
    for (const workspace of getCloudinaryWorkspaces()) {
      await destroyFilesByFolder('recycleBin/', { max_results: limit }, workspace);
    }

    return {
      message: 'Job done',
      success: 1,
      count: 1,
    };
  }
  catch (e) {
    logger.info({
      message: 'Error while executing job createBatchTestJob',
      errStack: (e as Error).stack,
      errMsg: (e as Error).message,
    });
  }
});
