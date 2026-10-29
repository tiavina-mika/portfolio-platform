
import type { JobStatusData } from '@/types/utils.type';

import { USE_MASTER_KEY } from '@/utils/constants';

import { fromBO } from '../utils/utils.cloud';

Parse.Cloud.define('getJobStatus',
  fromBO(async (): Promise<JobStatusData[]> => {
    const status = await new Parse.Query('_JobStatus')
      .greaterThan('createdAt', new Date(Date.now() - (12 * 60 * 60 * 1000))) // the last 12 hours
      .select('createdAt', 'jobName', 'message', 'finishedAt', 'status')
      .addDescending('createdAt')
      .find(USE_MASTER_KEY);

    return status.map((status: Parse.Object) => {
      let data: JobStatusData = {
        objectId: status.id,
        status: status.get('status'),
        startDate: status.get('createdAt').toISOString(),
        name: status.get('jobName'),
      };

      const message = status.get('message');

      if (message) {
        if (message.startsWith('{')) {
          data = {
            ...data,
            ...JSON.parse(message),
          };
        }
        else {
          data.message = message;
        }
      }

      const finishedAt = status.get('finishedAt');

      if (finishedAt) {
        data.endDate = finishedAt.toISOString();
      }
      return data;
    });
  })
);

Parse.Cloud.define(
  'destroyObjects',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { ids, collection } = request.params;
    const objects = await new Parse.Query(collection)
      .containedIn('objectId', ids)
      .equalTo('deleted', true)
      .limit(10000)
      .find();

    const destroyedObjects = await Parse.Object.destroyAll(objects, USE_MASTER_KEY) || [];

    return destroyedObjects.length;
  }, ['destroy'])
);
