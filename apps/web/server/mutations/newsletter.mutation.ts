'use server';

import { z } from 'zod';

import { action } from '@/config/safeAction';
import { collections } from '@/utils/constants';
import { setValues } from '@/utils/parse.utils';
import {
  NewsletterSchema,
  ResubscribeToNewsletterSchema,
  UnsubscribeReasonSchema,
} from '@/validations/app.validations';
import { getParseServer } from '@/config/parse-server.config';

const NEWSLETTER_PROPERTIES = new Set(['email', 'language']);

const Parse = getParseServer();

export const createNewsletter = action
  .inputSchema(NewsletterSchema)
  .bindArgsSchemas<[z.ZodString]>([z.string()])
  .action(async ({ parsedInput: values, bindArgsParsedInputs: [locale] }) => {
    const Newsletter = Parse.Object.extend(collections.Newsletter);
    const newsLetter = new Newsletter();

    const newValues = { ...values, language: locale };

    setValues(newsLetter, newValues, NEWSLETTER_PROPERTIES);

    await newsLetter.save();

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
