import { z } from 'zod';

import { TEST_EMAIL_LOCALES, TEST_EMAIL_TEMPLATES } from '@/constants/_core/testEmail.constants';

export const testEmailSchema = z.object({
  template: z.enum(TEST_EMAIL_TEMPLATES),
  to: z.string().email().trim(),
  firstName: z.string().trim().optional(),
  sender: z.string().email().optional(),
  locale: z.enum(TEST_EMAIL_LOCALES),
});
