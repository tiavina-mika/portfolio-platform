import { z } from 'zod';

import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18next';

import { getEmailFieldSchema } from './auth.validation';


export const getContactSchema = (locale: Locale) => z.object({
  // email there is encrypted, so its a string
  email: getEmailFieldSchema(locale),
  name: z.string()
    .max(80, locale ? translate('error.max', locale, { field: translate('user:name'), number: '80' }) : 'Title too long'),
  message: z.string()
    .max(1000, locale ? translate('error.max', locale, { field: translate('user:message'), number: '1000' }) : 'Message too long'),
});
