
import { getTranslations } from 'next-intl/server';
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import Parse from 'parse';

import env from '@/env';

export class ActionError extends Error {}

const handleServerError = async (e: Error) => {
  const t = await getTranslations('ServerError');

  // If the error is an instance of `ActionError`, unmask the message.
  if (e instanceof ActionError) {
    return e.message;
  }

  if (e instanceof Parse.Error) {
    /*
     * the message from the server should be a translation key
     * that will be translated on the client
     */
    const translatedMessage = t(e.message as any);
    // ex: 'ServerError.Some error message there'
    const isNotKey = translatedMessage.includes('ServerError');
    // ex: ['Some', 'error', 'message', 'there'], that means it's a message, not a translation key
    const splittedKeys = e.message.split(' ');
    const isMessage = splittedKeys.length > 1;

    if (isNotKey) {
      /*
       * If the message is not a key, return the message.
       * ex: 'Something went wrong'
       */
      if (isMessage) {
        return e.message;
      }

      // If the message is a key, but the translation is not found, return a default message.
      return t('somethingWentWrong');
    }

    return translatedMessage;
  }

  let serverActionErrorMessage = '';

  const translatedMessage = t(e.message as any);

  if (translatedMessage.includes('ServerError')) {
    serverActionErrorMessage = translatedMessage;
  } else {
    serverActionErrorMessage = DEFAULT_SERVER_ERROR_MESSAGE;
  }
  // Otherwise return default error message.
  return serverActionErrorMessage;
};

export const action = createSafeActionClient({
  handleServerError,
})
  .use(async ({ next, clientInput, metadata }) => {
    const startTime = performance.now();

    // Here we await the action execution.
    const result = await next();

    // dev-only debug logging — client input can contain PII (contact/newsletter form payloads)
    if (env.APP_ENV === 'development') {
      const endTime = performance.now();

      console.log('Result ->', result);
      console.log('Client input ->', clientInput);
      console.log('Metadata ->', metadata);
      console.log('Action execution took', (endTime - startTime) / 1000, 's');
    }

    // And then return the result of the awaited action.
    return result;
  });
