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
 * run yarn analyze, this will open 3 tabs in your browser.
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
  productionBrowserSourceMaps: true,
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default withNextIntlConfig(withBundleAnalyzerConfig(nextConfig));
