

import dayjs from 'dayjs';

import type { ParseTriggerValidation } from '@/types/utils.type';

import { USE_MASTER_KEY } from '@/utils/constants';
import { logger } from '@/utils/logger';
import { getContactSchema } from '@/validations/email.validation';

import { createContactToCloud } from '../utils/email.utils.cloud';
import { parseFunction, parseTriggerValidation } from '../utils/utils.cloud';

export const Contact = Parse.Object.extend('Contact');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Contact',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void | undefined> => {
    const contact = request.object;
    const context = request.context;
    const dirtyKeys = contact.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;

    const user = await new Parse.Query(Parse.User).equalTo('email', contact.get('email')).first(USE_MASTER_KEY);

    if (contact.existed()) return;
    contact.set('deleted', false);
    contact.set('replied', false);

    if (context?.locale) {
      contact.set('locale', context.locale);
    }

    if (!user) return;
    contact.set('user', user);
  }),
  parseTriggerValidation(getContactSchema) as ParseTriggerValidation
);

Parse.Cloud.afterSave(
  'Contact',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const contact = request.object;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    if (!contact) return;

    // ----------- creation ----------- //
    if (contact.existed()) {
      let hasChanged = false;

      if (dirtyKeys.includes('replied') && contact.get('replied')) {
        logger.info(`Contact ${contact.id} replied at ${dayjs().format()}`);
        contact.set('repliedAt', new Date());
        contact.set('repliedBy', user);
        hasChanged = true;
      }

      if (!hasChanged) return;
      await contact.save();
    }

    const contactObj = { email: contact.get('email'), lastName: contact.get('name') };

    await createContactToCloud(contactObj, contact.id);
  })
);

Parse.Cloud.afterDelete(
  'Contact',
  // eslint-disable-next-line @typescript-eslint/require-await
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void | boolean> => {
    const article = request.object;
    const user = request.user;

    logger.info(`Contact ${article.id} deleted from the database at ${dayjs().format()} by ${user?.get('username')}`);
  })
);
