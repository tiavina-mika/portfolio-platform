import { z } from 'zod';

import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18next';

import { getEmailFieldSchema } from './auth.validation';

export const RoleNamesSchema = z.array(z.string());

export const SaveLanguageSchema = z.object({
  locale: z.string(),
  userId: z.string(),
});

/**
 * user creation is not the same for the backoffice and the website or mobile app
 * @param locale
 * @returns
 */
export const getSignUpFromBOSchema = (locale: Locale) => {
  const schema = z.object({
    email: getEmailFieldSchema(locale),
    lastName: z.string()
      .max(112, translate('error.max', locale, { field: translate('user:lastName'), number: '112' })),
    firstName: z.string()
      .max(112, translate('error.max', locale, { field: translate('user:firstName'), number: '112' }))
      .optional(),
    password: z.string()
      .min(8, translate('error.min', locale, { field: translate('user:password'), number: '8' }))
      .max(64, translate('error.max', locale, { field: translate('user:password'), number: '64' })),
  });

  return schema;
};

/**
 * sign up schema for the website or mobile app
 * extends the backoffice schema
 * @param locale
 * @returns
 */
export const getSignUpSchema = (locale: Locale) => {
  const schema = getSignUpFromBOSchema(locale);

  return schema;
};
