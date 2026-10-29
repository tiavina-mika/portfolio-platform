import { z } from 'zod';

import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18next';

import {
  emailFieldSchema, firstNameFieldSchema, getEmailFieldSchema, lastNameFieldSchema,
} from './auth.validation';

export const secureCodeEmailSchema = z.object({
  email: emailFieldSchema,
  firstName: firstNameFieldSchema,
  lastName: lastNameFieldSchema,
});

const getEncryptedEmailFieldSchema = (locale: Locale) => z.string()
  .nonempty({ message: translate('email.emailNotFound', locale) })
  .max(150);

export const getUnsubscribeNewsletterSchema = (locale: Locale) => z.object({
  encryptedEmail: getEncryptedEmailFieldSchema(locale),
  locale: z.string().optional(),
});

export const addUnsubscribeNewsletterSchema = (locale: Locale) => z.object({
  encryptedEmail: getEncryptedEmailFieldSchema(locale),
  reason: z.enum(['tooFrequent', 'notInterested', 'notRelevant', 'other'], {
    message: translate('email.reasonRequired', locale),
  }),
  locale: z.string().optional(),
});

export const getContactSchema = (locale: Locale) => z.object({
  email: getEmailFieldSchema(locale),
  name: z.string()
    .max(120, translate('error.max', locale, { field: translate('user:name'), number: '120' })),
  message: z.string()
    .max(500, translate('error.max', locale, { field: translate('user:message'), number: '500' })),
});
