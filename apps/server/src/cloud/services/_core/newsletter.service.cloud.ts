import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE } from '@/config/i18n';
import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { generateSingleUseToken, hashSingleUseToken } from '@/utils/_core/encrypt.utils';
import { logger } from '@/utils/_core/logger';

import { sendNewsletterConfirmationEmail } from '../../emails/_core/newsletter.email';
import { runJob } from '../../utils/_core/job.utils.cloud';

// `Parse.Object.extend` is idempotent — the same subclass the Newsletter triggers register
const Newsletter = Parse.Object.extend(collections.Newsletter);

const NEWSLETTER_FIELDS = ['email', 'language', 'active', 'confirmed'];

/**
 * Newsletter sign-up from the public website, with a double opt-in: the address is recorded as
 * pending (`confirmed: false`, `active: false`) and only starts receiving articles once its owner
 * opens the link e-mailed to it. Anyone can type any address in the form, and a list fed that way
 * mails people who never asked — which is also what gets a sending domain flagged as spam.
 *
 * The link carries a random token of which only the hash is stored: the address itself, even
 * encrypted, would not do — the cipher the unsubscribe link uses can be edited into another
 * address without knowing the key.
 *
 * An address already subscribed is left as it is and the caller gets the same answer either way,
 * so the form cannot be used to find out who is on the list. An address that unsubscribed, or
 * never confirmed, gets a fresh confirmation link.
 */
export const subscribeToNewsletterService = async (email: string, language?: string): Promise<void> => {
  const locale = (language ?? DEFAULT_LANGUAGE) as Locale;
  const existing = await new Parse.Query(Newsletter)
    .equalTo('email', email)
    .select(NEWSLETTER_FIELDS)
    .first(USE_MASTER_KEY);

  if (existing?.get('active')) return;

  const newsletter = existing ?? new Newsletter();
  const token = generateSingleUseToken();

  newsletter.set('email', email);
  newsletter.set('language', locale);
  newsletter.set('active', false);
  newsletter.set('confirmed', false);
  newsletter.set('confirmationTokenHash', hashSingleUseToken(token));
  await newsletter.save(null, USE_MASTER_KEY);

  const isSent = await sendNewsletterConfirmationEmail(email, token, locale);

  if (!isSent) {
    logger.error('subscribeToNewsletterService: confirmation email not sent', {
      newsletterId: newsletter.id,
    });
  }
};

/**
 * Second half of the double opt-in: the owner of the address opened the link. Idempotent — opening
 * the link twice (or a mail client prefetching it) confirms once. The contact is only pushed to the
 * mailing provider now, so a pending address never lands in its lists.
 * @returns whether the link matches an address, now on the list; false for an unknown link
 */
export const confirmNewsletterSubscriptionService = async (token: string): Promise<boolean> => {
  const newsletter = await new Parse.Query(Newsletter)
    .equalTo('confirmationTokenHash', hashSingleUseToken(token))
    .select(NEWSLETTER_FIELDS)
    .first(USE_MASTER_KEY);

  if (!newsletter) return false;
  if (newsletter.get('confirmed') !== false) return true;

  newsletter.set('confirmed', true);
  newsletter.set('confirmedAt', new Date());
  newsletter.set('active', true);
  await newsletter.save(null, USE_MASTER_KEY);

  // the subscription stands even if the provider sync cannot be started — it is only a copy
  try {
    await runJob('createContactToCloudJob', { id: newsletter.id, email: newsletter.get('email') });
  }
  catch (error) {
    logger.error('confirmNewsletterSubscriptionService: provider sync not started', {
      newsletterId: newsletter.id,
      error: (error as Error).message,
    });
  }

  return true;
};
