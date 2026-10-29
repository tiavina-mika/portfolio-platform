
import { translate } from '@/config/i18next';
import { USE_MASTER_KEY } from '@/utils/constants';

import { Article } from '../triggers/article.triggers';
import { sendArticleToNewsletterEmails, sendEmailVerification } from '../utils/email.utils.cloud';
import { runJob } from '../utils/job.utils.cloud';
import { fromBO } from '../utils/utils.cloud';

export const Test = Parse.Object.extend('Test');

Parse.Cloud.define(
  'createBatchTest',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const result = await runJob('createBatchTestJob', { limit: request.params.limit });

    console.log('🚀 ~ createBatchTest ~ result:', result);
  }, ['create'])
);

Parse.Cloud.define(
  'destroyBatchTest',
  fromBO(async (): Promise<void> => {
    const result = await runJob('destroyBatchTestJob');

    console.log('🚀 ~ destroyBatchTest ~ result:', result);
  }, ['delete'])
);

Parse.Cloud.define(
  'sendArticleToNewsletterTest',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { email, locale, articleId } = request.params;

    const query = new Parse.Query(Article);

    if (articleId) {
      query.equalTo('objectId', articleId);
    }

    const article = await query
      .equalTo('deleted', false)
      .equalTo('active', true)
      .include('createdBy')
      .first(USE_MASTER_KEY);

    if (!article) return;
    // send article only for a specified email
    if (email) {
      await sendArticleToNewsletterEmails(email, article, locale);
      return;
    }
    // send article to all newsletter emails
    await runJob('sendArticleToNewsletterJob', { articleId: article.id });
  })
);

Parse.Cloud.define(
  'sendVerificationCodeTest',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { email, locale } = (request).params;
    const user = await new Parse.Query(Parse.User).equalTo('email', email).first(USE_MASTER_KEY);

    if (!user) throw new Error(translate('user.noAccountByEmail', locale));

    const isSent = await sendEmailVerification(user, '123456', locale);

    return isSent;
  })
);

Parse.Cloud.define(
  'sendResetPasswordVerificationCodeTest',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { email, locale } = (request).params;
    const isSent = await Parse.Cloud.run('sendResetPasswordVerificationCode', { email, locale });

    return isSent;
  })
);
