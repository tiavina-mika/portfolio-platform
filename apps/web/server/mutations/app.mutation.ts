'use server';

import { z } from 'zod';

import { action } from '@/config/safe-action';
import {
  ContactSchema,
} from '@/validations/app.validations';
import { getParseServer } from '@/config/parse-server.config';
import { assertContactFormAllowed } from '@/server/formRateLimit.server';

const Parse = getParseServer();

export const createContact = action
  .inputSchema(ContactSchema)
  .bindArgsSchemas<[z.ZodString, z.ZodString]>([z.string(), z.string()])
  .action(async ({ parsedInput: values, bindArgsParsedInputs: [locale, recaptchaToken] }) => {
    /*
     * Counted per visitor before the call: the API server sees the website's address for every
     * visitor, so its own cap can only protect the site as a whole.
     */
    await assertContactFormAllowed();

    /*
     * The token is forwarded rather than checked here: Google accepts it exactly once, and the
     * check has to happen on the side that performs the write. Writing the row from here meant
     * the Contact class had to be publicly creatable, which handed the same write to anyone
     * holding the app id — with no token to show for it. The ticket's source is stamped by the
     * Cloud Function for the same reason. It throws `recaptchaVerificationFailed`, which
     * handleServerError translates through the `ServerError` namespace.
     */
    await Parse.Cloud.run('createPublicContact', { ...values, locale, recaptchaToken });

    return {
      success: true,
    };
  });


/**
 * this function is not used for now
 * when the authentication is implemented, this function will be used to save the user language
 * The account is the one the Parse session identifies — the server refuses to act on any other.
 * @param locale
 */
export const saveUserLanguage = async (locale: string) => {
  await Parse.Cloud.run('saveUserLanguage', { locale });
};

/**
 * increment the number of shares on social media
 * when clicking an icon or a link
 * NOTE: set the total of all share if server beforeSave
 *
 * Goes through a Cloud Function rather than reading + saving the object here: this site talks to
 * Parse with no session and no master key, and articles/pages are world-readable but never
 * world-writable — the counter is bumped server-side with the master key instead.
 */
export const incrementShareCountBySocial = async (
  id: string,
  collection: string,
  social: string
) => {
  const Parse = getParseServer();

  await Parse.Cloud.run('incrementShareCount', { id, className: collection, social });
};

/**
 * increment the number of views of an article, once per browsing session
 * (the caller — ArticleViewTracker — is what guarantees the "once")
 *
 * Goes through a Cloud Function for the same reason as the share counter above: this site talks to
 * Parse with no session and no master key, and articles are world-readable but never world-writable.
 */
export const incrementArticleViewCount = async (id: string) => {
  const Parse = getParseServer();

  await Parse.Cloud.run('incrementArticleViewCount', { id });
};
