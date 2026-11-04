/*
 * Placeholder values for the environment variables `env.ts` requires. No story talks to a server, but
 * the validation runs as soon as a module imports `env`, and a machine without the `.env` files — CI,
 * a fresh clone — would otherwise fail before rendering anything. A real value (`.env.local`) always
 * wins: these are only applied to what is unset.
 */
export const STORYBOOK_ENV: Record<string, string> = {
  PARSE_APP_ID: 'storybook',
  REST_API_KEY: 'storybook',
  SERVER_URL: 'http://localhost:1337/parse',
  APP_URL: 'http://localhost:6016',
  NEXT_PUBLIC_SERVER_URL: 'http://localhost:1337/parse',
  NEXT_PUBLIC_APP_URL: 'http://localhost:6016',
  NEXT_PUBLIC_GOOGLE_MAP_KEY: 'storybook',
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: 'storybook',
};

export const applyStorybookEnv = (): void => {
  Object.entries(STORYBOOK_ENV).forEach(([key, value]) => {
    process.env[key] ??= value;
  });
};
