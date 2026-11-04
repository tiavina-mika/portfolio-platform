
import type { DBRights } from '@/types/app.type';

import { TESTS_UI_RIGHT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { DEFAULT_DIAL_CODE } from '@/constants/_core/user.constants';
import { getAdminEmailSender } from '@/utils/_core/user.utils';
import {
  createBatchTestSchema, sendArticleToNewsletterTestSchema,
  sendVerificationCodeTestSchema, sendResetPasswordVerificationCodeTestSchema,
  sendInvitationTestSchema, sendWelcomeEmailTestSchema, sendVerificationCodeSmsTestSchema,
} from '@/validations/_core/test.validations';

import { sendWelcomeEmail } from '../../emails/_core/user.email';
import { Article } from '../../triggers/_core/article.triggers';
import {
  sendArticleToNewsletterEmails, sendEmailResetPassword, sendEmailVerification, sendInvitationEmail,
} from '../../utils/_core/email.utils.cloud';
import { runJob } from '../../utils/_core/job.utils.cloud';
import { assertHasBoRight } from '../../utils/_core/role.utils.cloud';
import { sendSmsVerification } from '../../utils/_core/sms.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

export const Test = Parse.Object.extend('Test');

/*
 * Every function of this file sends a real e-mail or SMS, or writes a batch of rows: holding any
 * BO role is not enough, the caller needs the "tests" right the "Divers" tab is gated with. The
 * interface check only hides that tab, so the right is re-checked here.
 */
const fromTestsBO = (
  action: (request: Parse.Cloud.FunctionRequest) => any,
  rights?: DBRights[],
  className?: string
) => fromBO(async (request: Parse.Cloud.FunctionRequest) => {
  await assertHasBoRight(request.user!, TESTS_UI_RIGHT, request.params?.locale);

  return action(request);
}, rights, className);

/**
 * lets the BO "test emails" tool populate its sender <Select> from the same closed list the
 * server validates against, instead of duplicating a hardcoded copy in a BO constant
 */
Parse.Cloud.define(
  'getTestEmailSendersOptions',
  fromTestsBO((): string[] => {
    return [getAdminEmailSender()].filter(Boolean) as string[];
  })
);

Parse.Cloud.define(
  'createBatchTest',
  fromTestsBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    await runJob('createBatchTestJob', { limit: request.params.limit });
  }, ['create']),
  parseFunctionValidation(createBatchTestSchema)
);

Parse.Cloud.define(
  'destroyBatchTest',
  fromTestsBO(async (): Promise<void> => {
    await runJob('destroyBatchTestJob');
  }, ['delete'])
);

Parse.Cloud.define(
  'sendArticleToNewsletterTest',
  fromTestsBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const {
      email, locale, articleId, sender,
    } = request.params;

    const query = new Parse.Query(Article);

    if (articleId) {
      query.equalTo('objectId', articleId);
    }

    const article = await query
      .equalTo('deleted', false)
      .equalTo('active', true)
      .include('createdBy')
      .first(USE_MASTER_KEY);

    if (!article) return false;

    // a test only ever reaches the address it was given — never the whole newsletter list
    return sendArticleToNewsletterEmails(email, article, locale, sender);
  }),
  parseFunctionValidation(sendArticleToNewsletterTestSchema)
);

Parse.Cloud.define(
  'sendVerificationCodeTest',
  /**
   * decoupled from any Parse.User lookup on purpose — this only exercises the
   * template + Brevo send, so it works in an environment with no test user in DB
   */
  fromTestsBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const {
      email, firstName, lastName, locale, sender,
    } = request.params;

    const isSent = await sendEmailVerification({ email, firstName, lastName }, '123456', locale, sender);

    return isSent;
  }),
  parseFunctionValidation(sendVerificationCodeTestSchema)
);

Parse.Cloud.define(
  'sendResetPasswordVerificationCodeTest',
  /**
   * decoupled from any Parse.User lookup on purpose — this only exercises the
   * template + Brevo send, so it works in an environment with no test user in DB
   */
  fromTestsBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const {
      email, firstName, lastName, locale, sender,
    } = request.params;

    const isSent = await sendEmailResetPassword({
      recipient: { email, firstName, lastName },
      code: '123456',
      locale,
      sender,
    });

    return isSent;
  }),
  parseFunctionValidation(sendResetPasswordVerificationCodeTestSchema)
);

Parse.Cloud.define(
  'sendInvitationTest',
  fromTestsBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { email, locale, sender } = request.params;

    const isSent = await sendInvitationEmail({
      email,
      inviterName: 'Test Admin',
      token: 'test-token',
      locale,
      sender,
    });

    return isSent;
  }),
  parseFunctionValidation(sendInvitationTestSchema)
);

Parse.Cloud.define(
  'sendWelcomeEmailTest',
  /**
   * decoupled from any Parse.User lookup on purpose — this only exercises the
   * template + Brevo send, so it works in an environment with no test user in DB
   */
  fromTestsBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const {
      email, firstName, lastName, locale, sender,
    } = request.params;

    const isSent = await sendWelcomeEmail({ email, firstName, lastName }, locale, sender);

    return isSent;
  }),
  parseFunctionValidation(sendWelcomeEmailTestSchema)
);

Parse.Cloud.define(
  'sendVerificationCodeSmsTest',
  /**
   * decoupled from any Parse.User lookup on purpose — this only exercises the
   * message template + MMSDuck send, so it works in an environment with no test user in DB
   */
  fromTestsBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { phoneNumber, locale } = request.params;

    // a template check from the back-office: always the default country's number
    const isSent = await sendSmsVerification(phoneNumber, '123456', locale, DEFAULT_DIAL_CODE);

    return isSent;
  }),
  parseFunctionValidation(sendVerificationCodeSmsTestSchema)
);
