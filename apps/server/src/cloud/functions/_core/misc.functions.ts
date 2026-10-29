import { MIGRATIONS_UI_RIGHT } from '@/constants/_core/constants';
import {
  clearRecycleBinInCloudSchema, purgeOrphanedEditorFilesInCloudSchema,
} from '@/validations/_core/misc.validations';

import { runJob } from '../../utils/_core/job.utils.cloud';
import { assertHasBoRight } from '../../utils/_core/role.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'clearRecycleBinInCloud',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { limit } = (request).params;

    await assertHasBoRight(request.user!, MIGRATIONS_UI_RIGHT, request.params?.locale);
    await runJob('clearRecycleBinInCloudJob', { limit });
  }),
  parseFunctionValidation(clearRecycleBinInCloudSchema)
);

/**
 * manual on-demand trigger for `purgeOrphanedEditorFilesJob` (also runs daily via cron, see
 * `index.ts`) — used by the BO /misc page so an admin can purge orphaned CMS editor images
 * (Page/Article TipTap uploads) without waiting for the next scheduled run
 */
Parse.Cloud.define(
  'purgeOrphanedEditorFilesInCloud',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { olderThanHours } = (request).params;

    await assertHasBoRight(request.user!, MIGRATIONS_UI_RIGHT, request.params?.locale);
    await runJob('purgeOrphanedEditorFilesJob', { olderThanHours });
  }),
  parseFunctionValidation(purgeOrphanedEditorFilesInCloudSchema)
);
