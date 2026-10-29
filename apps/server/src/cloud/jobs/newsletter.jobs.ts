
import type { Locale } from '@/types/app.type';

import { USE_MASTER_KEY } from '@/utils/constants';
import { logger } from '@/utils/logger';
import { delay } from '@/utils/util';

import { Article } from '../triggers/article.triggers';
import { sendArticleToNewsletterEmails } from '../utils/email.utils.cloud';
import { runParallelJob } from '../utils/job.utils.cloud';


export const Test = Parse.Object.extend('Test');

interface ISendArticleToNewsletterParams {
  id?: string;
}
Parse.Cloud.job('sendArticleToNewsletterJob', async (request: Parse.Cloud.JobRequest<ISendArticleToNewsletterParams>): Promise<any> => {
  const { id } = request.params;

  if (!id) {
    logger.info('No id provided');
    throw new Error('cms.errors.idMissing');
  }

  logger.info({
    message: 'Start job sendArticleToNewsletterJob :' + id,
    id,
  });

  const article = await new Parse.Query(Article)
    .equalTo('objectId', id)
    .equalTo('deleted', false)
    .equalTo('active', true)
    .include('createdBy')
    .first(USE_MASTER_KEY);

  if (!article) return;

  const query = await new Parse.Query('Newsletter').equalTo('active', true).equalTo('deleted', false);

  try {
    const result = await runParallelJob<number>({
      query,
      worker: async (newsletter: Parse.Object) => {
        try {
          const locale = newsletter.get('language') as Locale;

          logger.info({
            message: 'Send article to newsletter :' + newsletter.get('email'),
            id,
            title: article.get('translated')[locale].title,
            locale,
          });
          await sendArticleToNewsletterEmails(newsletter.get('email'), article, locale);
        }
        catch (e) {
          logger.error({
            message: 'Send article to newsletter :' + newsletter.get('email') + ' failed',
            errStack: (e as Error).stack,
            errMsg: (e as Error).message,
          });
        }

        await delay(250);
      },
      concurrency: 20,
      request,
      endMessage: 'Job done',
    });

    return result;
  }
  catch (e) {
    logger.info({
      message: 'Error while executing job sendArticleToNewsletterJob',
      errStack: (e as Error).stack,
      errMsg: (e as Error).message,
    });
  }
});
