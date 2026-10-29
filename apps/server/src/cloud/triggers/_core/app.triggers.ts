/* eslint-disable @typescript-eslint/require-await */
import { destroyOldFilesAfterUpdate } from '../../utils/_core/cms.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

export const App = Parse.Object.extend('App');

Parse.Cloud.beforeSave(
  'App',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const app = request.object;
    const user = request.user;

    if (!user) {
      throw new Error('User not found');
    }
    const dirtyKeys = app.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;
  })
);
Parse.Cloud.afterSave(
  'App',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const app = request.object;
    const prevApp = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    if (!user) return;

    // ----------- creation ----------- //
    if (!app.existed() || !prevApp) return;

    // ----------- update ----------- //
    for (const field of ['image', 'imageForDarkMode', 'cv']) {
      if (dirtyKeys.includes(field)) {
        await destroyOldFilesAfterUpdate(app, prevApp, {
          singleFileFields: [field],
          multipleFilesFields: [],
        });
      }
    }
  })
);
