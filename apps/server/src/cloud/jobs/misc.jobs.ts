
import FileService from '@/services/files.service';
import { logger } from '@/utils/logger';

export const Test = Parse.Object.extend('Test');

Parse.Cloud.job('clearRecycleBinInCloudJob', async (request: Parse.Cloud.JobRequest): Promise<any> => {
  try {
    const { limit = 100 } = request.params;
    const service = new FileService();

    await service.destroyFilesByFolder('recycleBin/', { max_results: limit });

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
