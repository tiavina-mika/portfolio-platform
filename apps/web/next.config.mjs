/* eslint-disable @cspell/spellchecker */
import { fileURLToPath } from 'node:url';

import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs/config';
import { createJiti } from 'jiti';
import createNextIntlPlugin from 'next-intl/plugin';

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files
jiti('./env');

// load i18n config
const withNextIntlConfig = createNextIntlPlugin();

/**
 * see bundle size.
 * run pnpm analyze, this will open 3 tabs in your browser.
 * @see: https://www.npmjs.com/package/@next/bundle-analyzer
 */

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
    ],
  },
  /*
   * Sentry needs the maps to exist at build time to upload them (see `withSentry`), which then deletes
   * them: they are generated only when they will be uploaded, so none is ever served to a visitor.
   */
  productionBrowserSourceMaps: Boolean(process.env.SENTRY_AUTH_TOKEN),
  cacheComponents: true,
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  /*
   * Permanent redirects from the paths the site used before it adopted the blog / contact route
   * names, so the links already indexed or shared keep working
   */
  redirects: () => [
    { source: '/:locale(fr|en)/articles', destination: '/:locale/blog', permanent: true },
    { source: '/:locale(fr|en)/articles/:path*', destination: '/:locale/blog/:path*', permanent: true },
    { source: '/en/contact-me', destination: '/en/contact', permanent: true },
    { source: '/fr/contactez-moi', destination: '/fr/contact', permanent: true },
  ],
  headers: () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/fonts/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
};

/*
 * Uploads the source maps at build time, and only when SENTRY_AUTH_TOKEN is set: without it the build
 * succeeds and the stack traces of production stay minified. The maps are deleted once uploaded so
 * they are never served.
 */
const withSentry = (config) =>
  withSentryConfig(config, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    telemetry: false,
    widenClientFileUpload: true,
    sourcemaps: { deleteSourcemapsAfterUpload: true },
  });

export default withSentry(withNextIntlConfig(withBundleAnalyzerConfig(nextConfig)));
