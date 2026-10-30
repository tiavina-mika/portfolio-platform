import { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.keywords.join(', '),
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#202020',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/images/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
};

export default manifest;
