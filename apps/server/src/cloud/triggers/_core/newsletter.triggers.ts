import { USE_MASTER_KEY } from '@/constants/_core/constants';

import { runJob } from '../../utils/_core/job.utils.cloud';
import { parseFunction, setBooleanFields } from '../../utils/_core/utils.cloud';

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

    // ----------- creation ----------- //
    if (!newsletter.existed()) {
      /*
       * master key: this trigger runs inside the public website's anonymous save, and a Cloud
       * Code query carries no session of its own — `Newsletter` is deliberately not readable
       * without a role, so the plain query would be rejected and take the sign-up down with it
       */
      const existingNewsletter = await new Parse.Query(Newsletter)
        .equalTo('email', newsletter.get('email'))
        .select(['email'])
        .first(USE_MASTER_KEY);

      // no need to create a new newsletter if it already exists
      if (existingNewsletter) return;
      newsletter.set('deleted', false);
      // a double opt-in sign-up stays inactive until its address is confirmed
      newsletter.set('active', newsletter.get('confirmed') !== false);
      newsletter.set('seen', false);
      const user = await new Parse.Query(Parse.User).equalTo('email', newsletter.get('email')).first(USE_MASTER_KEY);

      if (!user) return;
      newsletter.set('user', user);

      return;
    }

    // set boolean fields (ex: deleted => { deletedAt: date, deletedBy: user })
    setBooleanFields(newsletter, request);
  })
);

Parse.Cloud.afterSave(
  'Newsletter',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const newsletter = request.object;
    const email = newsletter.get('email') as string;

    // ----------- creation ----------- //
    /*
     * a pending double opt-in address is not pushed to the mailing provider yet — the confirmation
     * does it, once the owner of the address has actually asked for the newsletter
     */
    if (!newsletter.existed() && newsletter.get('confirmed') !== false) {
      const linkedUser = newsletter.get('user');

      await runJob('createContactToCloudJob', {
        id: newsletter.id,
        email,
        firstName: linkedUser?.get('firstName') as string | undefined,
        lastName: linkedUser?.get('lastName') as string | undefined,
      });
    }
  })
);
