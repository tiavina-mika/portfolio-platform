
import { USE_MASTER_KEY } from '@/utils/constants';
import { logger } from '@/utils/logger';

import { runParallelJob } from '../utils/job.utils.cloud';

export const Test = Parse.Object.extend('Test');

Parse.Cloud.job('createBatchTestJob', async (request: Parse.Cloud.JobRequest): Promise<any> => {
  const { limit = 10 } = request.params;

  const items = Array.from({ length: limit }, (_, i) => i);

  try {
    const result = await runParallelJob<number>({
      array: items,
      worker: async (index: number) => {
        /*
         * if test job fails
         * if (index === 5 || index === 7) {
         *   throw new Error('Test error ' + index);
         * }
         */
        const test = new Test();

        test.set('name', `Test ${index}`);
        await test.save(null, USE_MASTER_KEY);

        // await delay(250);
      },
      concurrency: 20,
      request,
      endMessage: 'Job done',
    });

    return result;
  }
  catch (e) {
    logger.info({
      message: 'Error while executing job createBatchTestJob',
      errStack: (e as Error).stack,
      errMsg: (e as Error).message,
    });
  }
});

Parse.Cloud.job('destroyBatchTestJob', async (request: Parse.Cloud.JobRequest): Promise<any> => {
  try {
    const query = await new Parse.Query(Test);

    const result = await runParallelJob({
      query,
      worker: async (test: Parse.Object) => {
        logger.info('deleteBatchTestJob user ' + test.get('name'));
        await test.destroy(USE_MASTER_KEY);
        // await delay(250);
      },
      concurrency: 10,
      request,
      endMessage: 'Job done',
    });

    return result;
  }
  catch (e) {
    logger.info({
      message: 'Error while executing job createBatchTestJob',
      errStack: (e as Error).stack,
      errMsg: (e as Error).message,
    });
  }
});
