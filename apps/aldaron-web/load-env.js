/**
 * Loads `.env.local` first, then the shared env file (`.env.prod` when APP_ENV is production,
 * `.env.preprod` otherwise) for local runs. `process.loadEnvFile` never overrides a variable that is
 * already set, so loading `.env.local` first lets it win over the shared file: it only needs the
 * values that differ locally (the URLs). This must happen here and not be left to Next.js, because
 * `server.js` runs this file before Next.js reads `.env.local`, and Next.js never overrides a
 * variable already present in `process.env`. On a host the files do not exist and the variables come
 * from the host.
 */
const fileNames = ['.env.local', process.env.APP_ENV === 'production' ? '.env.prod' : '.env.preprod'];

for (const fileName of fileNames) {
  try {
    process.loadEnvFile(fileName);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
