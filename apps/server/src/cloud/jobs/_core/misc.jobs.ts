import { destroyFilesByFolder } from '@/api/_core/cloudinary.api';
import { getCloudinaryWorkspaces } from '@/utils/_core/cloudinary.utils';
import { logger } from '@/utils/_core/logger';

import { defineJob } from '../../utils/_core/job.utils.cloud';

export const Test = Parse.Object.extend('Test');

defineJob('clearRecycleBinInCloudJob', async (request: Parse.Cloud.JobRequest): Promise<any> => {
  try {
    const { limit = 100 } = request.params;

    let failedCount = 0;

    // each Cloudinary account has its own recycle bin
    for (const workspace of getCloudinaryWorkspaces()) {
      // one account failing must not leave the other's bin full
      try {
        await destroyFilesByFolder('recycleBin/', { max_results: limit }, workspace);
      }
      catch (e) {
        failedCount += 1;
        logger.error({
          message: `Error while clearing the recycle bin of the ${workspace} Cloudinary account`,
          errMsg: (e as Error).message,
        });
      }
    }

    // the job runner ignores a returned value: only a throw marks the run as failed
    if (failedCount) {
      throw new Error(`The recycle bin of ${failedCount} Cloudinary account(s) was not cleared`);
    }

    return {
      message: 'Job done',
      success: 1,
      count: 1,
    };
  }
  catch (e) {
    logger.error({
      message: 'Error while executing job clearRecycleBinInCloudJob',
      errStack: (e as Error).stack,
      errMsg: (e as Error).message,
    });
    throw e;
  }
});
