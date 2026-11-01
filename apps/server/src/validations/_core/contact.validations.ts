import { CONTACT_MESSAGE_MAX_LENGTH } from '@shared/constants';
import { z } from 'zod';

import {
  paginationQuerySchema, dateRangeFieldSchema, includeFieldSchema, objectIdFieldSchema,
} from './util.validations';

/**
 * The public website's form: its visitor has no account, so they say who they are, and the
 * reCAPTCHA token stands in for the missing session.
 */
export const createPublicContactSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120),
  message: z.string().max(CONTACT_MESSAGE_MAX_LENGTH),
  acceptNewsLetter: z.boolean().optional(),
  locale: z.string().optional(),
  recaptchaToken: z.string().nonempty().max(4000),
});

export const subscribeToNewsletterSchema = z.object({
  email: z.string().email(),
  language: z.string().max(10).optional(),
  recaptchaToken: z.string().nonempty().max(4000),
});

// the random token of the double opt-in link (32 bytes, hex)
export const confirmNewsletterSubscriptionSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  locale: z.string().max(10).optional(),
});

const contactsFiltersSchema = z.object({
  deleted: z.boolean().optional(),
}).optional();

/*
 * `search` also matches arbitrary key/value pairs against Contact fields
 * (see `Object.keys(search).forEach` in getContacts) — `.catchall()` accepts those
 * dynamic keys on top of the well-known ones below
 */
const contactsSearchSchema = z.object({
  text: z.string().optional(),
  createdAt: dateRangeFieldSchema.optional(),
  updatedAt: dateRangeFieldSchema.optional(),
}).catchall(z.union([z.string(), z.boolean()])).optional();

export const getContactsSchema = paginationQuerySchema.extend({
  filters: contactsFiltersSchema,
  search: contactsSearchSchema,
  include: includeFieldSchema,
});

export const getContactSchema = z.object({
  id: objectIdFieldSchema,
  include: includeFieldSchema,
});
