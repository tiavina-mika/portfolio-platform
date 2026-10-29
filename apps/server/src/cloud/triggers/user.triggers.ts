import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';
import type { ParseTriggerValidation } from '@/types/utils.type';

import {
  HIGHEST_LEVEL_ROLES, IS_PROD, OWNER_EMAILS, USE_MASTER_KEY,
} from '@/utils/constants';
import { logger } from '@/utils/logger';

import { updateRoleForUser } from '../services/userRole.service.cloud';
import { isAdministrator } from '../utils/role.utils.cloud';
import {
  getUserPlatforms, saveUserAndSendCodeToEmail, setUserBans, unsetBanned,
} from '../utils/user.utils.cloud';
import { parseFunction, signupTriggerValidation } from '../utils/utils.cloud';


/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  Parse.User,
  // eslint-disable-next-line @typescript-eslint/require-await
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest<Parse.User>): Promise<void> => {
    const user = request.object;
    const prevUser = request.original;
    const dirtyKeys = user.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;
    if (user.get('fromBO')) user.unset('fromBO');

    // ----------- creation ----------- //
    if (!user?.existed()) {
      user.set('deleted', false);
      user.set('platforms', [
        {
          name: user.get('platform'),
          count: 1,
          lastConnectedAt: dayjs().toDate(),
        },
      ]);

      return;
    }

    // ------------ platform ------------ //
    if (!prevUser) return;
    const newPlatforms = getUserPlatforms(prevUser, user);

    user.set('platforms', newPlatforms);
  }),
  // -------- validation -------- //
  signupTriggerValidation() as ParseTriggerValidation
);

/*
 * ----------------------------------------------------- //
 * -------------------- after save --------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.afterSave(
  Parse.User,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest<Parse.User>): Promise<void> => {
    const user = request.object;
    const currentUser = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    const { locale } = request.context;

    if (!user) return;

    // the platform data is now in platforms fields, so we can remove it
    user.unset('platform');

    // ----------- creation ----------- //
    if (!user.existed()) {
      if (IS_PROD) {
        await saveUserAndSendCodeToEmail(user, locale as Locale);
      }
      else {
        user.set('verified', true);
        await user.save(null, USE_MASTER_KEY);
      }

      /*
       * -------------------------------------------- //
       * ---- add default role for owner emails ----- //
       * -------------------------------------------- //
       * If the email of the created user is in the owner emails list
       * then add the highest level role to this user
       * In AfterSave, create the other default roles if not exist yet
       * IMPORTANT: The owner should be the first to create an account
       * So that he can have the highest level role and create other roles
       */
      if (OWNER_EMAILS.includes(user.get('email'))) {
        await updateRoleForUser([HIGHEST_LEVEL_ROLES[0]!], user);
      }
      return;
    }

    let isChanged = false;

    // ----------- update ----------- //
    if (dirtyKeys.includes('deleted') && user.get('deleted')) {
      user.set('deletedAt', dayjs().toDate());
      user.set('deletedBy', currentUser);
      isChanged = true;
    }

    if (dirtyKeys.includes('banned') && user.get('banned')) {
      setUserBans(user, currentUser);
      isChanged = true;
    }

    if (dirtyKeys.includes('bans') && !user.get('banned')) {
      unsetBanned(user);
      isChanged = true;
    }

    if (!isChanged) return;
    await user.save(null, USE_MASTER_KEY);
  })
);

/*
 * ----------------------------------------------------- //
 * -------------------- after delete ------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.afterDelete(
  Parse.User,
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest<Parse.User>): Promise<void> => {
    const user = request.object;
    const currentUser = request.user;

    logger.info(`User ${user.id} deleted from the database at ${dayjs().format()} by ${currentUser?.get('username')}`);

    if (!currentUser) return;
    const isAdmin = await isAdministrator(currentUser);

    if (!isAdmin) {
      throw new Error('Access denied');
    }
  })
);
