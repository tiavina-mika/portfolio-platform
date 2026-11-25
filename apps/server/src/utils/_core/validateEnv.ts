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
 * an optional URL: a line left empty in the env file (as `.env.example` ships it) is "not set", which
 * the plain `url()` refuses and would stop the boot
 */
const optionalUrl = makeValidator((input: string): string => {
  if (!input.trim()) return '';

  new URL(input);

  return input;
});

const AES_256_KEY_BYTES = 32;

/*
 * the static key goes straight into aes-256-ctr, which refuses anything but exactly 32 bytes:
 * a trailing newline pasted with the secret is enough to break every MFA check and verification
 * code at runtime with "Invalid key length", so the boot stops on it instead
 */
const aes256Key = makeValidator((input: string): string => {
  if (Buffer.byteLength(input) !== AES_256_KEY_BYTES) {
    throw new Error(`must be exactly ${AES_256_KEY_BYTES} bytes (no space or line break around it)`);
  }

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

/*
 * variables that only work as a set: the agency's Brevo key without its sender mails from an address its
 * account has not verified, and a Cloudinary name without its secret cannot upload at all. A half-set
 * group stops the boot instead of failing on the first mail or upload.
 */
const AGENCY_VARIABLE_GROUPS = [
  ['AGENCY_BREVO_API_KEY', 'AGENCY_ADMIN_EMAIL_SENDER'],
  ['AGENCY_CLOUDINARY_NAME', 'AGENCY_CLOUDINARY_API_KEY', 'AGENCY_CLOUDINARY_API_SECRET'],
] as const;

const assertAgencyGroupsComplete = (env: Env): void => {
  for (const group of AGENCY_VARIABLE_GROUPS) {
    const setCount = group.filter((name) => !!env[name]?.trim()).length;

    if (setCount > 0 && setCount < group.length) {
      throw new Error(`${group.join(', ')} must be set together (or all left empty)`);
    }
  }
};

const validateEnv = (env: Env = process.env): void => {
  assertAgencyGroupsComplete(env);

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
    /*
     * The agency workspace's own back-office domain, website and e-mail name. Optional everywhere:
     * while one is unset, the matching portfolio value is used (see getServerUrl, getClientUrl,
     * getAppName), so a portfolio-only deployment configures nothing.
     */
    AGENCY_SERVER_URL: optionalUrl({ default: '' }),
    AGENCY_WEBSITE_URL: optionalUrl({ default: '' }),
    AGENCY_APP_NAME: str({ default: '' }),
    /*
     * The agency's own administrators, invited at boot from its domain with its e-mail frame and given the
     * AGENCY_ADMIN role: every right, in the agency workspace only. Optional and on top of OWNERS_EMAILS,
     * which keeps its own minimum.
     */
    AGENCY_OWNERS_EMAILS: str({ default: '' }),
    /*
     * The agency's own Brevo account and the sender verified in it. Optional: while unset the portfolio's
     * key and sender are used. Set both together — a key without its sender would send from an address
     * the agency's Brevo account has not verified, and Brevo refuses the mail.
     */
    AGENCY_BREVO_API_KEY: str({ default: '' }),
    AGENCY_ADMIN_EMAIL_SENDER: str({ default: '' }),
    /*
     * The agency's own Cloudinary account. Optional: while unset its files go to the portfolio's account.
     * All three are set together or none (checked below): files are uploaded to it and found again by
     * the cloud name in their address.
     */
    AGENCY_CLOUDINARY_NAME: str({ default: '' }),
    AGENCY_CLOUDINARY_API_KEY: str({ default: '' }),
    AGENCY_CLOUDINARY_API_SECRET: str({ default: '' }),
    REST_API_KEY: str(),
    CRYPTO_FIXED_PART_KEY: str(),
    CRYPTO_FIXED_FULL_KEY: aes256Key(),
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
     * Passwords of the documentation sites served under /docs/<section> (see docs.route.ts). A
     * section without one is closed — the route answers 404 — so they are optional everywhere and
     * a missing value can never leave a section open.
     */
    DOCS_FEATURES_PASSWORD: str({ default: '' }),
    DOCS_BUSINESS_PASSWORD: str({ default: '' }),
    /*
     * MMSDuck key behind every SMS. Optional everywhere: without it each text is refused with a
     * warning in the logs (see mmsduck.service.ts) and development and test only log the message.
     * A portfolio that sends no SMS needs no provider account.
     */
    MMSDUCK_API_KEY: str({ default: '' }),
    /*
     * Shared secret that lets the server invalidate the website's CMS cache (see
     * revalidate.utils.ts); it must equal the website's REVALIDATE_SECRET. Without it the call is
     * skipped with a warning and published articles stay invisible on the site for up to an hour,
     * so the deployed environments refuse to start without it.
     */
    WEBSITE_REVALIDATE_SECRET: isDeployed(env) ? nonEmptyStr() : str({ default: '' }),
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
