
import { USE_MASTER_KEY } from '@/utils/constants';

import { runJob } from '../utils/job.utils.cloud';
import { parseFunction } from '../utils/utils.cloud';

export const Newsletter = Parse.Object.extend('Newsletter');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Newsletter',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const newsletter = request.object;
    const dirtyKeys = newsletter.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;
    // ----------- creation ----------- //
    if (!newsletter.existed()) {
      const existingNewsletter = await new Parse.Query(Newsletter).equalTo('email', newsletter.get('email')).first();

      // no need to create a new newsletter if it already exists
      if (existingNewsletter) return;
      newsletter.set('deleted', false);
      newsletter.set('active', true);
      const user = await new Parse.Query(Parse.User).equalTo('email', newsletter.get('email')).first(USE_MASTER_KEY);

      if (!user) return;
      newsletter.set('user', user);
    }
  })
);

Parse.Cloud.afterSave(
  'Newsletter',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const newsletter = request.object;
    const email = newsletter.get('email');

    // ----------- creation ----------- //
    if (!newsletter.existed()) {
      await runJob('createContactToCloudJob', { id: newsletter.id, email });
    }
  })
);
