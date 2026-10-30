import { MAX_IMAGE_SIZE } from '@shared/constants';
import { v2 as cloudinary }  from 'cloudinary';
import type { CorsOptions } from 'cors';
// use local disk for multer uploaded files

import multer from "multer";

import {
  BO_DEV_PORT, IS_E2E, IS_LOCAL, MAX_FILES_UPLOAD, MOBILE_STORYBOOK_DEV_PORT, MOBILE_WEB_DEV_PORT,
  WEB_DEV_PORT,
} from '@/constants/_core/constants';
import { getClientUrl } from '@/utils/_core/utils';

/*
 * it's just temporary, after it uploaded to the cloud (cloudinary), the local files will be deleted
 *
 * `limits` is not optional here: memory storage means the whole upload is buffered in the server
 * process before anything looks at it, so without a cap a single request could hold hundreds of
 * megabytes of RAM. MAX_IMAGE_SIZE is the same ceiling the clients announce to the user, and
 * `files` matches the route's own `array('files', MAX_FILES_UPLOAD)` so an over-long list is
 * rejected before it is read rather than silently truncated.
 */
export const multerConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE * 1024 * 1024,
    files: MAX_FILES_UPLOAD,
  },
});

export const initializeCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
};

/**
 * Helmet Content Security Policy configuration
 * Useful when building a client JS app that loads assets from different origins
 * But served from the same server as the API
 * e.g., images from Cloudinary, styles from Google Fonts, etc.
 */
export const helmetContentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: [
      "'self'",
      "data:", // Used in bundled JS files
      "https://res.cloudinary.com", // Used in bundled JS files
      "blob:", // Used in bundled JS files
      // the share card the website generates, shown in the SEO preview of the content forms
      ...(getClientUrl() ? [getClientUrl()] : []),
    ],

    connectSrc: [
      "'self'",
      "https://res.cloudinary.com",
      // the BO reports its errors to Sentry (EU region, one ingest sub-domain per Sentry account)
      "https://*.ingest.de.sentry.io",
    ],

    // no inline <script> in the BO build (Vite only emits external module scripts), so this can stay strict
    scriptSrc: ["'self'"],

    // MUI/Emotion/styled-components inject <style> tags at runtime with no nonce support in
    // this static (non-SSR) build, so 'unsafe-inline' can't be dropped without adding per-request
    // HTML templating to thread a CSP nonce through the emotion/styled-components cache
    styleSrc: ["'self'", "'unsafe-inline'"],
    styleSrcElem: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdnjs.cloudflare.com'
    ],
    
    // Fonts (woff2 files etc.)
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.gstatic.com'  // for Roboto and DM Sans
    ],
    
    objectSrc: ["'none'"],
  },
};

/** The local dev ports allowed to call this server, each on localhost and on the LAN address. */
const LOCAL_DEV_PORTS = [
  WEB_DEV_PORT,
  BO_DEV_PORT,
  MOBILE_WEB_DEV_PORT,
  MOBILE_STORYBOOK_DEV_PORT,
];

/**
 * CORS allowlist.
 * The BO admin panel is served by this same server in prod/preprod (same-origin, no CORS
 * needed) but runs on its own Vite dev server locally — hence the extra BO_DEV_PORT origin.
 *
 * The mobile app sends no `Origin` when it runs on a device, so CORS does not apply to it there.
 * It does when it runs in a browser — `expo start --web` and its Storybook — and both are listed
 * as well: otherwise the preflight of any call carrying `x-portfolio-key` is refused, and the
 * failure surfaces only as a form that quietly declines to fill itself.
 *
 * Local dev only: production serves the client from its own origin, and a browser-run mobile app
 * is a development tool, never something deployed.
 */
const getCorsOrigins = (): string[] => {
  // the E2E runner owns its ports, so it passes the exact origins it serves the clients from
  if (IS_E2E) return (process.env.E2E_ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);

  if (IS_LOCAL) {
    return LOCAL_DEV_PORTS.flatMap(port => [
      `http://${process.env.LOCAL_NETWORK_HOSTNAME}:${port}`,
      `http://localhost:${port}`,
    ]);
  }

  return [getClientUrl()];
};

export const corsOptions: CorsOptions = { origin: getCorsOrigins() };
