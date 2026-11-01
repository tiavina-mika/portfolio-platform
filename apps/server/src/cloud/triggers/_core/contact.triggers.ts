

import dayjs from 'dayjs';

import { type ParseTriggerValidation } from '@/types/utils.type';
import { logger } from '@/utils/_core/logger';
import { contactSchema } from '@/validations/_core/app.validations';

import { createContactToCloud } from '../../utils/_core/email.utils.cloud';
import { createNewsletter } from '../../utils/_core/user.utils.cloud';
import { parseFunction, setBooleanFields } from '../../utils/_core/utils.cloud';
import { parseTriggerValidation } from '../../utils/_core/validation.utils.cloud';

export const Contact = Parse.Object.extend('Contact');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Contact',
  // eslint-disable-next-line @typescript-eslint/require-await
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const contact = request.object;
    const context = request.context;

    request.context.dirtyKeys = contact.dirtyKeys();

    // ------- edition ------- //
    if (contact.existed()) {
      // set boolean fields (ex: deleted => { deletedAt: date, deletedBy: user })
      setBooleanFields(contact, request, ['deleted', 'seen']);

      return;
    }

    // ------- creation ------- //
    contact.set('deleted', false);
    // unread until an admin opens it; it has to exist as `false` since Mongo matches no absent field
    contact.set('seen', false);

    if (context?.locale) {
      contact.set('locale', context.locale);
    }
  }),
  parseTriggerValidation(contactSchema) as ParseTriggerValidation
);

Parse.Cloud.afterSave(
  'Contact',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const contact = request.object;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    if (!contact) return;

    // ----------- edition ----------- //
    if (contact.existed()) {
      if (dirtyKeys.includes('acceptNewsLetter') && contact.get('acceptNewsLetter')) {
        const newsletter = await createNewsletter(contact.get('email'), contact.get('locale'));

        if (newsletter) {
          logger.info(
            `Newsletter ${newsletter.id} created from contact ${contact.id} at ${dayjs().format()}`
          );
        }
      }

      return;
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
