import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';

import { Category } from '../../triggers/_core/category.triggers';
import { defineJob, runParallelJob } from '../../utils/_core/job.utils.cloud';

defineJob('updateLinkedCategoryItemCountJob', async (request: Parse.Cloud.JobRequest): Promise<any> => {
  const { categoryIds = [], className, isRecycleBin = false } = request.params;

  try {
    const query = new Parse.Query(Category)
      .containedIn('objectId', categoryIds)
      .include(['parentCategory', 'parentCategory.parentCategory']);

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
          const itemsCount = await query.count(USE_MASTER_KEY);

          // subcategories linked to this category also count as "items" (BO lists them the same way)
          const subCategoriesCount = await new Parse.Query(Category)
            .equalTo('parentCategory', category)
            .equalTo('active', true)
            .notEqualTo('deleted', true)
            .count(USE_MASTER_KEY);

          category.set('itemCount', itemsCount + subCategoriesCount);
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
