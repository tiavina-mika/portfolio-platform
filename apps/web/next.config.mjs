import { fileURLToPath } from 'node:url';

import withBundleAnalyzer from '@next/bundle-analyzer';
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
  productionBrowserSourceMaps: false,
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
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

export default withNextIntlConfig(withBundleAnalyzerConfig(nextConfig));
