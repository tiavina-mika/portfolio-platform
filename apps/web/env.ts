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
    RECAPTCHA_SECRET_KEY: z.string(),
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
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    APP_URL: process.env.APP_URL,
    TIME: process.env.TIME,
    // -------- client -------- //
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_MAP_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
});

export default env;
