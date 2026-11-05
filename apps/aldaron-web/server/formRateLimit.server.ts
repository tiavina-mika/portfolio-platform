import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { ActionError } from '@/config/safe-action';
import { FORM_RATE_LIMIT_REQUESTS, FORM_RATE_LIMIT_WINDOW } from '@/utils/constants';

import { createVisitorRateLimit, getVisitorIp } from './visitorRateLimit.server';

const isContactFormLimited = createVisitorRateLimit(
  'ratelimit:web:contactForm',
  FORM_RATE_LIMIT_REQUESTS,
  FORM_RATE_LIMIT_WINDOW
);

const isNewsletterFormLimited = createVisitorRateLimit(
  'ratelimit:web:newsletterForm',
  FORM_RATE_LIMIT_REQUESTS,
  FORM_RATE_LIMIT_WINDOW
);

/*
 * A request that carries no address is let through rather than counted under a shared name: every
 * such visitor would otherwise draw on one allowance, which is the very problem this limit solves.
 * The API server keeps its own website-wide cap behind it.
 */
const assertNotLimited = async (isLimited: (visitorIp: string) => Promise<boolean>) => {
  const visitorIp = getVisitorIp(await headers());

  if (visitorIp && await isLimited(visitorIp)) {
    const t = await getTranslations('ServerError');

    throw new ActionError(t('tooManyRequests'));
  }
};

/**
 * Refuses a visitor who sent too many contact messages in the window.
 * @throws ActionError with the translated refusal
 */
export const assertContactFormAllowed = () => assertNotLimited(isContactFormLimited);

/**
 * Refuses a visitor who tried to subscribe too many times in the window.
 * @throws ActionError with the translated refusal
 */
export const assertNewsletterFormAllowed = () => assertNotLimited(isNewsletterFormLimited);
