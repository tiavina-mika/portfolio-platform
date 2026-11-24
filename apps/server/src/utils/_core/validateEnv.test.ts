import { describe, expect, it } from 'vitest';

import validateEnv from './validateEnv';

type Env = Parameters<typeof validateEnv>[0];

describe('agency variables of the environment', () => {
  it.each([
    ['a Brevo key without its sender', { AGENCY_BREVO_API_KEY: 'key' }],
    ['a sender without its Brevo key', { AGENCY_ADMIN_EMAIL_SENDER: 'hello@agency.test' }],
    ['a Cloudinary name without its key and secret', { AGENCY_CLOUDINARY_NAME: 'cloud' }],
    ['a Cloudinary name and key without the secret', {
      AGENCY_CLOUDINARY_NAME: 'cloud', AGENCY_CLOUDINARY_API_KEY: 'key',
    }],
  ])('should refuse %s', (_label, env) => {
    expect(() => validateEnv(env as Env)).toThrow('must be set together');
  });
});
