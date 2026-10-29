/* eslint-disable @typescript-eslint/require-await */

import { runJob } from '../utils/job.utils.cloud';
import { fromBO } from '../utils/utils.cloud';

Parse.Cloud.define(
  'clearRecycleBinInCloud',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { limit } = (request).params;

    await runJob('clearRecycleBinInCloudJob', { limit });
  })
);

/**
 * migrate data
 * hard coded change database data
 * function used in BO /misc page
 * @NOTE used only for temporary migration, the content should be removed after migration
 */
Parse.Cloud.define(
  'migrate',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    console.log('🚀 ~ fromBO ~ migrate:', request);
  })
);
