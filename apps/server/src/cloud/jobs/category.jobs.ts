
import { USE_MASTER_KEY } from '@/utils/constants';
import { logger } from '@/utils/logger';

import { Category } from '../triggers/category.triggers';
import { runParallelJob } from '../utils/job.utils.cloud';

Parse.Cloud.job('updateLinkedCategoryItemCountJob', async (request: Parse.Cloud.JobRequest): Promise<any> => {
  const { categoryIds = [], className, isRecycleBin = false } = request.params;

  try {
    const query = await new Parse.Query(Category)
      .containedIn('objectId', categoryIds);

    const result = await runParallelJob({
      query,
      worker: async (category: Parse.Object) => {
        const query = new Parse.Query(className);

        if (isRecycleBin) {
          query.equalTo('deletedCategories', category);
          const itemsCount = category.get('itemCount') || 0;

          if (itemsCount > 0) {
            category.decrement('itemCount');
          }
        }
        else {
          query.equalTo('categories', category);
          const count = await query.count(USE_MASTER_KEY);

          category.set('itemCount', count);
        }

        await category.save(null, USE_MASTER_KEY);
      },
      concurrency: 10,
      request,
      endMessage: 'Job done',
    });

    return result;
  }
  catch (e) {
    logger.info({
      message: 'Error while executing job updateLinkedCategoryItemCountJob',
      errStack: (e as Error).stack,
      errMsg: (e as Error).message,
    });
  }
});
