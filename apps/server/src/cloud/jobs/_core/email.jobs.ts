import { logger } from '@/utils/_core/logger';

import { createContactToCloud } from '../../utils/_core/email.utils.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

interface ICreateContactToCloudJobParams {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
defineJob('createContactToCloudJob', async (request: Parse.Cloud.JobRequest<ICreateContactToCloudJobParams>): Promise<any> => {
  const {
    id, email, firstName, lastName,
  } = request.params;

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

  const user = new Parse.User();

  user.set('email', email);
  user.set('firstName', firstName ?? '');
  user.set('lastName', lastName ?? firstName ?? '');

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
