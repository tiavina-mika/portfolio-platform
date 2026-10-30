'use server';

import { z } from 'zod';

import { action } from '@/config/safe-action';
import {
  NewsletterSchema,
  ResubscribeToNewsletterSchema,
  UnsubscribeReasonSchema,
} from '@/validations/app.validations';
import { getParseServer } from '@/config/parse-server.config';
import { assertNewsletterFormAllowed } from '@/server/formRateLimit.server';

const Parse = getParseServer();

export const createNewsletter = action
  .inputSchema(NewsletterSchema)
  .bindArgsSchemas<[z.ZodString, z.ZodString]>([z.string(), z.string()])
  .action(async ({ parsedInput: values, bindArgsParsedInputs: [locale, recaptchaToken] }) => {
    // counted per visitor, for the same reason as the contact form
    await assertNewsletterFormAllowed();

    /*
     * Same as the contact form: the token is forwarded, not spent here — Google accepts it once,
     * and the check belongs on the side that writes the row. It throws
     * `recaptchaVerificationFailed`, translated through the `ServerError` namespace.
     */
    await Parse.Cloud.run('subscribeToNewsletter', {
      ...values,
      language: locale,
      recaptchaToken,
    });

    return {
      success: true,
    };
  });

export const resubscribeToNewsletter = action
  .inputSchema(ResubscribeToNewsletterSchema)
  .bindArgsSchemas<[z.ZodString]>([z.string()])
  .action(async ({ parsedInput: values, bindArgsParsedInputs: [locale] }) => {
    const hasEmail = await Parse.Cloud.run('resubscribeNewsletter', { ...values, locale });

    return hasEmail;
  });


export const addReasonToUnsubscribeToTheNewsletter = action
  .inputSchema(UnsubscribeReasonSchema)
  .bindArgsSchemas<[z.ZodString]>([z.string()])
  .action(async ({ parsedInput: values, bindArgsParsedInputs: [locale] }) => {
    const result = await Parse.Cloud.run(
      'addReasonToUnsubscribeToTheNewsletter',
      { ...values, locale }
    );

    return {
      success: result,
    };
  });
