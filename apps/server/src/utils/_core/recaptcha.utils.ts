import axios from 'axios';

import {
  IS_LOCAL, IS_TEST, RECAPTCHA_SCORE_THRESHOLD, RECAPTCHA_VERIFY_URL,
} from '@/constants/_core/constants';

import { logger } from './logger';

/**
 * Verifies a Google reCAPTCHA v3 token against Google's siteverify API.
 *
 * The website used to run this check on its own Next.js server and then write straight to
 * `POST /parse/classes/Contact`, which any script could call with the app id alone — the check
 * protected the form, not the collection. Verifying here, inside the only write path left open,
 * is what makes it protect the data.
 *
 * A token is single-use at Google's end, so it must be verified exactly once: the website
 * forwards its token rather than spending it first.
 */
export const verifyRecaptchaToken = async (token: string | undefined): Promise<boolean> => {
  /*
   * Local and test runs have no Google key and no real browser to mint a token — the check is
   * skipped rather than failed, so the contact form stays usable while developing. Everywhere
   * else a missing key fails closed.
   */
  if (IS_LOCAL || IS_TEST) return true;

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey || !token) return false;

  try {
    const response = await axios.post(
      RECAPTCHA_VERIFY_URL,
      new URLSearchParams({ secret: secretKey, response: token }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return !!response.data.success && response.data.score > RECAPTCHA_SCORE_THRESHOLD;
  }
  catch (error) {
    logger.error(`reCAPTCHA verification failed: ${(error as Error).message}`);
    return false;
  }
};
