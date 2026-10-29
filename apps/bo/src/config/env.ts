import * as z from 'zod';

const envSchema = z.object({
  VITE_SERVER_URL: z.url(),
  VITE_PARSE_APP_ID: z.string().min(1),
  VITE_APP_ACCESS_TAG: z.string().min(1),
});

/**
 * Stops the back-office at startup when a variable it cannot reach the server without is missing,
 * instead of showing a page that fails on every request. Only the names are reported, never a value.
 */
export const validateEnv = (): void => {
  const result = envSchema.safeParse({
    VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
    VITE_PARSE_APP_ID: import.meta.env.VITE_PARSE_APP_ID,
    VITE_APP_ACCESS_TAG: import.meta.env.VITE_APP_ACCESS_TAG,
  });

  if (result.success) return;

  const invalidNames = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];

  throw new Error(`Missing or invalid environment variables: ${invalidNames.join(', ')}`);
};
