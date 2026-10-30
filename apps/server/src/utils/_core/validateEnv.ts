import {
  cleanEnv, makeValidator, port, str, url,
} from 'envalid';

import { MIN_OWNERS_COUNT } from '@/constants/_core/role.constants';
import { EnvEnum } from '@/types/app.type';

type Env = typeof process.env;

const nonEmptyStr = makeValidator((input: string): string => {
  if (!input.trim()) throw new Error('must not be empty');

  return input;
});

/*
 * a comma-separated list of at least MIN_OWNERS_COUNT distinct addresses: with a single owner, the
 * OWNER-only actions have no way back once that person loses their authenticator
 */
const ownersEmails = makeValidator((input: string): string => {
  const distinctEmails = new Set(
    input.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  );

  if (distinctEmails.size < MIN_OWNERS_COUNT) {
    throw new Error(`must list at least ${MIN_OWNERS_COUNT} distinct e-mail addresses`);
  }

  return input;
});

/*
 * the deployed environments, where the third parties are really called (SMS are sent, geocoding
 * is billed, the website cache is invalidated): development and test skip or fake them
 */
const isDeployed = (env: Env): boolean => (
  env.NODE_ENV === EnvEnum.PROD || env.NODE_ENV === EnvEnum.PREPROD
);

const validateEnv = (env: Env = process.env): void => {
  cleanEnv(env, {
    NODE_ENV: str(),
    PORT: port(),
    MONGO_URL: str(),
    PARSE_APP_ID: str(),
    PARSE_MASTER_KEY: str(),
    BREVO_API_KEY: str(),
    CLOUDINARY_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),
    SERVER_URL: url(),
    WEBSITE_URL: url(),
    REST_API_KEY: str(),
    CRYPTO_FIXED_PART_KEY: str(),
    CRYPTO_FIXED_FULL_KEY: str(),
    ADMIN_EMAIL_SENDER: str(),
    UPSTASH_REDIS_REST_URL: url(),
    UPSTASH_REDIS_REST_TOKEN: str(),
    UPSTASH_REDIS_URL: url(),
    /*
     * Verifies the website's contact and newsletter submissions (see recaptcha.utils.ts). No
     * default outside production, where a missing key must stop the boot rather than quietly
     * leave the two anonymous entry points unguarded; locally and in tests the check is skipped
     * altogether, so a developer needs no Google key to run the server.
     */
    RECAPTCHA_SECRET_KEY: str({ devDefault: '' }),
    /*
     * Hash of the Android build this server talks to, appended to verification SMS so the app
     * reads the code automatically (see sms.utils.cloud.ts). Optional everywhere: without it the
     * SMS is unchanged and the user taps the keyboard suggestion or types the code.
     */
    ANDROID_SMS_RETRIEVER_HASH: str({ default: '' }),
    /*
     * Expo access token sent with every push (see push.service.cloud.ts). Optional until
     * "enhanced push security" is enabled in the Expo dashboard; from then on a missing token
     * makes every push fail, so it must be set in each environment before flipping that switch.
     */
    EXPO_ACCESS_TOKEN: str({ default: '' }),
    /*
     * Passwords of the documentation sites served under /docs/<section> (see docs.route.ts). A
     * section without one is closed — the route answers 404 — so they are optional everywhere and
     * a missing value can never leave a section open.
     */
    DOCS_FEATURES_PASSWORD: str({ default: '' }),
    DOCS_BUSINESS_PASSWORD: str({ default: '' }),
    /*
     * MMSDuck key behind every SMS: sign-up codes, password resets, alerts. Without it each text is
     * refused and the member waits for a code that never comes, with nothing in the logs to say
     * why — so the environments that really send SMS refuse to boot without it. Development and
     * test only log the message, and need no key.
     */
    MMSDUCK_API_KEY: isDeployed(env) ? nonEmptyStr() : str({ default: '' }),
    /*
     * Shared secret that lets the server invalidate the website's CMS cache (see
     * revalidate.utils.ts); it must equal the website's REVALIDATE_SECRET. Without it the call is
     * skipped with a warning and published articles stay invisible on the site for up to an hour,
     * so the deployed environments refuse to start without it.
     */
    WEBSITE_REVALIDATE_SECRET: isDeployed(env) ? nonEmptyStr() : str({ default: '' }),
    /*
     * Incoming webhook of the staff's Slack alert channel (see slack.service.ts): SOS, tickets,
     * failed payments, failed jobs, morning summary. Optional everywhere: without it no message is
     * posted, and the e-mail of each alert still goes out — Slack is a second channel, not the
     * only one.
     */
    SLACK_ALERTS_WEBHOOK_URL: str({ default: '' }),
    /*
     * The back-office owners invited at boot (see ensureOwnerInvitationsExist). The deployed
     * environments refuse to start with fewer than two: a single owner who loses their
     * authenticator leaves the OWNER-only actions out of reach of everybody. Development and
     * test keep a single address, or none.
     */
    OWNERS_EMAILS: isDeployed(env) ? ownersEmails() : str({ default: '' }),
  });
};

export default validateEnv;
