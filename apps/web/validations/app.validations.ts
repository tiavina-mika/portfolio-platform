import { capitalize } from 'string-ts';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { locales } from '@/i18n/config';
import { getDynamicValidationError } from '@/utils/utils';

export const localeSchemaField = z.union([
  z.literal(locales[0]),
  z.literal(locales[1]),
]);

export const EmailFieldSchema = z
  .string()
  .email({ message: 'error.required' })
  .max(120, getDynamicValidationError('error.max', 120))
  .transform((value: string) => value.toLowerCase());

export const paginationSearchParamsSchema = z.object({
  page: z.string().optional().default('1'),
  // `desc` lists the newest first; anything else in the address falls back to it
  order: z.union([z.literal('asc'), z.literal('desc')]).catch('desc'),
  tag: z.string().optional(),
  category: z.string().optional(),
});

export const projectSearchParamsSchema = paginationSearchParamsSchema.extend({
  orderedBy: z.string().optional(),
  technologies: z.string().optional(),
  society: z.string().optional(),
});

export const ContactSchema = zfd.formData(
  z.object({
    email: EmailFieldSchema,
    name: zfd.text(
      z
        .string()
        .max(120, getDynamicValidationError('error.max', 120))
        .transform(capitalize)
    ),
    message: zfd.text(
      z
        .string()
        .max(500, getDynamicValidationError('error.max', 500))
    ),
  })
);

export const NewsletterSchema = zfd.formData(
  z.object({
    email: EmailFieldSchema,
    locale: z.string().optional(),
  })
);

/**
 * The address of the home page newsletter form, checked in the browser before the server action
 * (which checks it again with `NewsletterSchema`): an empty field and a malformed address each get
 * their own message, already translated by the caller
 */
export const createNewsletterEmailSchema = (messages: { required: string; invalid: string }) => z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: messages.required })
    .pipe(z.email({ error: messages.invalid })),
});

export const MultipleSelectSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

export const ResubscribeToNewsletterSchema = z.object({
  encryptedEmail: z.string(),
});

export const UnsubscribeReasonSchema = zfd.formData(
  z.object({
    reason: z.enum(['tooFrequent', 'notInterested', 'notRelevant', 'other'], {
      error: 'error.needToSelectOne',
    }),
    encryptedEmail: z.string().optional(),
  })
);

export const idSchema = z.string().min(1, 'error.dataNotExist');
