import dayjs from 'dayjs';

import { USE_MASTER_KEY } from '@/utils/constants';
import { decrypt } from '@/utils/encrypt.utils';
import { addUnsubscribeNewsletterSchema, getUnsubscribeNewsletterSchema } from '@/validations/email.validation';

import { Newsletter } from '../triggers/newsletter.triggers';
import { parseFunction, parseFunctionValidation } from '../utils/utils.cloud';

Parse.Cloud.define(
  'unsubscribeNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { encryptedEmail } = (request).params;
    const decryptedEmail = decrypt(encryptedEmail, null, false);
    const newsletter = await new Parse.Query(Newsletter).equalTo('email', decryptedEmail).first(USE_MASTER_KEY);

    if (!newsletter) {
      return false;
    }

    if (newsletter.get('active') === false) {
      return true;
    }

    newsletter.set('active', false);
    newsletter.set('unsubscribeAt', dayjs().toDate());
    const updatedEmail = await newsletter.save(null, USE_MASTER_KEY);

    return !!updatedEmail.get('email');
  }),
  // -------- validation -------- //
  parseFunctionValidation(getUnsubscribeNewsletterSchema)
);

Parse.Cloud.define(
  'resubscribeNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { encryptedEmail } = (request).params;
    const decryptedEmail = decrypt(encryptedEmail, null, false);
    const newsletter = await new Parse.Query(Newsletter).equalTo('email', decryptedEmail).first(USE_MASTER_KEY);

    if (!newsletter) {
      return false;
    }

    if (newsletter.get('active') === true) {
      return true;
    }

    newsletter.set('active', true);
    newsletter.unset('unsubscribeAt');
    const updatedEmail = await newsletter.save(null, USE_MASTER_KEY);

    return !!updatedEmail.get('email');
  }),
  // -------- validation -------- //
  parseFunctionValidation(getUnsubscribeNewsletterSchema)
);

Parse.Cloud.define(
  'addReasonToUnsubscribeToTheNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { encryptedEmail, reason } = (request).params;
    const decryptedEmail = decrypt(encryptedEmail, null, false);
    const newsletter = await new Parse.Query(Newsletter).equalTo('email', decryptedEmail).first(USE_MASTER_KEY);

    if (!newsletter || (newsletter && newsletter.get('active') === true)) {
      return false;
    }

    newsletter.set('reason', reason);
    const updatedEmail = await newsletter.save(null, USE_MASTER_KEY);

    return !!updatedEmail.get('email');
  }),
  // -------- validation -------- //
  parseFunctionValidation(addUnsubscribeNewsletterSchema)
);

Parse.Cloud.define(
  'getObjectsCount',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { className } = request.params;

    let query;

    if (className === '_User') {
      query = new Parse.Query(Parse.User);
    }
    else {
      query = new Parse.Query(className);
    }

    const count = await query
      .equalTo('seen', false)
      .equalTo('deleted', false)
      .count(USE_MASTER_KEY);

    return count;
  })
);
