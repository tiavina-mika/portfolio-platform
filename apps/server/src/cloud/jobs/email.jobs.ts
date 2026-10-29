
import { logger } from '@/utils/logger';

import { createContactToCloud } from '../utils/email.utils.cloud';

interface ISendArticleToNewsletterParams {
  id?: string;
  email?: string;
}
Parse.Cloud.job('createContactToCloudJob', async (request: Parse.Cloud.JobRequest<ISendArticleToNewsletterParams>): Promise<any> => {
  const { id, email } = request.params;

  if (!id) {
    logger.info('No id provided');
    throw new Error('Missing id');
  }
  if (!email) {
    logger.info('No email provided');
    throw new Error('Missing email');
  }

  logger.info({
    message: 'Start job createContactToCloudJob :' + id,
    id,
  });

  // NOTE: we don't need to save the user here, just create a Parse.User object
  const user = new Parse.User();

  user.set('email', email);
  const name = email.split('@')[0]!;
  const lastName = name.split('.')[1];
  const firstName = name.split('.')[0];

  if (!lastName) {
    user.set('lastName', firstName);
  }
  else {
    user.set('firstName', firstName);
    user.set('lastName', lastName);
  }
  try {
    const result = await createContactToCloud(user, id);

    return result;
  }
  catch (e) {
    logger.info({
      message: 'Error while executing job createContactToCloudJob',
      errStack: (e as Error).stack,
      errMsg: (e as Error).message,
    });
  }
});
