
import { destroyOldFilesAfterUpdate } from '@/utils/cms.utils';

import { isFieldChanged } from '../utils/parse.utils.cloud';
import { parseFunction } from '../utils/utils.cloud';

export const App = Parse.Object.extend('App');

Parse.Cloud.afterSave(
  'App',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const app = request.object;
    const prevApp = request.original;
    const user = request.user;

    if (!user) return;

    // ----------- creation ----------- //
    if (!app.existed() || !prevApp) return;

    // ----------- update ----------- //
    for (const field of ['image', 'imageForDarkMode', 'cv']) {
      if (isFieldChanged(app, prevApp, field)) {
        await destroyOldFilesAfterUpdate(app, prevApp, {
          singleFileFields: [field],
          multipleFilesFields: [],
        });
      }
    }
  })
);
