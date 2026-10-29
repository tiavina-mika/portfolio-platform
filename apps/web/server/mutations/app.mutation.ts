'use server';

import { z } from 'zod';

import { action } from '@/config/safeAction';
import { collections } from '@/utils/constants';
import { setValues } from '@/utils/parse.utils';
import {
  ContactSchema,
} from '@/validations/app.validations';
import { getParseServer } from '@/config/parse-server.config';
import { IContact } from '@/types/app.type';

const CONTACT_PROPERTIES = new Set(['email', 'name', 'message']);

const Parse = getParseServer();

export const createContact = action
  .inputSchema(ContactSchema)
  .bindArgsSchemas<[z.ZodString]>([z.string()])
  .action(async ({ parsedInput: values, bindArgsParsedInputs: [locale] }) => {
    const Contact = Parse.Object.extend(collections.Contact);
    const contact = new Contact();

    setValues<IContact>(contact, values, CONTACT_PROPERTIES);

    const context = locale ? { locale } : {};

    // the context is used to pass the locale to the trigger hooks for server side error messages
    await contact.save(null, { context });

    return {
      success: true,
    };
  });


/**
 * this function is not used for now
 * when the authentication is implemented, this function will be used to save the user language
 * @param user
 * @param locale
 */
export const saveUserLanguage = async (user: Parse.User, locale: string) => {
  await Parse.Cloud.run('saveUserLanguage', { userId: user.id, locale });
};

/**
 * increment the number of shares on social media
 * when clicking an icon or a link
 * NOTE: set the total of all share if server beforeSave
 */
export const incrementShareCountBySocial = async (
  id: string,
  collection: string,
  social: string
) => {
  const Parse = getParseServer();
  const entity = await new Parse.Query(collection).get(id);
  const prevShares = entity.get('shares') || {};

  // e.g. { facebook: 1, linkedin: 2, ... }
  const shares = {
    ...prevShares,
    [social]: prevShares[social] ? prevShares[social] + 1 : 1,
  };

  entity.set('shares', shares);
  await entity.save();
};
