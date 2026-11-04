import type { Locale } from '@/types/app.type';

import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';
import { delay } from '@/utils/_core/utils';

import { Article } from '../../triggers/_core/article.triggers';
import { sendArticleToNewsletterEmails } from '../../utils/_core/email.utils.cloud';
import { defineJob, runParallelJob } from '../../utils/_core/job.utils.cloud';


export const Test = Parse.Object.extend('Test');

interface ISendArticleToNewsletterParams {
  id?: string;
}
defineJob('sendArticleToNewsletterJob', async (request: Parse.Cloud.JobRequest<ISendArticleToNewsletterParams>): Promise<any> => {
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

  const query = new Parse.Query('Newsletter')
    .equalTo('active', true)
    .equalTo('deleted', false)
    .select(['email', 'language']);

  try {
    const result = await runParallelJob<number>({
      query,
      worker: async (newsletter: Parse.Object) => {
        try {
          const locale = newsletter.get('language') as Locale;

          logger.info({
            message: 'Send article to newsletter :' + newsletter.id,
            id,
            title: article.get('translated')[locale].title,
            locale,
          });
          await sendArticleToNewsletterEmails(newsletter.get('email'), article, locale);
        }
        catch (e) {
          logger.error({
            message: 'Send article to newsletter :' + newsletter.id + ' failed',
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
