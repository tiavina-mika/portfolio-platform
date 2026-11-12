/* eslint-disable @typescript-eslint/require-await */
import { revalidateWebCacheTag } from '@/utils/_core/revalidate.utils';

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

    /*
     * the website caches the App (CV, images, quote) for hours; without this it keeps handing out
     * the public id of a CV that was just replaced and deleted
     */
    await revalidateWebCacheTag('app');

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
