import env from '@/env';
import { APP_NAME, EMAIL, SOCIALS } from '@/utils/constants';

export const siteConfig = {
  name: APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  author: APP_NAME,
  keywords: [
    'développement web',
    'développement mobile',
    'startup',
    'prix fixe',
    'MVP',
    'back-office',
    'web development',
    'mobile app development',
    'fixed price',
    'Madagascar',
  ],
  email: EMAIL,
  social: Object.fromEntries(SOCIALS.map(social => [social.label, social.value])),
};

export type SiteConfig = typeof siteConfig;
