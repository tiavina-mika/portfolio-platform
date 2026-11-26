import { z } from 'zod';

import {
  emailFieldSchema,
} from './auth.validations';
import { firstNameFieldSchema, lastNameFieldSchema } from './user.validations';
import { workspaceFieldSchema } from './util.validations';

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
  // the website the link was opened on: the portfolio's when left out
  target: workspaceFieldSchema,
  locale: z.string().optional(),
});

export const addUnsubscribeNewsletterSchema = z.object({
  encryptedEmail: encryptedEmailFieldSchema,
  target: workspaceFieldSchema,
  reason: z.enum(['tooFrequent', 'notInterested', 'notRelevant', 'other']),
  locale: z.string().optional(),
});
