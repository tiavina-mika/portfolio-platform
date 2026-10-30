import { z } from 'zod';

import { ROLE_NAMES_MAX_COUNT } from '@/constants/_core/role.constants';

import { emailFieldSchema } from './auth.validations';
import { localeFieldSchema } from './util.validations';

export const sendBOInvitationSchema = z.object({
  email: emailFieldSchema, // trimmed and lower-cased, like every other address
  roles: z.array(z.string()).min(1).max(ROLE_NAMES_MAX_COUNT),
  locale: localeFieldSchema.optional(),
});

export const verifyBOInvitationTokenSchema = z.object({
  token: z.string().nonempty(),
  locale: localeFieldSchema.optional(),
});
