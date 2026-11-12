import { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';
import { THEME_COLORS } from '@/utils/constants';

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.keywords.join(', '),
    start_url: '/',
    display: 'standalone',
    background_color: THEME_COLORS.paper,
    theme_color: THEME_COLORS.ink,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
};

export default manifest;
