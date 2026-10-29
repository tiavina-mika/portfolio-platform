import { z } from 'zod';

import i18n from '@/config/i18n';

import { dateForAdvancedSearchSchema } from './app.validations';

export const emailParamsSchema = z.object({
  email: z
    .string()
    .email({ message: i18n.t('form.error.required', { field: 'Email' }) })
    .trim()
    .min(1, i18n.t('form.error.required', { field: i18n.t('subject') }))
    .max(60, i18n.t('form.error.max', { field: i18n.t('subject'), number: 60 })),
});

export const sendEmailSchema = emailParamsSchema.extend({
  subject: z
    .string()
    .trim()
    .min(1, i18n.t('form.error.required', { field: i18n.t('subject') }))
    .max(60, i18n.t('form.error.max', { field: i18n.t('subject'), number: 60 })),
  message: z
    .string()
    .trim()
    .min(1, i18n.t('form.error.required', { field: i18n.t('message') }))
    .max(300, i18n.t('form.error.max', { field: i18n.t('message'), number: 300 })),
});

export const replyContactSchema = sendEmailSchema.pick({
  message: true,
});

export const contactFilterSchema = z.object({
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  name: z.string().optional(),
  email: z.string().optional(),
  active: z.array(z.boolean().optional()).optional(),
});
