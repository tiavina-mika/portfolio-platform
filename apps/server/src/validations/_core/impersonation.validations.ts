import { z } from 'zod';

import { localeFieldSchema } from './util.validations';

export const impersonateUserSchema = z.object({
  userId: z.string().nonempty(),
  reason: z.string().min(5).max(500),
  locale: localeFieldSchema.optional(),
});

export const endImpersonationSessionSchema = z.object({
  sessionId: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});
