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
  .refine((value: string) => value.toLowerCase());

export const paginationSearchParamsSchema = z.object({
  page: z.string().optional().default('1'),
  orderedBy: z.string().optional(),
  order: z
    .union([z.literal('asc'), z.literal('desc')])
    .optional()
    .default('asc'),
  tag: z.string().optional(),
  category: z.string().optional(),
});

export const projectSearchParamsSchema = paginationSearchParamsSchema.extend({
  technologies: z.string().optional(),
  types: z.string().optional(),
  search: z.string().optional(),
});

export const ContactSchema = zfd.formData(
  z.object({
    email: EmailFieldSchema,
    name: zfd.text(
      z
        .string()
        .max(120)
        .transform(capitalize)
    ),
    message: zfd.text(
      z
        .string()
        .max(500)
        .optional()
    ),
    // // to be passed as parse server context
  })
);

export const NewsletterSchema = zfd.formData(
  z.object({
    email: EmailFieldSchema,
    locale: z.string().optional(),
  })
);

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
