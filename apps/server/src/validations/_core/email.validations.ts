import { z } from 'zod';

import {
  emailFieldSchema,
} from './auth.validations';
import { firstNameFieldSchema, lastNameFieldSchema } from './user.validations';

export const secureCodeEmailSchema = z.object({
  email: emailFieldSchema,
  firstName: firstNameFieldSchema,
  lastName: lastNameFieldSchema,
});

const encryptedEmailFieldSchema = z.string()
  .nonempty()
  .max(150);

export const unsubscribeNewsletterSchema = z.object({
  encryptedEmail: encryptedEmailFieldSchema,
  locale: z.string().optional(),
});

export const addUnsubscribeNewsletterSchema = z.object({
  encryptedEmail: encryptedEmailFieldSchema,
  reason: z.enum(['tooFrequent', 'notInterested', 'notRelevant', 'other']),
  locale: z.string().optional(),
});
