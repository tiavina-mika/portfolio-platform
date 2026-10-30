import { z } from 'zod';

import { TEST_EMAIL_LOCALES } from '@/constants/_core/testEmail.constants';

export const testSmsSchema = z.object({
  to: z.string().trim().nonempty(),
  locale: z.enum(TEST_EMAIL_LOCALES),
});
