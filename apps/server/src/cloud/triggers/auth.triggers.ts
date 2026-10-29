/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 */

import { DISABLE_USER_ACCOUNT_CONFIRMATION, USE_MASTER_KEY } from '@/utils/constants';

import { parseFunction } from '../utils/utils.cloud';

/*
 * ------------------------------------------ //
 * -------------- before login -------------- //
 * ------------------------------------------ //
 */
Parse.Cloud.beforeLogin(
  parseFunction(async (request: Parse.Cloud.TriggerRequest): Promise<void> => {
    const user = request.object;

    if (!DISABLE_USER_ACCOUNT_CONFIRMATION) {
      if (!user.get('verified')) {
        // resend automatically the account verification code
        await Parse.Cloud.run('sendVerificationCode', { email: user.get('email') });
        return;
      }
    }

    user.set('isOnline', true);
    await user.save(null, USE_MASTER_KEY);
  })
);

/*
 * ------------------------------------------ //
 * -------------- after logout -------------- //
 * ------------------------------------------ //
 */
Parse.Cloud.afterLogout(
  parseFunction(async (request: Parse.Cloud.TriggerRequest): Promise<void> => {
    const { object: session } = request;
    const user = session.get('user');

    if (!user.has('email')) return; // anonymous user

    user.set('isOnline', false);
    await user.save(null, USE_MASTER_KEY);
  })
);
