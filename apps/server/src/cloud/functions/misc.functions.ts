

import { runJob } from '../utils/job.utils.cloud';
import { fromBO } from '../utils/utils.cloud';

Parse.Cloud.define(
  'clearRecycleBinInCloud',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { limit } = (request).params;

    await runJob('clearRecycleBinInCloudJob', { limit });
  })
);
