import { z } from 'zod';

import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18next';

import { localeFieldSchema } from './util.validation';

export const lastNameFieldSchema = z
  .string()
  .min(1, 'user:serverErrors.lastNameRequired')
  .max(112, 'user:serverErrors.nameMax');

export const firstNameFieldSchema = z
  .string()
  .max(112, 'user:serverErrors.nameMax')
  .optional();

export const passwordFieldSchema = z
  .string()
  .min(8, 'Password should have at least 8 characters')
  .max(64, 'Password should have 64 characters maximum');

export const emailFieldSchema = z.string()
  .nonempty('common:form.error.requiredEmail')
  .email('common:form.error.invalidEmail')
  .refine(value => value.toLowerCase());

export const getEmailFieldSchema = (locale: Locale) => z.string()
  .nonempty(locale ? translate('error.requiredEmail', locale) : 'common:form.error.requiredEmail')
  .email(locale ? translate('error.invalidEmail', locale) : 'common:form.error.invalidEmail')
  .refine(value => value.toLowerCase());

export const getEmailSchema = (locale: Locale) => z.object({
  email: getEmailFieldSchema(locale),
  locale: z.union([z.literal('fr'), z.literal('en'), z.literal('mg')]),
});

export const getVerifyEmailSchema = (locale: Locale) => {
  return z.object({
    email: getEmailFieldSchema(locale),
    locale: localeFieldSchema.optional(),
  });
};

export const UserIdSchema = z.object({
  userId: z.string()
    .nonempty('common:form.error.userRequired'),
});

export const getResetPasswordSchema = (locale: Locale) => z.object({
  // email there is encrypted, so its a string
  email: getEmailFieldSchema(locale),
  password: z.string()
    .min(8, locale ? translate('error.min', locale, { field: translate('user:password'), number: '8' }) : 'common:form.error.passwordMin')
    .max(64, locale ? translate('error.max', locale, { field: translate('user:password'), number: '64' }) : 'common:form.error.passwordMax'),
});

export const getVerifyAccountEmailSchema = (locale: Locale) => z.object({
  code: z.string()
    .nonempty(translate('error.required', locale, { field: translate('code') }))
    .length(6, translate('error.max', locale, { field: translate('code'), number: '6' })),
  type: z.union([z.literal('accountVerification'), z.literal('resetPassword')]),
});

export const getEncryptedEmailSchema = (locale: Locale) => z.object({
  encryptedEmail: z.string()
    .nonempty(translate('error.required', locale, { field: translate('user:email') })),
  locale: localeFieldSchema.optional(),
});
