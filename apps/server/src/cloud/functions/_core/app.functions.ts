import dayjs from 'dayjs';

import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { decrypt } from '@/utils/_core/encrypt.utils';
import { getObjectsCountSchema, incrementShareCountSchema } from '@/validations/_core/app.validations';
import { addUnsubscribeNewsletterSchema, unsubscribeNewsletterSchema } from '@/validations/_core/email.validations';

import { countBadgeObjects } from '../../services/_core/badgeCount.service.cloud';
import { findNewsletterOfLink } from '../../services/_core/newsletter.service.cloud';
import { sendNewsletterUnsubscribeConfirmationEmail } from '../../utils/_core/email.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'unsubscribeNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { encryptedEmail, locale, target } = (request).params;
    const decryptedEmail = decrypt(encryptedEmail, null, false);
    const newsletter = await findNewsletterOfLink(decryptedEmail as string, target);

    if (!newsletter) {
      return false;
    }

    if (newsletter.get('active') === false) {
      return true;
    }

    newsletter.set('active', false);
    newsletter.set('unsubscribeAt', dayjs().toDate());
    const updatedEmail = await newsletter.save(null, USE_MASTER_KEY);

    await sendNewsletterUnsubscribeConfirmationEmail(
      decryptedEmail as string, locale, newsletter.get('target')
    );

    return !!updatedEmail.get('email');
  }),
  // -------- validation -------- //
  parseFunctionValidation(unsubscribeNewsletterSchema)
);

Parse.Cloud.define(
  'resubscribeNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { encryptedEmail, target } = (request).params;
    const decryptedEmail = decrypt(encryptedEmail, null, false);
    const newsletter = await findNewsletterOfLink(decryptedEmail as string, target);

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
  parseFunctionValidation(unsubscribeNewsletterSchema)
);

Parse.Cloud.define(
  'addReasonToUnsubscribeToTheNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { encryptedEmail, reason, target } = (request).params;
    const decryptedEmail = decrypt(encryptedEmail, null, false);
    const newsletter = await findNewsletterOfLink(decryptedEmail as string, target);

    if (!newsletter || (newsletter?.get('active') === true)) {
      return false;
    }

    newsletter.set('reason', reason);
    const updatedEmail = await newsletter.save(null, USE_MASTER_KEY);

    return !!updatedEmail.get('email');
  }),
  // -------- validation -------- //
  parseFunctionValidation(addUnsubscribeNewsletterSchema)
);

/**
 * Back-office badge counts. Left open, it reported how many accounts or pending
 * reports the platform holds to anyone who could reach the API — only the BO ever asks.
 */
Parse.Cloud.define(
  'getObjectsCount',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { className, status } = request.params;

    return countBadgeObjects(className, status, request.user);
  }),
  parseFunctionValidation(getObjectsCountSchema)
);

/**
 * Increment an Article/Page share counter for one social network. Called by the public website
 * with no session at all, so it runs with the master key rather than relying on a client-side
 * `save()`: `Article`/`Page` are world-readable but never world-writable, and granting a visitor
 * `update` on published content to bump a counter would let anyone rewrite an article.
 * The `totalMediaShare` roll-up is handled by the shared CMS `beforeSave` trigger.
 */
Parse.Cloud.define(
  'incrementShareCount',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<number> => {
    const { id, className, social } = request.params as {
      id: string; className: string; social: string;
    };

    const item = await new Parse.Query(className)
      .select(['shares'])
      .get(id, USE_MASTER_KEY);

    const previousShares = item.get('shares') || {};
    const shares = { ...previousShares, [social]: (previousShares[social] || 0) + 1 };

    item.set('shares', shares);
    await item.save(null, USE_MASTER_KEY);

    return shares[social] as number;
  }),
  // -------- validation -------- //
  parseFunctionValidation(incrementShareCountSchema)
);
