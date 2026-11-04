/**
 * Loads the shared env file (`.env.prod` when APP_ENV is production, `.env.preprod` otherwise) for
 * local runs. `process.loadEnvFile` never overrides a variable that is already set, and Next.js has
 * already read `.env.local` by then, so `.env.local` only needs the values that differ locally
 * (the URLs). On a host the files do not exist and the variables come from the host.
 */
const fileName = process.env.APP_ENV === 'production' ? '.env.prod' : '.env.preprod';

try {
  process.loadEnvFile(fileName);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
