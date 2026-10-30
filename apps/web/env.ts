import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const env = createEnv({
  /*
   * Server side Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    APP_ENV: z.enum(['development', 'preProduction', 'production']).default('development'),
    PARSE_APP_ID: z.string(),
    SERVER_URL: z.string().url(),
    REST_API_KEY: z.string(),
    /*
     * shared secret checked by app/api/revalidate — called by apps/server (WEBSITE_REVALIDATE_SECRET)
     * to invalidate CMS cache tags. Optional so local dev doesn't require it: while unset, the
     * revalidate endpoint stays permanently unauthorized (fails closed) instead of failing to boot.
     */
    REVALIDATE_SECRET: z.string().optional(),
    /*
     * Upstash Redis behind the per-visitor limit of the contact and newsletter forms. Optional so
     * local dev runs without it: while unset, those forms are simply not limited on the website
     * (the API server still applies its own, website-wide limit).
     */
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    APP_URL: z.string().url(),
    // defined only in scripts using cross-env, not defined in .env files
    TIME: z.enum(['build', 'run']).optional(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_SERVER_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_MAP_KEY: z.string(),
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string(),
    // GA4 measurement id — absent = analytics disabled (kept unset in dev local)
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    // -------- server -------- //
    APP_ENV: process.env.APP_ENV,
    PARSE_APP_ID: process.env.PARSE_APP_ID,
    SERVER_URL: process.env.SERVER_URL,
    REST_API_KEY: process.env.REST_API_KEY,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    APP_URL: process.env.APP_URL,
    TIME: process.env.TIME,
    // -------- client -------- //
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_MAP_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
});

export default env;
